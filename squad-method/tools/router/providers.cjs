'use strict';

/**
 * SQUAD-Public Multi-Provider Model Registry
 *
 * Maps logical model tiers (fast/default/heavy) to concrete model IDs
 * per provider. Each IDE uses different providers — this registry lets
 * the router resolve the actual model string for any IDE + tier combination.
 *
 * Provider support by IDE:
 *   Claude Code  → Anthropic (native), OpenAI (via API key), Google (via API key)
 *   Codex        → OpenAI (native), Anthropic (via API key)
 *   Cursor       → Anthropic, OpenAI, Google (all native multi-model)
 *   Kiro         → Amazon Bedrock (native: Claude, Titan, Llama), OpenAI, Google, Anthropic direct
 *   Gemini       → Google (native), Anthropic (via Vertex), OpenAI (via API key)
 *   Windsurf     → Anthropic (native Cascade), single model only
 *   Antigravity  → Anthropic (native), OpenAI (via config)
 */

// ─── Provider Model Catalogs ─────────────────────────────────────────────────

var ANTHROPIC = {
  id: 'anthropic',
  models: {
    fast:    'claude-sonnet-4-20250514',
    default: 'claude-sonnet-4-20250514',
    heavy:   'claude-opus-4-20250514',
  },
  supports_effort: false,
  supports_thinking: true,
  max_context: 200000,
};

var OPENAI = {
  id: 'openai',
  models: {
    fast:    'gpt-4o-mini',
    default: 'gpt-4o',
    heavy:   'o3',
  },
  supports_effort: true,  // reasoning_effort parameter
  supports_thinking: true, // extended thinking for o-series
  max_context: 128000,
};

var GOOGLE = {
  id: 'google',
  models: {
    fast:    'gemini-2.0-flash',
    default: 'gemini-2.5-pro',
    heavy:   'gemini-2.5-pro',
  },
  supports_effort: false,
  supports_thinking: true, // thinking budget for 2.5
  max_context: 1000000,
};

var AMAZON_BEDROCK = {
  id: 'amazon_bedrock',
  models: {
    fast:    'us.anthropic.claude-sonnet-4-20250514-v1:0',
    default: 'us.anthropic.claude-sonnet-4-20250514-v1:0',
    heavy:   'us.anthropic.claude-opus-4-20250514-v1:0',
  },
  supports_effort: false,
  supports_thinking: true,
  max_context: 200000,
  // Bedrock also provides non-Anthropic models:
  alternatives: {
    fast:    'amazon.titan-text-express-v1',
    default: 'us.meta.llama3-3-70b-instruct-v1:0',
    heavy:   'us.anthropic.claude-opus-4-20250514-v1:0',
  },
};

var AMAZON_Q = {
  id: 'amazon_q',
  models: {
    fast:    'amazon-q-developer',
    default: 'amazon-q-developer',
    heavy:   'amazon-q-developer',
  },
  supports_effort: false,
  supports_thinking: false,
  max_context: 128000,
};

// ─── IDE → Provider Mapping ──────────────────────────────────────────────────

/**
 * Each IDE has a primary provider (native) and optional secondary providers
 * that can be used for subagent dispatch when multi-model is enabled.
 */
var IDE_PROVIDERS = {
  claude: {
    primary: ANTHROPIC,
    secondary: [OPENAI, GOOGLE],
    supports_parallel: true,
    parallel_mechanism: 'agent_tool',  // Native Agent() subagent API
    max_parallel: 5,
    supports_multi_model: true,
  },
  codex: {
    primary: OPENAI,
    secondary: [ANTHROPIC],
    supports_parallel: true,
    parallel_mechanism: 'cli_subprocess',  // codex CLI spawning
    max_parallel: 3,
    supports_multi_model: true,
  },
  cursor: {
    primary: ANTHROPIC,
    secondary: [OPENAI, GOOGLE],
    supports_parallel: false,     // No native subagent tool
    parallel_mechanism: 'sequential',
    max_parallel: 1,
    supports_multi_model: true,   // Cursor supports model switching in settings
  },
  kiro: {
    primary: AMAZON_BEDROCK,
    secondary: [AMAZON_Q, OPENAI, GOOGLE, ANTHROPIC],
    supports_parallel: true,
    parallel_mechanism: 'bedrock_invoke',  // Amazon Bedrock InvokeModel API
    max_parallel: 3,
    supports_multi_model: true,   // Full multi-provider via Bedrock + direct API
  },
  gemini: {
    primary: GOOGLE,
    secondary: [ANTHROPIC, OPENAI],
    supports_parallel: true,
    parallel_mechanism: 'vertex_ai',  // Google Vertex AI batch prediction
    max_parallel: 3,
    supports_multi_model: true,
  },
  windsurf: {
    primary: ANTHROPIC,
    secondary: [],
    supports_parallel: false,
    parallel_mechanism: 'sequential',
    max_parallel: 1,
    supports_multi_model: false,  // Cascade is single-model
  },
  antigravity: {
    primary: ANTHROPIC,
    secondary: [OPENAI],
    supports_parallel: false,
    parallel_mechanism: 'sequential',
    max_parallel: 1,
    supports_multi_model: true,
  },
};

// ─── Exports ─────────────────────────────────────────────────────────────────

/**
 * Get provider config for an IDE.
 * @param {string} ideId - IDE identifier (claude, codex, cursor, kiro, gemini, windsurf, antigravity)
 * @returns {object} IDE provider config
 */
