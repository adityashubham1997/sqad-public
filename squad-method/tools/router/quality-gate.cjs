'use strict';

// V2 — Two-Pass Quality Cascade
// quality_gate.enabled: false in v1. Flip to true after 20-30 dev-task completions
// and calibrate signal thresholds against actual output quality.

var HEDGE_PATTERNS = [
  /\bI think\b/i,
  /\bI believe\b/i,
  /\bprobably\b/i,
  /\bmaybe\b/i,
  /\bperhaps\b/i,
  /\bnot sure\b/i,
  /\bmight be\b/i,
  /\bcould be\b/i,
  /\bseems like\b/i,
  /\bappears to\b/i,
];

var RUBRIC_PATTERN  = /CRITICAL|MAJOR|MINOR|NIT/;
var DESCRIBE_BLOCK  = /describe\s*\(/g;
var MAX_ESCALATIONS = 1;

/**
 * Detect quality signals in agent output.
 *
 * Signal A — Terse:       output estimate < 300 tokens AND prompt > 500 tokens
 * Signal B — Hedges:      >= 3 uncertainty marker patterns in output
 * Signal C — Empty:       output is blank or missing
 * Signal D — No rubric:   Phase 5 output missing CRITICAL/MAJOR/MINOR/NIT keywords
 * Signal E — Single test: only one describe() block in a test-generation output
 */
function detectQualitySignals(outputText, promptTokens, phase) {
  var signals = [];
  var text    = outputText || '';

  // Signal C checked first — empty output is a superset of all other failures
  if (text.trim().length === 0) {
    signals.push('C');
    return signals;
  }

  // Estimate output token count (~4 chars per token)
  var outputTokens = Math.floor(text.length / 4);

  // Signal A — Terse
  if (outputTokens < 300 && (promptTokens || 0) > 500) signals.push('A');

  // Signal B — Hedges
  var hedgeCount = HEDGE_PATTERNS.filter(function(p) { return p.test(text); }).length;
  if (hedgeCount >= 3) signals.push('B');

  // Signal D — No rubric keywords (Phase 5 only)
  if (phase === 'phase_5' && !RUBRIC_PATTERN.test(text)) signals.push('D');

  // Signal E — Single describe block (test output only)
  var describeMatches = (text.match(DESCRIBE_BLOCK) || []).length;
  if (describeMatches === 1 && outputTokens > 200) signals.push('E');

  return signals;
}

/**
 * Whether the quality gate should trigger an escalation.
 * Always false when enabled=false (v1 passive mode).
 * Circuit breaker: never escalate more than MAX_ESCALATIONS times per agent.
 */
function shouldEscalate(signals, escalationCount, config) {
  config = config || {};
  if (!config.enabled) return false;
  var threshold      = config.min_signals_to_escalate || 2;
  var maxEscalations = config.max_escalations_per_agent || MAX_ESCALATIONS;
  if (escalationCount >= maxEscalations) return false;
  return signals.length >= threshold;
}

/**
 * Build the escalation prompt appended to the original task when re-dispatching
 * on a higher-tier model.
 */
function buildEscalationPrompt(originalPrompt, previousOutput) {
  return (originalPrompt || '')
    + '\n\n---\n'
    + 'Previous analysis was insufficient (quality signals detected). '
    + 'Apply deeper reasoning. Be specific, thorough, and complete. '
    + 'Previous output for reference:\n'
    + (previousOutput || '');
}

/**
 * Format a quality gate log line for display in chat.
 * Shown after every default-tier dispatch regardless of gate state so users can
 * see signal data even before the gate is enabled.
 */
function formatGateLog(agentId, signals, escalated, reason) {
  if (signals.length === 0) {
    return '[QualityGate] ' + agentId + ' — OK';
  }
  var status = escalated ? '↑ ESCALATED' : '⚠️ SIGNALS (' + (reason || 'gate disabled') + ')';
  return '[QualityGate] ' + agentId + ' — ' + status
    + ' | signals: ' + signals.join(',');
}

module.exports = {
  detectQualitySignals,
  shouldEscalate,
  buildEscalationPrompt,
  formatGateLog,
  MAX_ESCALATIONS,
};
