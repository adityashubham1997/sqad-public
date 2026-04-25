---
fragment: review-protocol
description: Multi-agent review orchestration protocol
included_by: dev-task Phase 5, review-story, review-pr, review-code
---

# Multi-Agent Review Protocol

## Review Dispatch

When a multi-agent review is triggered:

1. **Read the rubric** — load `rubric/base.md` (always) + `rubric/security.md` (always) + detected stack/cloud rubric modules
2. Each agent runs their applicable rubric checks FIRST
3. Each agent adds lens-specific findings BEYOND the rubric
4. If agents disagree on severity or approach → trigger an **Agent Discussion**
   (see `_base-agent.md` → Agent Discussions)
5. Reviews are consolidated with rubric scores + discussion outcomes

## Per-Agent Review Structure

Each agent produces a review with this structure:

```
## [Icon] [Agent Name] — [Role] Review

**Review Lens:** [What I'm specifically looking for]

### Rubric Results
| # | Check | Result | Notes |
|---|---|---|---|
| U-1 | No hardcoded credentials | PASS | — |
| U-2 | Null safety | FAIL | line 47: obj.prop.split() |

### Additional Findings (beyond rubric)

#### CRITICAL (must fix)
- [file:line] — [description] — [suggested fix]

#### MAJOR (should fix)
- [file:line] — [description] — [suggested fix]

#### MINOR (fix if time)
- [description]

#### NIT (optional)
- [description]

### Verdict: APPROVE / REQUEST CHANGES / NEEDS DISCUSSION
[1-2 sentence summary]
```

## Consolidation Rules

After all agents complete their reviews:

1. **Deduplicate** — if multiple agents flag the same issue, keep the most detailed one and credit all agents who found it
2. **Prioritize** — CRITICAL findings from any agent block the merge
3. **Resolve conflicts via Agent Discussion** — if agents disagree (e.g., Forge says "simplify" but Atlas says "the complexity is justified"), trigger a `[DISCUSSION-N]` per the Agent Discussion Protocol in `_base-agent.md`. Present the discussion outcome + recommendation to the user at the review gate.
4. **Summarize** — produce a consolidated report with all findings grouped by severity

## Review Etiquette

- Agents acknowledge each other's findings: "Raven flagged the null check — I'll add that the test is also missing for that case"
- Disagreements are evidence-based, never personal
- If an agent has no findings, they say "No issues from my lens" — they don't invent findings to justify their participation
- **Never fabricate issues** — if the code is good, say so. A clean review is a valid outcome.

## Anti-Hallucination During Review

- Before flagging a pattern violation, VERIFY the pattern exists in this codebase
- Before suggesting an API or function, VERIFY it's available in the detected stack
- Before citing an article, VERIFY the article is real
- If you're UNCERTAIN about a finding, mark it as: "UNCERTAIN — needs verification: [question]"