function getIdeProviders(ideId) {
  return IDE_PROVIDERS[ideId] || IDE_PROVIDERS.windsurf; // fallback to sequential
}

/**
 * Resolve a concrete model ID for a given IDE + tier + optional provider override.
 * @param {string} ideId
 * @param {string} tier - fast | default | heavy
 * @param {string} [providerOverride] - Force a specific provider (e.g. 'openai' for diversity)
 * @returns {{ provider: string, model: string, supports_effort: boolean, max_context: number }}
 */
function resolveModel(ideId, tier, providerOverride) {
  var ideConfig = getIdeProviders(ideId);
  var provider;

  if (providerOverride) {
    // Find the matching provider in primary or secondary
    if (ideConfig.primary.id === providerOverride) {
      provider = ideConfig.primary;
    } else {
      provider = ideConfig.secondary.find(function(p) { return p.id === providerOverride; });
    }
    if (!provider) {
      // Provider not available for this IDE — fall back to primary
      provider = ideConfig.primary;
    }
  } else {
    provider = ideConfig.primary;
  }

  return {
    provider: provider.id,
    model: provider.models[tier] || provider.models['default'],
    supports_effort: provider.supports_effort,
    supports_thinking: provider.supports_thinking,
    max_context: provider.max_context,
  };
}

/**
 * Get all available providers for an IDE (for multi-model dispatch).
 * @param {string} ideId
 * @returns {string[]} Provider IDs available
 */
function getAvailableProviders(ideId) {
  var ideConfig = getIdeProviders(ideId);
  var providers = [ideConfig.primary.id];
  ideConfig.secondary.forEach(function(p) { providers.push(p.id); });
  return providers;
}

/**
 * Check if an IDE supports parallel subagent dispatch.
 * @param {string} ideId
 * @returns {{ supported: boolean, mechanism: string, max: number }}
 */
function getParallelCapability(ideId) {
  var ideConfig = getIdeProviders(ideId);
  return {
    supported: ideConfig.supports_parallel,
    mechanism: ideConfig.parallel_mechanism,
    max: ideConfig.max_parallel,
  };
}

/**
 * For multi-model orchestration: assign different providers to different agents
 * based on their strengths. Heavy reasoning → Anthropic/OpenAI o-series.
 * Fast structured output → Google/GPT-4o-mini. Research → Google (long context).
 *
 * @param {string} ideId
 * @param {string} agentId
 * @param {string} tier
 * @returns {{ provider: string, model: string, reason: string }}
 */
function assignMultiModelAgent(ideId, agentId, tier) {
  var ideConfig = getIdeProviders(ideId);
  if (!ideConfig.supports_multi_model || ideConfig.secondary.length === 0) {
    // Single-model IDE — use primary for everything
    var primary = resolveModel(ideId, tier);
    primary.reason = 'single_model_ide';
    return primary;
  }

  // Multi-model strategy: assign based on agent role
  var AGENT_PROVIDER_AFFINITY = {
    // Heavy reasoning agents → heavy tier on primary provider
    raven:    { prefer: 'primary', tier: 'heavy', reason: 'adversarial_reasoning' },
    atlas:    { prefer: 'primary', tier: 'heavy', reason: 'architecture_analysis' },
    phoenix:  { prefer: 'primary', tier: 'heavy', reason: 'synthesis' },
    // Research agents → long-context provider (Google has 1M context)
    oracle:   { prefer: 'google', tier: 'default', reason: 'research_long_context' },
    // Fast structured output agents → fast tier
    scribe:   { prefer: 'primary', tier: 'fast', reason: 'structured_output' },
    tempo:    { prefer: 'primary', tier: 'fast', reason: 'status_reporting' },
    // Security/testing → OpenAI o-series for reasoning
    sentinel: { prefer: 'openai', tier: 'heavy', reason: 'security_reasoning' },
    cipher:   { prefer: 'openai', tier: 'default', reason: 'test_generation' },
  };

  var affinity = AGENT_PROVIDER_AFFINITY[agentId];
  if (!affinity) {
    // Default: use primary provider at requested tier
    var result = resolveModel(ideId, tier);
    result.reason = 'default_primary';
    return result;
  }

  var preferredProvider = affinity.prefer;
  if (preferredProvider === 'primary') {
    preferredProvider = ideConfig.primary.id;
  }

  // Check if preferred provider is available for this IDE
  var available = getAvailableProviders(ideId);
  if (available.indexOf(preferredProvider) === -1) {
    // Not available — fall back to primary
    var fallback = resolveModel(ideId, affinity.tier || tier);
    fallback.reason = affinity.reason + '_fallback_to_primary';
    return fallback;
  }

  var resolved = resolveModel(ideId, affinity.tier || tier, preferredProvider);
  resolved.reason = affinity.reason;
  return resolved;
}

module.exports = {
  ANTHROPIC: ANTHROPIC,
  OPENAI: OPENAI,
  GOOGLE: GOOGLE,
  AMAZON_BEDROCK: AMAZON_BEDROCK,
  AMAZON_Q: AMAZON_Q,
  IDE_PROVIDERS: IDE_PROVIDERS,
  getIdeProviders: getIdeProviders,
  resolveModel: resolveModel,
  getAvailableProviders: getAvailableProviders,
  getParallelCapability: getParallelCapability,
  assignMultiModelAgent: assignMultiModelAgent,
};
