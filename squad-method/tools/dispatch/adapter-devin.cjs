'use strict';

/**
 * Devin Dispatch Adapter (Path B — API-Based Parallel, Multi-Model)
 *
 * Devin by Cognition is an autonomous AI software engineering agent with:
 *   - Parallel task execution via session-based API (max 3 concurrent)
 *   - Multi-model support (Anthropic Claude, OpenAI GPT, Google Gemini)
 *   - Isolated workspace per session
 *   - .devin/skills/ and .devin/workflows/ for skill delivery
 *   - API-based dispatch (Devin API / session management)
 *
 * Devin is the successor/upgrade to Windsurf (Cognition acquired Codeium/Windsurf).
 * When .devin/ is detected, SQUAD uses this adapter with full parallel + multi-model.
 *
 * Hook enforcement: SCRIPT (hooks.sh — skill must call it)
 */

var BaseAdapter = require('./adapter-base.cjs');
var providers = require('../router/providers.cjs');

function DevinAdapter(config) {
  BaseAdapter.call(this, 'devin', config);
}
DevinAdapter.prototype = Object.create(BaseAdapter.prototype);
DevinAdapter.prototype.constructor = DevinAdapter;

/**
 * Dispatch a single agent via Devin session API.
 */
DevinAdapter.prototype.dispatchAgent = function(task) {
  return {
    type: 'devin_session',
    session: {
      agent: task.agentId,
      model: task.model,
      provider: task.provider,
      prompt: this._buildDevinPrompt(task),
    },
    metadata: {
      agentId: task.agentId,
      model: task.model,
      provider: task.provider,
      effort: task.effort,
      phase: task.phase,
      note: 'Devin: API-based dispatch with multi-model support.',
    },
  };
};

/**
 * Dispatch multiple agents in parallel via Devin sessions.
 * Devin supports up to 3 concurrent sessions.
 */
DevinAdapter.prototype.dispatchParallel = function(tasks) {
  var self = this;
  var maxParallel = this.parallel.max; // 3

  // Chunk into batches
  var batches = [];
  for (var i = 0; i < tasks.length; i += maxParallel) {
    batches.push(tasks.slice(i, i + maxParallel));
  }

  // Build shell script for API-based parallel dispatch
  var scriptLines = ['#!/bin/bash', '# Devin parallel dispatch — ' + tasks.length + ' agents', 'PIDS=()'];
  batches.forEach(function(batch, batchIdx) {
    scriptLines.push('');
    scriptLines.push('# Batch ' + (batchIdx + 1) + '/' + batches.length);
    batch.forEach(function(task) {
      var model = task.model || 'claude-sonnet-4-20250514';
      scriptLines.push(
        'curl -s -X POST "https://api.devin.ai/v1/sessions" \\'
      );
      scriptLines.push(
        '  -H "Authorization: Bearer $DEVIN_API_KEY" \\'
      );
      scriptLines.push(
        '  -H "Content-Type: application/json" \\'
      );
      scriptLines.push(
        '  -d \'{"model":"' + model + '","prompt":"' + task.agentId + ' agent task","metadata":{"agent":"' + task.agentId + '","phase":"' + task.phase + '"}}\' &'
      );
      scriptLines.push('PIDS+=($!)');
    });
    if (batchIdx < batches.length - 1) {
      scriptLines.push('for pid in "${PIDS[@]}"; do wait "$pid"; done');
      scriptLines.push('PIDS=()');
    }
  });
  scriptLines.push('');
  scriptLines.push('# Wait for final batch');
  scriptLines.push('for pid in "${PIDS[@]}"; do wait "$pid"; done');
  scriptLines.push('echo "All ' + tasks.length + ' agents completed"');

  return {
    type: 'devin_parallel_batch',
    batches: batches.map(function(batch, batchIdx) {
      return {
        batchIndex: batchIdx,
        agents: batch.map(function(task) {
          return self.dispatchAgent(task);
        }),
        syncBarrier: true,
      };
    }),
    totalAgents: tasks.length,
    totalBatches: batches.length,
    shellScript: scriptLines.join('\n'),
  };
};

/**
 * Generate multi-model dispatch plan.
 * Devin supports different models per session.
 */
DevinAdapter.prototype.buildMultiModelPlan = function(agents, phase) {
  return agents.map(function(agentId) {
    var assignment = providers.assignMultiModelAgent('devin', agentId, 'default');
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
 * Build the prompt for a Devin session.
 */
DevinAdapter.prototype._buildDevinPrompt = function(task) {
  var parts = [];
  parts.push('You are agent: ' + task.agentId);
  parts.push('Phase: ' + task.phase);
  parts.push('Model: ' + task.model + ' (' + task.provider + ')');
  parts.push('');
  parts.push('--- PERSONA ---');
  parts.push('Read and embody: ' + task.personaPath);
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
  parts.push('Include rules_fired and gates_checked per agent-orchestrator.md R9.3');
  return parts.join('\n');
};

module.exports = DevinAdapter;
