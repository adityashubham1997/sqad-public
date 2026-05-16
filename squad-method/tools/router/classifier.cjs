'use strict';

// V3 — Learned Classifier (stub)
// Prerequisite: ~500 labelled dev-task completions in tracking.jsonl.
// Set classifier.enabled: true and classifier.endpoint once trained.
// Until then this module delegates 100% to the rule-based router in ./index.js.

var fs     = require('fs');
var path   = require('path');
var router = require('./index.cjs');

var TRACKING_FILE = path.resolve(__dirname, '../../output/tracking.jsonl');

/**
 * Route an agent dispatch to model + effort.
 * When classifier.enabled: false (v1/v2) → delegates to rule-based router.
 * When classifier.enabled: true + endpoint configured → calls classifier endpoint
 * and returns its recommendation (not yet implemented).
 */
function classifyRouting(agentId, phase, ctx) {
  ctx = ctx || {};
  var classifierConfig = ctx.classifier_config || {};

  if (classifierConfig.enabled && classifierConfig.endpoint) {
    // V3: HTTP call to classifier endpoint would go here.
    // Return shape: { model: string, effort: string, reason: 'classifier' }
    // For now, fall through to rule-based with 'classifier_stub' reason.
  }

  var model  = router.getModel(agentId, phase, ctx);
  var effort = router.getEffort(agentId, phase, ctx);
  var reason = (classifierConfig.enabled && classifierConfig.endpoint)
    ? 'classifier_stub'
    : 'rule_based';

  return { model: model, effort: effort, reason: reason };
}

/**
 * Append a training sample to tracking.jsonl for the V3 data pipeline.
 * All writes are best-effort — never throws.
 * Fields with value null are unlabelled and will be filled retrospectively.
 */
function collectTrainingSample(sample, trackingFile) {
  if (!sample || typeof sample !== 'object') return;

  var record = {
    ts:                    new Date().toISOString(),
    skill:                 sample.skill                 || null,
    phase:                 sample.phase                 || null,
    agent:                 sample.agent                 || null,
    model_used:            sample.model_used            || null,
    effort_used:           sample.effort_used           || null,
    execution_path:        sample.execution_path        || null,
    tier_reason:           sample.tier_reason           || null,
    fallback_fired:        sample.fallback_fired        || false,
    escalated:             sample.escalated             || false,
    escalation_reason:     sample.escalation_reason     || [],
    output_token_count:    sample.output_token_count    || null,
    quality_signals_fired: sample.quality_signals_fired || 0,
    blast_radius:          sample.blast_radius          || null,
    files_changed:         sample.files_changed         || null,
    cross_repo:            sample.cross_repo            || false,
    ac_count:              sample.ac_count              || null,
    label:                 sample.label                 || null,
  };

  var filePath = trackingFile || TRACKING_FILE;
  try {
    fs.appendFileSync(filePath, JSON.stringify(record) + '\n', 'utf8');
  } catch (e) {
    // tracking is best-effort; silently ignore write errors
  }
}

module.exports = { classifyRouting, collectTrainingSample };
