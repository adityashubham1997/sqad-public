'use strict';

/**
 * Antigravity Dispatch Adapter (Path C — Sequential, Multi-Model)
 *
 * Antigravity AI IDE with Anthropic primary + OpenAI secondary.
 * No parallel subagent support but does allow model switching.
 *
 * Capabilities:
 *   - Sequential dispatch only
 *   - Multi-model: Anthropic + OpenAI (configurable)
 *   - .antigravity/skills/ for skill delivery
 *
 * Hook enforcement: SCRIPT (hooks.sh — skill must call it)
 */

var BaseAdapter = require('./adapter-base.cjs');
var providers = require('../router/providers.cjs');

function AntigravityAdapter(config) {
  BaseAdapter.call(this, 'antigravity', config);
}
AntigravityAdapter.prototype = Object.create(BaseAdapter.prototype);
AntigravityAdapter.prototype.constructor = AntigravityAdapter;

AntigravityAdapter.prototype.dispatchAgent = function(task) {
  return {
    type: 'sequential_persona_switch',
    instruction: this._buildSequentialInstruction(task),
    metadata: {
      agentId: task.agentId,
      model: task.model,
      provider: task.provider,
      phase: task.phase,
    },
  };
};

AntigravityAdapter.prototype.dispatchParallel = function(tasks) {
  var self = this;
  return {
    type: 'sequential_simulation',
    agents: tasks.map(function(task, idx) {
      return {
        order: idx + 1,
        agentId: task.agentId,
        instruction: self._buildSequentialInstruction(task),
        model: task.model,
        provider: task.provider,
      };
    }),
    totalAgents: tasks.length,
    note: 'Antigravity Path C: sequential, multi-model via config.',
  };
};

AntigravityAdapter.prototype.buildMultiModelPlan = function(agents, phase) {
  return agents.map(function(agentId) {
    var assignment = providers.assignMultiModelAgent('antigravity', agentId, 'default');
    return {
      agentId: agentId,
      model: assignment.model,
      provider: assignment.provider,
      reason: assignment.reason,
      phase: phase,
    };
  });
};

AntigravityAdapter.prototype._buildSequentialInstruction = function(task) {
  var lines = [];
  lines.push('─── AGENT TURN: ' + task.agentId.toUpperCase() + ' ───');
  lines.push('');
  lines.push('**Persona:** Read `' + task.personaPath + '`');
  lines.push('**Model:** ' + task.model + ' (' + task.provider + ')');
  lines.push('**Phase:** ' + task.phase);
  lines.push('');
  lines.push(task.taskPrompt);
  if (task.inputs && Object.keys(task.inputs).length > 0) {
    lines.push('');
    lines.push('**Prior outputs:**');
    lines.push(JSON.stringify(task.inputs, null, 2));
  }
  lines.push('');
  lines.push('─── END AGENT: ' + task.agentId.toUpperCase() + ' ───');
  return lines.join('\n');
};

module.exports = AntigravityAdapter;
