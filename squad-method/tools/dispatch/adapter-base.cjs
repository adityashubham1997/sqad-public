'use strict';

/**
 * Base Dispatch Adapter — abstract interface for all IDE-specific dispatchers.
 *
 * Each IDE adapter implements:
 *   - detectCapability()  → what this IDE can do
 *   - dispatchAgent()     → send a single agent task
 *   - dispatchParallel()  → fan out multiple agents (if supported)
 *   - collectResult()     → gather agent output
 *   - buildManifestEntry() → create run manifest JSON entry
 */

var providers = require('../router/providers.cjs');

/**
 * @typedef {Object} AgentTask
 * @property {string} agentId        - Agent identifier (e.g., 'raven', 'atlas')
 * @property {string} personaPath    - Path to agent .md file
 * @property {string} taskPrompt     - The actual task/prompt for the agent
 * @property {string} model          - Resolved model ID
 * @property {string} provider       - Provider ID (anthropic, openai, google, amazon_bedrock)
 * @property {string} effort         - Effort level (low, medium, high, max)
 * @property {string} phase          - Current phase (phase_1, phase_2, etc.)
 * @property {object} inputs         - Input artifacts from prior agents
 * @property {string} outputSchema   - Expected output format
 */

/**
 * @typedef {Object} DispatchResult
 * @property {string} agentId
 * @property {string} status         - 'success' | 'error' | 'timeout'
 * @property {string} output         - Agent's output text
 * @property {number} durationMs     - Execution time
 * @property {string} model          - Model actually used
 * @property {string} provider       - Provider actually used
 * @property {boolean} fallbackUsed  - Whether fallback model was used
 */

/**
 * Base adapter — provides shared utilities. IDE adapters override the dispatch methods.
 */
function BaseAdapter(ideId, config) {
  this.ideId = ideId;
  this.config = config || {};
  this.ideProviders = providers.getIdeProviders(ideId);
  this.parallel = providers.getParallelCapability(ideId);
}

BaseAdapter.prototype.detectCapability = function() {
  return {
    ideId: this.ideId,
    parallel: this.parallel,
    multiModel: this.ideProviders.supports_multi_model,
    providers: providers.getAvailableProviders(this.ideId),
    mechanism: this.parallel.mechanism,
  };
};

/**
 * Build a run manifest entry for a single agent dispatch.
 */
BaseAdapter.prototype.buildManifestEntry = function(task, result) {
  var crypto = require('crypto');
  var inputsHash = crypto.createHash('sha256')
    .update(JSON.stringify(task.inputs || {}))
    .digest('hex')
    .substring(0, 16);

  return {
    agent_id: task.agentId,
    model: result.model || task.model,
    provider: result.provider || task.provider,
    effort: task.effort,
    inputs_hash: inputsHash,
    start_ts: result.startTs || new Date().toISOString(),
    end_ts: result.endTs || new Date().toISOString(),
    duration_ms: result.durationMs || 0,
    status: result.status,
    fallback_used: result.fallbackUsed || false,
    output_bytes: (result.output || '').length,
    retry_count: result.retryCount || 0,
  };
};

/**
 * Validate agent output against expected schema (R3 contract).
 * Returns { valid: boolean, missing: string[] }
 */
BaseAdapter.prototype.validateOutput = function(output, schema) {
  if (!output || output.trim().length === 0) {
    return { valid: false, missing: ['empty_output'] };
  }
  // Basic structural validation — check for required sections
  var missing = [];
  if (schema === 'review_findings') {
    if (!/CRITICAL|MAJOR|MINOR|NIT|APPROVE/i.test(output)) {
      missing.push('severity_classification');
    }
  }
  if (schema === 'yaml' || schema === 'structured') {
    if (!/^[\s]*[-\w]+:/m.test(output) && !/^\{/m.test(output)) {
      missing.push('structured_format');
    }
  }
  return { valid: missing.length === 0, missing: missing };
};

module.exports = BaseAdapter;
