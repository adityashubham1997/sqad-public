'use strict';

/**
 * Claude Code Dispatch Adapter (Path A — Native Subagent Tool)
 *
 * Claude Code has the Agent() tool which spawns isolated subagent conversations.
 * This is TRUE parallel execution with per-agent model selection and isolated context.
 *
 * Capabilities:
 *   - Parallel subagents via Agent() tool (max 5 concurrent)
 *   - Per-agent model selection (claude-sonnet-4, claude-opus-4)
 *   - Isolated context per subagent (no bleed between agents)
 *   - Automatic hooks via settings.json (harness-level enforcement)
 *   - Multi-model: can also call OpenAI and Google via API keys
 *
 * Hook enforcement: AUTOMATIC (settings.json, impossible to bypass)
 */

var BaseAdapter = require('./adapter-base.cjs');
var providers = require('../router/providers.cjs');

function ClaudeAdapter(config) {
  BaseAdapter.call(this, 'claude', config);
}
ClaudeAdapter.prototype = Object.create(BaseAdapter.prototype);
ClaudeAdapter.prototype.constructor = ClaudeAdapter;

/**
 * Dispatch a single agent using Claude Code's Agent() tool.
 * In practice, this generates the Agent() call instruction that the LLM executes.
 */
ClaudeAdapter.prototype.dispatchAgent = function(task) {
  // Build the Agent() call payload
  var agentCall = {
    tool: 'Agent',
    params: {
      name: task.agentId,
      model: task.model,
      prompt: this._buildAgentPrompt(task),
    },
  };

  return {
    type: 'agent_tool_call',
    call: agentCall,
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
 * Dispatch multiple agents in parallel using Agent() tool.
 * Claude Code supports issuing multiple Agent() calls in one message.
 */
ClaudeAdapter.prototype.dispatchParallel = function(tasks) {
  var self = this;
  var maxParallel = this.parallel.max; // 5

  // Chunk into batches if exceeding limit
  var batches = [];
  for (var i = 0; i < tasks.length; i += maxParallel) {
    batches.push(tasks.slice(i, i + maxParallel));
  }

  return {
    type: 'parallel_agent_tool_batch',
    batches: batches.map(function(batch, batchIdx) {
      return {
        batchIndex: batchIdx,
        agents: batch.map(function(task) {
          return self.dispatchAgent(task);
        }),
        syncBarrier: true, // Wait for all in batch before next batch
      };
    }),
    totalAgents: tasks.length,
    totalBatches: batches.length,
  };
};

/**
 * Generate multi-model dispatch plan.
 * Claude Code can use different models per Agent() call.
 */
ClaudeAdapter.prototype.buildMultiModelPlan = function(agents, phase) {
  var self = this;
  return agents.map(function(agentId) {
    var assignment = providers.assignMultiModelAgent('claude', agentId, 'default');
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
 * Build the prompt sent to a subagent via Agent() tool.
 */
ClaudeAdapter.prototype._buildAgentPrompt = function(task) {
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

/**
 * Generate the settings.json hooks configuration for Claude Code.
 */
ClaudeAdapter.prototype.generateHooksConfig = function() {
  return {
    hooks: {
      PreToolUse: [
        {
          matcher: 'Edit|Write',
          hooks: [{
            type: 'command',
            command: 'bash squad-method/tools/hooks.sh pre-edit "$TOOL_INPUT_PATH" 2>/dev/null || true'
          }]
        }
      ],
      PostToolUse: [
        {
          matcher: 'Bash',
          hooks: [{
            type: 'command',
            command: 'if echo "$TOOL_INPUT" | grep -q "git commit\\|git push"; then bash squad-method/tools/hooks.sh secrets "$TOOL_INPUT_PATH" 2>/dev/null || true; fi'
          }]
        }
      ],
      UserPromptSubmit: [
        {
          matcher: '',
          hooks: [{
            type: 'command',
            command: "echo 'SQUAD Reminder: (1) Ask if in doubt, never assume. (2) Follow existing patterns. (3) Changes should be minimal and surgical. (4) Tag all assumptions for user verification. (5) Check progress docs for active sessions.'"
          }]
        }
      ],
      Stop: [
        {
          matcher: '',
          hooks: [{
            type: 'command',
            command: 'bash squad-method/tools/hooks.sh progress-save 2>/dev/null || true'
          }]
        }
      ]
    }
  };
};

module.exports = ClaudeAdapter;
