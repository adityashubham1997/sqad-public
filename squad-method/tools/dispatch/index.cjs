'use strict';

/**
 * SQUAD-Public Dispatch Orchestrator
 *
 * Central entry point for multi-agent dispatch. Detects the active IDE,
 * selects the appropriate adapter, resolves models per agent, and
 * orchestrates parallel/sequential execution.
 *
 * Usage:
 *   const dispatch = require('./dispatch');
 *   const plan = dispatch.createPlan('kiro', ['raven','atlas','forge'], 'phase_5');
 *   const script = dispatch.generateScript(plan);
 */

var providers = require('../router/providers.cjs');
var ClaudeAdapter = require('./adapter-claude.cjs');
var CodexAdapter = require('./adapter-codex.cjs');
var CursorAdapter = require('./adapter-cursor.cjs');
var KiroAdapter = require('./adapter-kiro.cjs');
var GeminiAdapter = require('./adapter-gemini.cjs');
var WindsurfAdapter = require('./adapter-windsurf.cjs');
var AntigravityAdapter = require('./adapter-antigravity.cjs');

// ─── Adapter Factory ─────────────────────────────────────────────────────────

var ADAPTERS = {
  claude: ClaudeAdapter,
  codex: CodexAdapter,
  cursor: CursorAdapter,
  kiro: KiroAdapter,
  gemini: GeminiAdapter,
  windsurf: WindsurfAdapter,
  antigravity: AntigravityAdapter,
};

/**
 * Get the dispatch adapter for a given IDE.
 * @param {string} ideId
 * @param {object} [config] - IDE-specific config (aws_region, gcp_project, etc.)
 * @returns {BaseAdapter}
 */
function getAdapter(ideId, config) {
  var AdapterClass = ADAPTERS[ideId];
  if (!AdapterClass) {
    // Unknown IDE → fall back to Windsurf (sequential, single-model)
    return new WindsurfAdapter(config || {});
  }
  return new AdapterClass(config || {});
}

/**
 * Auto-detect current IDE from environment signals.
 * @returns {string} IDE identifier
 */
function detectCurrentIde() {
  var env = process.env || {};

  // Claude Code: CLAUDE_CODE=1 or Agent tool available
  if (env.CLAUDE_CODE || env.CLAUDE_SESSION_ID) return 'claude';
  // Codex: CODEX_CLI or codex binary
  if (env.CODEX_SESSION || env.OPENAI_CODEX) return 'codex';
  // Kiro: AWS_KIRO or .kiro/ present
  if (env.KIRO_SESSION || env.AWS_KIRO) return 'kiro';
  // Gemini: GEMINI_CLI or .gemini/ present
  if (env.GEMINI_SESSION || env.GOOGLE_GEMINI_CLI) return 'gemini';
  // Cursor: CURSOR_SESSION
  if (env.CURSOR_SESSION) return 'cursor';
  // Antigravity
  if (env.ANTIGRAVITY_SESSION) return 'antigravity';
  // Windsurf: WINDSURF_SESSION or default
  if (env.WINDSURF_SESSION || env.CASCADE_SESSION) return 'windsurf';

  // Default fallback — sequential
  return 'windsurf';
}

// ─── Dispatch Planning ───────────────────────────────────────────────────────

/**
 * Create a dispatch plan for a set of agents in a phase.
 *
 * @param {string} ideId - IDE to dispatch for
 * @param {string[]} agentIds - Agents to dispatch
 * @param {string} phase - Current phase (phase_1, phase_5, etc.)
 * @param {object} [options]
 * @param {string} [options.taskPrompt] - Shared task prompt
 * @param {object} [options.inputs] - Shared inputs from prior phase
 * @param {boolean} [options.multiModel=true] - Use multi-model assignment
 * @param {object} [options.ideConfig] - IDE-specific config
 * @returns {object} Dispatch plan
 */
function createPlan(ideId, agentIds, phase, options) {
  options = options || {};
  var adapter = getAdapter(ideId, options.ideConfig);
  var capability = adapter.detectCapability();
  var useMultiModel = options.multiModel !== false && capability.multiModel;

  // Resolve model assignment per agent
  var tasks = agentIds.map(function(agentId) {
    var assignment;
    if (useMultiModel) {
      assignment = providers.assignMultiModelAgent(ideId, agentId, 'default');
    } else {
      assignment = providers.resolveModel(ideId, 'default');
    }

    return {
      agentId: agentId,
      personaPath: 'squad-method/agents/' + agentId + '.md',
      taskPrompt: options.taskPrompt || '[Task will be injected by skill]',
      model: assignment.model,
      provider: assignment.provider,
      effort: 'medium',
      phase: phase,
      inputs: options.inputs || {},
      outputSchema: 'structured',
    };
  });

  // Determine dispatch strategy
  var plan;
  if (capability.parallel.supported && tasks.length > 1) {
    plan = adapter.dispatchParallel(tasks);
  } else {
    plan = adapter.dispatchParallel(tasks); // Sequential adapters handle this gracefully
  }

  // Attach metadata
  plan.ide = ideId;
  plan.phase = phase;
  plan.capability = capability;
  plan.multiModel = useMultiModel;
  plan.modelAssignments = tasks.map(function(t) {
    return { agentId: t.agentId, model: t.model, provider: t.provider };
  });

  return plan;
}

/**
 * Generate an executable shell script from a dispatch plan.
 * Only works for IDEs with parallel capability (Path A/B).
 */
function generateScript(plan) {
  if (plan.shellScript) {
    return plan.shellScript;
  }
  // For sequential IDEs, no script needed — dispatch is inline
  return '# Sequential dispatch — no external script needed for ' + plan.ide;
}

/**
 * Get a summary of all IDE capabilities for documentation/testing.
 */
function getCapabilityMatrix() {
  var matrix = {};
  Object.keys(ADAPTERS).forEach(function(ideId) {
    var adapter = getAdapter(ideId);
    matrix[ideId] = adapter.detectCapability();
  });
  return matrix;
}

module.exports = {
  getAdapter: getAdapter,
  detectCurrentIde: detectCurrentIde,
  createPlan: createPlan,
  generateScript: generateScript,
  getCapabilityMatrix: getCapabilityMatrix,
  ADAPTERS: ADAPTERS,
};
