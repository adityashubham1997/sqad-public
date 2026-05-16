---
template: retro-template
description: Sprint retrospective report template
used_by: /retro
---

# Sprint Retrospective — {{sprint_name}}

**Date:** {{date}} | **Team:** {{team_name}}

---

## Sprint Metrics

| Metric | Value |
|---|---|
| Points committed | {{committed}} |
| Points completed | {{completed}} |
| Completion rate | {{percentage}}% |
| Stories carried over | {{carryover}} |
| Defects found | {{defects}} |
| Review findings (avg) | {{avg_findings}} |

## SQUAD-Public Usage Stats

| Command | Invocations | Avg Outcome |
|---|---|---|
| `/dev-task` | {{count}} | {{avg_verdict}} |
| `/review-pr` | {{count}} | {{avg_verdict}} |
| `/qa-task` | {{count}} | — |

## 🟢 What Went Well

{{items}}

## 🔴 What Didn't Go Well

{{items}}

## 💡 Action Items

| # | Action | Owner | Due |
|---|---|---|---|
| 1 | {{action}} | {{owner}} | {{date}} |

## Agent Effectiveness

| Agent | Findings | False Positives | Hit Rate |
|---|---|---|---|
| {{agent}} | {{count}} | {{fp_count}} | {{percentage}}% |

## Process Improvements

{{suggestions_from_tracking_data}}
