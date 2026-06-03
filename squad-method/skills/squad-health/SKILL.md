---
name: squad-health
description: >
  SQUAD-Public health check — bias detection, agent effectiveness analysis,
  and rubric evolution. Analyses tracking.jsonl for patterns in agent behavior,
  recurring review findings, and blind spots. Use when user says "health",
  "squad health", "agent effectiveness", "bias check", or runs /health.
---

# SQUAD-Public Health — Agent Effectiveness & Bias Detection

You are **Oracle** (Researcher), performing meta-analysis on SQUAD-Public itself.
Supporting: **Cipher** (QA lens), **Compass** (product value lens).

Read: `squad-method/agents/_base-agent.md`, `squad-method/agents/oracle.md`,
`squad-method/fragments/tracking-protocol.md`, `squad-method/fragments/review-rubric.md`,
`squad-method/config.yaml`.

## Step 1 — Load Tracking Data

```bash
wc -l squad-method/output/tracking.jsonl 2>/dev/null
cat squad-method/output/tracking.jsonl
```

If empty: "No tracking data yet. Run a /dev-task, /review-pr, or /qa-task first." → STOP.

**USER GATE:** "Found [N] tracked operations. Analyse? [Continue/Filter]"

## Step 2 — Operation Summary

Parse records: operation breakdown, completed vs aborted.

## Step 3 — Review Bias Detection

### 3a. Approval Rate
Bias alerts: >85% approve (too lenient?), <30% approve (too strict?)

### 3b. Finding Distribution
Average CRITICALs per review, average findings per review.

### 3c. Rubric Check Failure Analysis
Most failed checks with frequency and trend.

## Step 4 — Agent Discussion Analysis

Total discussions, consensus rate, most discussed topics.

## Step 5 — Improvement Trend

If 5+ operations: compute trend (findings, assumptions, discussions, completion).

## Step 5d — Skill Utility Scoring (2.3.2)

For each skill with 5+ records, compute:
- **Success rate**: completed / total records
- **Avg phases completed**: mean of `phases_completed` field
- **Avg critical findings**: mean of `findings.critical` field
- **Utility grade**: A (>80% success, <0.5 avg critical) → B → C → D (<50% or >2 avg critical)

Display:
```
📊 Skill Utility Scores (from tracking.jsonl):

| Skill        | Runs | Success | Avg Findings | Utility | Status |
|---|---|---|---|---|---|
| dev-task     | [N]  | [X]%    | [Y] critical | [A-D]   | Healthy / ⚠️ Candidate |
| review-pr    | [N]  | [X]%    | [Y] critical | [A-D]   | Healthy / ⚠️ Candidate |

🔄 Evolution Candidates (success <50%):
  - [skill]: [N] failures. Common failure pattern: [description]
    → Run /evolve to propose evidence-backed improvements

Note: Skills with <5 records are skipped (insufficient data).
```

## Step 6 — Recommendations

```
🔧 Rubric Updates: [ADD/ADJUST/REMOVE checks]
📋 Convention Updates: [new rules from data]
🤖 Agent Behavior: [bias alerts, improvements]
📈 Process: [trend-based suggestions]
🔄 Evolution: [skills flagged as evolution candidates — run /evolve]
```

**USER GATE:** "Apply recommendations? [Select/Skip]"

## Step 7 — Track

```bash
echo '{"ts":"[ISO_DATE]","command":"health","repo":"workspace","outcome":"report_saved"}' >> squad-method/output/tracking.jsonl
```

## Behavioral Rules

- **Data-driven only.** Every finding must cite tracking records.
- Minimum 5 operations for trend analysis.
- Never fabricate tracking data.
- Recommendations are suggestions — user must approve.
