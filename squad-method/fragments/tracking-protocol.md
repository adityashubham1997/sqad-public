---
fragment: tracking-protocol
description: >
  Lightweight operation tracking for SQUAD-Public feedback loops. Every skill
  appends one JSONL record on completion. Data feeds /health, /retro, and
  agent learned-rules.
included_by: all skills (via _base-agent reference)
---

# SQUAD-Public Tracking Protocol

## Purpose

Track every SQUAD-Public operation so the system can learn from itself.
Structured feedback beats vibes.

## Where

All tracking records go to a single file:
```
squad-method/output/tracking.jsonl
```

One JSON object per line. Append-only. Never edit existing lines.

## When

Every skill appends ONE record as its **final step**, after the report
is displayed and any output files are saved.

## Schema

```json
{
  "schema_version": 2,
  "ts": "2026-04-25T12:00:00Z",
  "command": "dev-task",
  "repo": "my-api",
  "story": "PROJ-123",
  "agents_involved": ["nova", "oracle", "compass", "atlas", "forge", "cipher", "raven", "catalyst", "scribe", "tempo"],
  "phases_completed": 6,
  "review_verdict": "APPROVE",
  "findings": {"critical": 0, "major": 1, "minor": 2, "nit": 0},
  "user_action": "continue",
  "assumptions_count": 2,
  "discussions_count": 1,
  "duration_phases": ["analyse", "spec", "implement", "test", "review", "pr"],
  "outcome": "pr_created",
  "pr_quality_signals": {
    "blocker_count": 0,
    "major_count": 1,
    "merge_status": "merged",
    "linked_defects": []
  },
  "usage_surface_updated": false,
  "blast_radius_gate_triggered": false,
  "notes": ""
}
```

### Required Fields (all skills)

| Field | Type | Description |
|---|---|---|
| `schema_version` | number | Schema version. Currently `2`. Increment when fields change. |
| `ts` | ISO 8601 | Timestamp of completion |
| `command` | string | Skill name: `dev-task`, `review-pr`, `qa-task`, `release-readiness`, `retro`, etc. |
| `repo` | string | Primary repo involved, or `workspace` if cross-repo |
| `outcome` | string | Final outcome: `completed`, `pr_created`, `report_saved`, `user_aborted`, `error` |

### Optional Fields (skill-specific)

| Field | Type | Used By |
|---|---|---|
| `story` | string | dev-task, qa-task, review-story, test-story |
| `agents_involved` | string[] | All skills |
| `phases_completed` | number | dev-task (1-6), qa-task (1-5) |
| `review_verdict` | string | review-pr, dev-task Phase 5 |
| `findings` | object | review-pr, dev-task, review-story |
| `user_action` | string | Last user gate response |
| `assumptions_count` | number | Any skill with assumptions |
| `discussions_count` | number | Any skill with agent discussions |
| `signal` | string | release-readiness (HIGH/MEDIUM/LOW) |
| `notes` | string | Free-text for anything noteworthy |
| `pr_quality_signals` | object | dev-task Phase 6 — filled after PR merge (see below) |
| `usage_surface_updated` | boolean | dev-task Phase 5 — true if Scribe updated usage-docs |
| `blast_radius_gate_triggered` | boolean | dev-task Phase 2 — true if KG degree > 20 hard gate fired |

### `pr_quality_signals` Sub-fields

Populated at Phase 6 close (or backfilled by `/evolve` from git data):

| Sub-field | Type | Description |
| --- | --- | --- |
| `blocker_count` | number | BLOCKER-severity review comments on the PR |
| `major_count` | number | MAJOR-severity review comments on the PR |
| `merge_status` | string | `merged`, `closed_unmerged`, `open` |
| `linked_defects` | string[] | Defect IDs filed against this story post-merge |

**Why these fields?** They are the evaluation function for `/evolve`. High
`blocker_count` across multiple runs signals an agent improvement opportunity.
`linked_defects` after merge signals implementation quality. Together they let
the metacognitive loop distinguish noise from real patterns.

## How to Append

At the end of every skill, after the final report:

```bash
echo '{"schema_version":1,"ts":"[ISO_DATE]","command":"[SKILL]","repo":"[REPO]","outcome":"[OUTCOME]",...}' >> squad-method/output/tracking.jsonl
```

Or if using file write tools, append to `squad-method/output/tracking.jsonl`.

**NEVER overwrite the file. ALWAYS append.**

## What Consumes This Data

| Consumer | What It Reads |
|---|---|
| `/health` | All records — bias detection, agent effectiveness |
| `/retro` | Records since last sprint — velocity, pattern analysis |
| `/git-learn` | Review records — enriches learned rules |
| Agent learned-rules | Per-agent effectiveness over time |
