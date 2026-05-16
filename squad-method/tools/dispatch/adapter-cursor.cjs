'use strict';

/**
 * Cursor Dispatch Adapter (Path C — Sequential, Multi-Model)
 *
 * Cursor supports multiple model providers natively in its settings,
 * but has no subagent/parallel execution capability.
 *
 * Primary: Anthropic Claude (Cursor default)
 * Secondary: OpenAI GPT-4o, Google Gemini (all available in Cursor model picker)
 *
 * Capabilities:
 *   - Sequential dispatch only (no parallel subagents)
 *   - Multi-model: user can switch models between agent turns
 *   - .mdc rule files for skill configuration
 *   - @-mention commands for agent invocation
 *
 * Hook enforcement: SCRIPT (hooks.sh — skill must call it)
 */

var BaseAdapter = require('./adapter-base.cjs');
var providers = require('../router/providers.cjs');

function CursorAdapter(config) {
  BaseAdapter.call(this, 'cursor', config);
}
CursorAdapter.prototype = Object.create(BaseAdapter.prototype);
CursorAdapter.prototype.constructor = CursorAdapter;

/**
 * Dispatch a single agent (sequential — inline persona switching).
 */
CursorAdapter.prototype.dispatchAgent = function(task) {
  return {
    type: 'sequential_persona_switch',
    instruction: this._buildSequentialInstruction(task),
    metadata: {
      agentId: task.agentId,
      model: task.model,
      provider: task.provider,
      effort: task.effort,
      phase: task.phase,
      note: 'Cursor: sequential execution. Model set in Cursor settings.',
    },
  };
};

/**
 * Dispatch multiple agents — sequential only, one after another.
 */
CursorAdapter.prototype.dispatchParallel = function(tasks) {
  var self = this;
  // Cursor cannot do parallel — execute sequentially
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
    note: 'Cursor Path C: all agents execute sequentially in same conversation. Multi-model support means user CAN switch model between turns via Cursor model picker.',
  };
};

/**
 * Build multi-model plan.
 * Cursor supports model switching but not per-agent-turn programmatic control.
 * We provide recommended models; user switches manually or stays on default.
 */
CursorAdapter.prototype.buildMultiModelPlan = function(agents, phase) {
  return agents.map(function(agentId) {
    var assignment = providers.assignMultiModelAgent('cursor', agentId, 'default');
    return {
      agentId: agentId,
      model: assignment.model,
      provider: assignment.provider,
      reason: assignment.reason,
      phase: phase,
      note: 'Cursor model switch: manually select ' + assignment.model + ' in model picker for this agent turn',
    };
  });
};

/**
 * Build sequential instruction for persona switching within conversation.
 */
CursorAdapter.prototype._buildSequentialInstruction = function(task) {
  var lines = [];
  lines.push('─── AGENT TURN: ' + task.agentId.toUpperCase() + ' ───');
  lines.push('');
  lines.push('**Persona:** Read and embody `' + task.personaPath + '`');
  lines.push('**Recommended model:** ' + task.model + ' (' + task.provider + ')');
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
  lines.push('**Include:** rules_fired, gates_checked');
  lines.push('');
  lines.push('─── END AGENT: ' + task.agentId.toUpperCase() + ' ───');
  return lines.join('\n');
};

/**
 * Generate .mdc rule file content for Cursor.
 */
CursorAdapter.prototype.generateRuleFile = function(skillName, description, content) {
  return '---\n'
    + 'description: ' + description + '\n'
    + 'globs:\n'
    + 'alwaysApply: false\n'
    + '---\n\n'
    + content;
};

module.exports = CursorAdapter;
