'use strict';

/**
 * Gemini (Google) Dispatch Adapter (Path B — Vertex AI Batch/Parallel)
 *
 * Google's Gemini CLI/IDE with Vertex AI integration.
 * Primary models: Gemini 2.5 Pro, Gemini 2.0 Flash
 * Secondary: Anthropic Claude (via Vertex AI Model Garden), OpenAI (via API)
 *
 * Capabilities:
 *   - Parallel subagents via Vertex AI batch prediction (max 3 concurrent)
 *   - Multi-model: Gemini native + Claude on Vertex + OpenAI via API
 *   - 1M context window (largest of all providers)
 *   - Thinking budget for extended reasoning
 *   - Grounding with Google Search
 *
 * Hook enforcement: SCRIPT (hooks.sh — skill must call it)
 */

var BaseAdapter = require('./adapter-base.cjs');
var providers = require('../router/providers.cjs');

function GeminiAdapter(config) {
  BaseAdapter.call(this, 'gemini', config);
  this.projectId = config.gcp_project || '';
  this.location = config.gcp_location || 'us-central1';
}
GeminiAdapter.prototype = Object.create(BaseAdapter.prototype);
GeminiAdapter.prototype.constructor = GeminiAdapter;

/**
 * Dispatch a single agent via Gemini API or Vertex AI.
 */
GeminiAdapter.prototype.dispatchAgent = function(task) {
  var invocation = this._buildInvocation(task);

  return {
    type: invocation.type,
    command: invocation.command,
    metadata: {
      agentId: task.agentId,
      model: task.model,
      provider: task.provider,
      effort: task.effort,
      phase: task.phase,
    },
  };
};

/**
 * Dispatch multiple agents in parallel via Vertex AI.
 */
GeminiAdapter.prototype.dispatchParallel = function(tasks) {
  var self = this;
  var maxParallel = this.parallel.max; // 3

  var batches = [];
  for (var i = 0; i < tasks.length; i += maxParallel) {
    batches.push(tasks.slice(i, i + maxParallel));
  }

  return {
    type: 'vertex_ai_parallel_batch',
    batches: batches.map(function(batch, batchIdx) {
      return {
        batchIndex: batchIdx,
        agents: batch.map(function(task) {
          return self._buildInvocation(task);
        }),
        syncBarrier: true,
      };
    }),
    totalAgents: tasks.length,
    totalBatches: batches.length,
    shellScript: self._generateParallelScript(tasks),
  };
};

/**
 * Build multi-model plan leveraging Vertex AI Model Garden.
 */
GeminiAdapter.prototype.buildMultiModelPlan = function(agents, phase) {
  return agents.map(function(agentId) {
    var assignment = providers.assignMultiModelAgent('gemini', agentId, 'default');
    return {
      agentId: agentId,
      model: assignment.model,
      provider: assignment.provider,
      reason: assignment.reason,
      phase: phase,
    };
  });
};

/**
 * Build invocation for a task — routes to appropriate API.
 */
GeminiAdapter.prototype._buildInvocation = function(task) {
  switch (task.provider) {
    case 'google':
      return this._buildGeminiInvocation(task);
    case 'anthropic':
      return this._buildVertexClaudeInvocation(task);
    case 'openai':
      return this._buildOpenAIInvocation(task);
    default:
      return this._buildGeminiInvocation(task);
  }
};

/**
 * Build Gemini API request.
 */
GeminiAdapter.prototype._buildGeminiInvocation = function(task) {
  var prompt = this._buildAgentPrompt(task);
  var requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.3,
    },
  };

  // Enable thinking for heavy tasks
  if (task.effort === 'high' || task.effort === 'max') {
    requestBody.generationConfig.thinkingConfig = { thinkingBudget: 16384 };
  }

  // Enable grounding with Google Search for research agents
  if (task.agentId === 'oracle') {
    requestBody.tools = [{ googleSearch: {} }];
  }

  var endpoint = this.projectId
    ? 'https://' + this.location + '-aiplatform.googleapis.com/v1/projects/' + this.projectId + '/locations/' + this.location + '/publishers/google/models/' + task.model + ':generateContent'
    : 'https://generativelanguage.googleapis.com/v1beta/models/' + task.model + ':generateContent?key=$GOOGLE_API_KEY';

  return {
    type: 'gemini_api',
    agentId: task.agentId,
    command: 'curl -s "' + endpoint + '"'
      + ' -H "Content-Type: application/json"'
      + (this.projectId ? ' -H "Authorization: Bearer $(gcloud auth print-access-token)"' : '')
      + ' -d \'' + JSON.stringify(requestBody) + '\'',
    outputFile: 'squad-method/output/.run/' + task.agentId + '-' + task.phase + '.json',
  };
};

