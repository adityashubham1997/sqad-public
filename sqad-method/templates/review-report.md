---
template: review-report
description: Multi-agent code review consolidated report
used_by: /review-pr, /review-code, /review-story, /dev-task Phase 5
---

# Review Report — {{story_id}}

**Date:** {{date}} | **Repo:** {{repo_name}}
**Review type:** PR Review / Code Review / Story Review / Dev-Task Phase 5

---

## Summary

| Metric | Value |
|---|---|
| Agents participated | {{agent_count}} |
| CRITICAL findings | {{critical_count}} |
| MAJOR findings | {{major_count}} |
| MINOR findings | {{minor_count}} |
| NIT findings | {{nit_count}} |
| Discussions triggered | {{discussion_count}} |
| **Verdict** | **APPROVE / REQUEST CHANGES / BLOCK** |

## Agent Reviews

<!-- Each agent's full review follows -->

### {{icon}} {{agent_name}} — {{role}} Review

**Review Lens:** {{lens}}

#### Rubric Results
| # | Check | Result | Notes |
|---|---|---|---|
| {{check_id}} | {{check_name}} | PASS/FAIL | {{notes}} |

#### Additional Findings

**CRITICAL:**
- {{findings_or_none}}

**MAJOR:**
- {{findings_or_none}}

**MINOR:**
- {{findings_or_none}}

**Verdict:** {{agent_verdict}}

---

## Discussions

{{discussion_outcomes_or_none}}

## Best-Practice Suggestions

{{bp_suggestions_or_none}}

## Consolidated Verdict

**{{verdict}}** — {{summary_reason}}
