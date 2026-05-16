'use strict';

/**
 * Windsurf Dispatch Adapter (Path C — Sequential, Single Model)
 *
 * Windsurf Cascade is a single-model IDE with no parallel subagent support.
 * No multi-model switching available — uses whatever model Cascade provides.
 *
 * Capabilities:
 *   - Sequential dispatch only
 *   - Single model (Cascade's model — no user selection)
 *   - .windsurf/skills/ and .windsurf/workflows/ for skill delivery
 *   - Workflows as slash commands (/squad-*)
 *
 * Hook enforcement: SCRIPT (hooks.sh — skill must call it)
 */

var BaseAdapter = require('./adapter-base.cjs');

function WindsurfAdapter(config) {
  BaseAdapter.call(this, 'windsurf', config);
}
WindsurfAdapter.prototype = Object.create(BaseAdapter.prototype);
WindsurfAdapter.prototype.constructor = WindsurfAdapter;

/**
 * Dispatch a single agent — sequential persona switching.
 */
WindsurfAdapter.prototype.dispatchAgent = function(task) {
  return {
    type: 'sequential_persona_switch',
    instruction: this._buildSequentialInstruction(task),
    metadata: {
      agentId: task.agentId,
      model: 'cascade_default',
      provider: 'anthropic',
      phase: task.phase,
      note: 'Windsurf: single model, sequential only.',
    },
  };
};

/**
 * Dispatch multiple agents — sequential only.
 */
WindsurfAdapter.prototype.dispatchParallel = function(tasks) {
  var self = this;
  return {
    type: 'sequential_simulation',
    agents: tasks.map(function(task, idx) {
      return {
        order: idx + 1,
        agentId: task.agentId,
        instruction: self._buildSequentialInstruction(task),
      };
    }),
    totalAgents: tasks.length,
    note: 'Windsurf Path C: sequential, single model. All correctness guarantees preserved.',
  };
};

/**
 * No multi-model support — returns same model for all agents.
 */
WindsurfAdapter.prototype.buildMultiModelPlan = function(agents, phase) {
  return agents.map(function(agentId) {
    return {
      agentId: agentId,
      model: 'cascade_default',
      provider: 'anthropic',
      reason: 'single_model_ide',
      phase: phase,
    };
  });
};

WindsurfAdapter.prototype._buildSequentialInstruction = function(task) {
  var lines = [];
  lines.push('─── AGENT TURN: ' + task.agentId.toUpperCase() + ' ───');
  lines.push('');
  lines.push('**Persona:** Read `' + task.personaPath + '`');
  lines.push('**Phase:** ' + task.phase);
  lines.push('');
  lines.push('**Task:**');
  lines.push(task.taskPrompt);
  if (task.inputs && Object.keys(task.inputs).length > 0) {
    lines.push('');
    lines.push('**Inputs from prior agents:**');
    lines.push('```json');
    lines.push(JSON.stringify(task.inputs, null, 2));
    lines.push('```');
  }
  lines.push('');
  lines.push('**Output contract:** ' + (task.outputSchema || 'structured markdown'));
  lines.push('');
  lines.push('─── END AGENT: ' + task.agentId.toUpperCase() + ' ───');
  return lines.join('\n');
};

module.exports = WindsurfAdapter;
