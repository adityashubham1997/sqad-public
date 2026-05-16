'use strict';

/**
 * Kiro (AWS) Dispatch Adapter (Path B — Bedrock InvokeModel API)
 *
 * Kiro is AWS's AI IDE with deep Amazon Bedrock integration.
 * It can invoke models across multiple providers via Bedrock:
 *   - Anthropic Claude (via Bedrock)
 *   - Amazon Titan
 *   - Meta Llama
 *   - OpenAI GPT models (via direct API)
 *   - Google Gemini (via direct API)
 *   - Amazon Q Developer (native)
 *
 * Capabilities:
 *   - Parallel subagents via Bedrock InvokeModel (max 3 concurrent)
 *   - Multi-model: full provider diversity via Bedrock + direct APIs
 *   - Amazon Q integration for AWS-specific knowledge
 *   - Per-agent model selection across providers
 *
 * Hook enforcement: SCRIPT (hooks.sh — skill must call it)
 */

var BaseAdapter = require('./adapter-base.cjs');
var providers = require('../router/providers.cjs');

function KiroAdapter(config) {
  BaseAdapter.call(this, 'kiro', config);
  this.region = config.aws_region || 'us-east-1';
  this.bedrockEndpoint = 'https://bedrock-runtime.' + this.region + '.amazonaws.com';
}
KiroAdapter.prototype = Object.create(BaseAdapter.prototype);
KiroAdapter.prototype.constructor = KiroAdapter;

/**
 * Dispatch a single agent via Bedrock InvokeModel or direct API.
 */
KiroAdapter.prototype.dispatchAgent = function(task) {
  var dispatchMethod = this._selectDispatchMethod(task.provider);

  return {
    type: dispatchMethod.type,
    command: dispatchMethod.command,
    metadata: {
      agentId: task.agentId,
      model: task.model,
      provider: task.provider,
      effort: task.effort,
      phase: task.phase,
      region: this.region,
    },
  };
};

/**
 * Dispatch multiple agents in parallel via Bedrock batch.
 * Uses background processes + wait barrier pattern.
 */
KiroAdapter.prototype.dispatchParallel = function(tasks) {
  var self = this;
  var maxParallel = this.parallel.max; // 3

  var batches = [];
  for (var i = 0; i < tasks.length; i += maxParallel) {
    batches.push(tasks.slice(i, i + maxParallel));
  }

  return {
    type: 'bedrock_parallel_batch',
    batches: batches.map(function(batch, batchIdx) {
      return {
        batchIndex: batchIdx,
        agents: batch.map(function(task) {
          return self._buildBedrockInvocation(task);
        }),
        syncBarrier: true,
      };
    }),
    totalAgents: tasks.length,
    totalBatches: batches.length,
    // Shell script to execute the parallel dispatch
    shellScript: self._generateParallelScript(tasks),
  };
};

/**
 * Build multi-model dispatch plan leveraging Bedrock's multi-provider access.
 * This is Kiro's key advantage — it can route to ANY model via Bedrock.
 */
KiroAdapter.prototype.buildMultiModelPlan = function(agents, phase) {
  var self = this;
  return agents.map(function(agentId) {
    var assignment = providers.assignMultiModelAgent('kiro', agentId, 'default');
    return {
      agentId: agentId,
      model: assignment.model,
      provider: assignment.provider,
      reason: assignment.reason,
      phase: phase,
      dispatchVia: self._selectDispatchMethod(assignment.provider).type,
    };
  });
};

/**
 * Select dispatch method based on provider.
 * Bedrock for Anthropic/Amazon/Meta; direct API for OpenAI/Google.
 */
KiroAdapter.prototype._selectDispatchMethod = function(providerId) {
  switch (providerId) {
    case 'amazon_bedrock':
    case 'anthropic':
      return {
        type: 'bedrock_invoke',
        command: 'aws bedrock-runtime invoke-model',
        endpoint: this.bedrockEndpoint,
      };
    case 'amazon_q':
      return {
        type: 'amazon_q_chat',
        command: 'aws q developer chat',
        endpoint: 'https://q.' + this.region + '.amazonaws.com',
      };
    case 'openai':
      return {
        type: 'openai_api',
        command: 'curl -s https://api.openai.com/v1/chat/completions',
        endpoint: 'https://api.openai.com/v1/chat/completions',
      };
    case 'google':
      return {
        type: 'google_api',
        command: 'curl -s https://generativelanguage.googleapis.com/v1beta/models',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
      };
    default:
      return {
        type: 'bedrock_invoke',
        command: 'aws bedrock-runtime invoke-model',
        endpoint: this.bedrockEndpoint,
      };
  }
};

/**
 * Build a single Bedrock InvokeModel request payload.
 */
KiroAdapter.prototype._buildBedrockInvocation = function(task) {
  var modelId = task.model;
  var prompt = this._buildAgentPrompt(task);

  // Detect if this is an Anthropic model on Bedrock (uses Messages API format)
  var isAnthropicOnBedrock = /anthropic/.test(modelId);

  var requestBody;
  if (isAnthropicOnBedrock) {
    requestBody = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    };
    if (task.effort === 'high' || task.effort === 'max') {
      requestBody.thinking = { type: 'enabled', budget_tokens: 8192 };
    }
  } else if (/titan/.test(modelId)) {
    requestBody = {
      inputText: prompt,
      textGenerationConfig: { maxTokenCount: 4096, temperature: 0.3 },
    };
  } else if (/llama/.test(modelId)) {
    requestBody = {
      prompt: prompt,
      max_gen_len: 4096,
      temperature: 0.3,
    };
  } else {
    // Generic Bedrock format
    requestBody = {
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 4096,
    };
  }

  return {
    agentId: task.agentId,
    modelId: modelId,
    provider: task.provider,
    command: 'aws bedrock-runtime invoke-model'
      + ' --model-id "' + modelId + '"'
      + ' --region ' + this.region
      + ' --content-type application/json'
      + ' --body \'' + JSON.stringify(requestBody) + '\'',
    outputFile: 'squad-method/output/.run/' + task.agentId + '-' + task.phase + '.json',
  };
};

