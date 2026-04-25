---
name: sqad-review-story
description: >
  Holistic story review — validates implementation against acceptance criteria.
  Fetches AC from tracker, finds associated code changes, then 5 agents review:
  did we deliver what was asked? Use when user says "review story", "validate
  story", "check if story is done", or runs /review-story.
---

# SQAD-Public Review Story — AC-Based Implementation Review

Five agents collaborate: **Nova** (AC validation), **Forge** (code quality),
**Cipher** (test coverage), **Raven** (adversarial), **Compass** (product lens).

**Bootstrap (read now):**
- `sqad-method/config.yaml` — team config
- `sqad-method/agents/_base-agent.md` — base protocols
- `sqad-method/agents/nova.md` — AC validation (primary for Step 2)

**Step-gated loading:**
- Step 1: `sqad-method/fragments/kg-query-protocol.md`
- Step 3: `sqad-method/agents/forge.md`, `sqad-method/agents/cipher.md`, `sqad-method/agents/raven.md`, `sqad-method/agents/compass.md`, `sqad-method/fragments/review-protocol.md`
- Step 4: `sqad-method/templates/review-report.md`

## Step 1 — Fetch Story & Find Changes

**Load now:** `sqad-method/fragments/kg-query-protocol.md`

### 1a. Get Story Details

**Tracker Mode** (input matches tracker ID pattern):
Fetch story details using tracker MCP tools. Extract: AC list, description, linked items.

**Description Mode** (free text):
Nova structures into testable AC. Ask: "What files/branch contain the implementation?"

### 1b. Find Associated Code

```bash
git branch -a | grep -i "[story_short]"
git log --all --oneline --grep="[story_number]" | head -10
git diff main...[branch] --stat
```

**KG context (if available):** query graph.json for each changed file.

**USER GATE:** "Found [N] files changed on branch [name]. Is this the right scope? [Continue/Adjust]"

## Step 2 — AC-by-AC Validation (Nova)

Nova maps each acceptance criterion to evidence:

For EACH AC:
1. Read the AC text
2. Find the code that satisfies it (specific file:line)
3. Find the test that proves it (specific test file:describe/it)
4. Verdict: MET / PARTIALLY MET / NOT MET / UNTESTABLE

```
📊 Nova — Acceptance Criteria Validation

| # | Acceptance Criterion | Code Evidence | Test Evidence | Verdict |
|---|---|---|---|---|
| AC-1 | [text] | [file:line] | [test file:it block] | MET |
| AC-2 | [text] | [file:line] | — | PARTIALLY MET (no test) |
```

**CRITICAL:** If Nova CANNOT find code evidence for an AC, mark NOT MET.

## Step 3 — Multi-Agent Review (parallel)

**Load now:** agent files + review fragments.

**Forge** — code quality
**Cipher** — test coverage (KG cross-check if available)
**Raven** — adversarial review (KG god node scrutiny)
**Compass** — product lens: customer value delivered as specified?

## Step 4 — Consolidated Report

**Load now:** `sqad-method/templates/review-report.md`

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SQAD-Public Story Review — [story number/desc]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

AC Validation: [N]/[total] MET | [N] PARTIAL | [N] NOT MET
Overall Verdict: PASS / PASS WITH NOTES / FAIL

[Nova's AC table]
[Findings by severity]
[Per-agent verdicts]
```

Save to: `sqad-method/output/reviews/review-story-[id]-[date].md`

**USER GATE:** "Review complete. [Address findings/Accept/Discuss]"

## Behavioral Rules

- NEVER mark an AC as MET without citing specific file:line evidence
- If evidence is ambiguous, mark PARTIALLY MET and explain
- Do NOT fabricate file paths or test names — verify with Glob/Grep
- If branch/changes can't be found, ask the user — don't review nothing