/**
 * Build Vertex AI Claude invocation (Anthropic models on Google Cloud).
 */
GeminiAdapter.prototype._buildVertexClaudeInvocation = function(task) {
  var prompt = this._buildAgentPrompt(task);
  var modelId = task.model.replace('claude-', '');
  var requestBody = {
    anthropic_version: 'vertex-2023-10-16',
    max_tokens: 4096,
    messages: [{ role: 'user', content: prompt }],
  };

  if (task.effort === 'high' || task.effort === 'max') {
    requestBody.thinking = { type: 'enabled', budget_tokens: 8192 };
  }

  var endpoint = 'https://' + this.location + '-aiplatform.googleapis.com/v1/projects/'
    + this.projectId + '/locations/' + this.location
    + '/publishers/anthropic/models/' + task.model + ':rawPredict';

  return {
    type: 'vertex_claude',
    agentId: task.agentId,
    command: 'curl -s "' + endpoint + '"'
      + ' -H "Content-Type: application/json"'
      + ' -H "Authorization: Bearer $(gcloud auth print-access-token)"'
      + ' -d \'' + JSON.stringify(requestBody) + '\'',
    outputFile: 'squad-method/output/.run/' + task.agentId + '-' + task.phase + '.json',
  };
};

/**
 * Build OpenAI API invocation.
 */
GeminiAdapter.prototype._buildOpenAIInvocation = function(task) {
  var prompt = this._buildAgentPrompt(task);
  var requestBody = {
    model: task.model,
    messages: [
      { role: 'system', content: 'You are SQUAD agent: ' + task.agentId },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4096,
    temperature: 0.3,
  };

  return {
    type: 'openai_api',
    agentId: task.agentId,
    command: 'curl -s https://api.openai.com/v1/chat/completions'
      + ' -H "Authorization: Bearer $OPENAI_API_KEY"'
      + ' -H "Content-Type: application/json"'
      + ' -d \'' + JSON.stringify(requestBody) + '\'',
    outputFile: 'squad-method/output/.run/' + task.agentId + '-' + task.phase + '.json',
  };
};

/**
 * Generate parallel dispatch shell script.
 */
GeminiAdapter.prototype._generateParallelScript = function(tasks) {
  var self = this;
  var lines = ['#!/bin/bash', 'set -euo pipefail', ''];
  lines.push('# SQUAD Gemini Parallel Dispatch — ' + tasks.length + ' agents');
  lines.push('RUN_DIR="squad-method/output/.run"');
  lines.push('mkdir -p "$RUN_DIR"');
  lines.push('PIDS=()');
  lines.push('');

  tasks.forEach(function(task) {
    var inv = self._buildInvocation(task);
    lines.push('# Agent: ' + task.agentId + ' → ' + task.provider + '/' + task.model);
    lines.push('(' + inv.command + ' > "$RUN_DIR/' + task.agentId + '.json" 2>&1) &');
    lines.push('PIDS+=($!)');
    lines.push('');
  });

  lines.push('FAILURES=0');
  lines.push('for pid in "${PIDS[@]}"; do');
  lines.push('  wait "$pid" || FAILURES=$((FAILURES + 1))');
  lines.push('done');
  lines.push('echo "Gemini dispatch: ' + tasks.length + ' agents, $FAILURES failures"');

  return lines.join('\n');
};

GeminiAdapter.prototype._buildAgentPrompt = function(task) {
  var parts = [];
  parts.push('You are SQUAD agent: ' + task.agentId);
  parts.push('Phase: ' + task.phase);
  parts.push('');
  parts.push('Read persona: ' + task.personaPath);
  parts.push('');
  parts.push(task.taskPrompt);
  if (task.inputs && Object.keys(task.inputs).length > 0) {
    parts.push('');
    parts.push('Prior agent outputs:');
    parts.push(JSON.stringify(task.inputs, null, 2));
  }
  return parts.join('\n');
};

module.exports = GeminiAdapter;