/**
 * Build OpenAI API request for agents routed to GPT models.
 */
KiroAdapter.prototype._buildOpenAIInvocation = function(task) {
  var prompt = this._buildAgentPrompt(task);
  var isReasoning = /^o[13]/.test(task.model);

  var requestBody = {
    model: task.model,
    messages: [
      { role: 'system', content: 'You are SQUAD agent: ' + task.agentId },
      { role: 'user', content: prompt },
    ],
  };

  if (isReasoning) {
    requestBody.reasoning_effort = task.effort === 'max' ? 'high' : task.effort;
  } else {
    requestBody.max_tokens = 4096;
    requestBody.temperature = 0.3;
  }

  return {
    agentId: task.agentId,
    modelId: task.model,
    provider: 'openai',
    command: 'curl -s https://api.openai.com/v1/chat/completions'
      + ' -H "Authorization: Bearer $OPENAI_API_KEY"'
      + ' -H "Content-Type: application/json"'
      + ' -d \'' + JSON.stringify(requestBody) + '\'',
    outputFile: 'squad-method/output/.run/' + task.agentId + '-' + task.phase + '.json',
  };
};

/**
 * Build Google Gemini API request for agents routed to Gemini models.
 */
KiroAdapter.prototype._buildGeminiInvocation = function(task) {
  var prompt = this._buildAgentPrompt(task);

  var requestBody = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { maxOutputTokens: 4096, temperature: 0.3 },
  };

  if (task.effort === 'high' || task.effort === 'max') {
    requestBody.generationConfig.thinkingConfig = { thinkingBudget: 8192 };
  }

  return {
    agentId: task.agentId,
    modelId: task.model,
    provider: 'google',
    command: 'curl -s "https://generativelanguage.googleapis.com/v1beta/models/'
      + task.model + ':generateContent?key=$GOOGLE_API_KEY"'
      + ' -H "Content-Type: application/json"'
      + ' -d \'' + JSON.stringify(requestBody) + '\'',
    outputFile: 'squad-method/output/.run/' + task.agentId + '-' + task.phase + '.json',
  };
};

/**
 * Generate a shell script for parallel dispatch of multiple agents.
 */
KiroAdapter.prototype._generateParallelScript = function(tasks) {
  var self = this;
  var lines = ['#!/bin/bash', 'set -euo pipefail', ''];
  lines.push('# SQUAD Kiro Parallel Dispatch — ' + tasks.length + ' agents');
  lines.push('RUN_DIR="squad-method/output/.run"');
  lines.push('mkdir -p "$RUN_DIR"');
  lines.push('PIDS=()');
  lines.push('');

  tasks.forEach(function(task) {
    var invocation;
    switch (task.provider) {
      case 'openai':
        invocation = self._buildOpenAIInvocation(task);
        break;
      case 'google':
        invocation = self._buildGeminiInvocation(task);
        break;
      default:
        invocation = self._buildBedrockInvocation(task);
    }
    lines.push('# Agent: ' + task.agentId + ' → ' + task.provider + '/' + task.model);
    lines.push('(' + invocation.command + ' > "$RUN_DIR/' + task.agentId + '.json" 2>&1) &');
    lines.push('PIDS+=($!)');
    lines.push('');
  });

  lines.push('# Wait for all agents');
  lines.push('FAILURES=0');
  lines.push('for pid in "${PIDS[@]}"; do');
  lines.push('  wait "$pid" || FAILURES=$((FAILURES + 1))');
  lines.push('done');
  lines.push('');
  lines.push('if [ $FAILURES -gt 0 ]; then');
  lines.push('  echo "WARNING: $FAILURES agent(s) failed" >&2');
  lines.push('fi');
  lines.push('echo "Dispatch complete: ' + tasks.length + ' agents, $FAILURES failures"');

  return lines.join('\n');
};

/**
 * Build prompt for any agent dispatch.
 */
KiroAdapter.prototype._buildAgentPrompt = function(task) {
  var parts = [];
  parts.push('You are SQUAD agent: ' + task.agentId);
  parts.push('Phase: ' + task.phase);
  parts.push('Model: ' + task.model + ' (via ' + task.provider + ')');
  parts.push('');
  parts.push('Read and embody persona: ' + task.personaPath);
  parts.push('');
  parts.push('--- TASK ---');
  parts.push(task.taskPrompt);
  if (task.inputs && Object.keys(task.inputs).length > 0) {
    parts.push('');
    parts.push('--- INPUTS FROM PRIOR AGENTS ---');
    parts.push(JSON.stringify(task.inputs, null, 2));
  }
  parts.push('');
  parts.push('--- OUTPUT CONTRACT ---');
  parts.push('Schema: ' + (task.outputSchema || 'structured markdown'));
  return parts.join('\n');
};

module.exports = KiroAdapter;
