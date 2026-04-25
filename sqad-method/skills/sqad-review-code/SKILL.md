---
name: sqad-review-code
description: >
  Quick pre-commit review of uncommitted changes by 3 agents. Fast, focused,
  catches critical issues before commit. Use when user says "review code",
  "check my changes", "pre-commit review", or runs /review-code.
---

# SQAD-Public Review Code — Quick Pre-Commit Review

Three agents scan uncommitted changes: **Forge** (code quality),
**Raven** (adversarial), **Cipher** (tests).

**Bootstrap (read now):**
- `sqad-method/config.yaml` — team config
- `sqad-method/agents/_base-agent.md` — base protocols
- `sqad-method/fragments/review-rubric.md` — rubric checks

## Step 1 — Get Changes

```bash
git diff --stat
git diff --staged --stat
```

If nothing staged and nothing modified:
"No changes detected. Stage or modify files first."
→ STOP.

Combine staged + unstaged for review:
```bash
git diff
git diff --staged
```

Show summary:
```
Files changed: [N] (+[additions] -[deletions])
  [file] (+N -N)
  [file] (+N -N)
```

**USER GATE:** "Review these changes? [Continue/Adjust scope]"

## Step 2 — Read Changed Files

For each changed file, read the FULL file (not just the diff) — context matters.

**Load context:**
- Read `CONTEXT.md` at root for project conventions
- Read `<repo>/DEEP-CONTEXT.md` if available
- Query `knowledge-graph-out/graph.json` if available for blast radius

## Step 3 — Parallel Agent Review

**Load now:** `sqad-method/agents/forge.md`, `sqad-method/agents/raven.md`,
  `sqad-method/agents/cipher.md`, `sqad-method/fragments/review-protocol.md`

**Each agent runs rubric checks FIRST**, then adds lens-specific findings.

**Forge** — code quality:
- Is this idiomatic for the project stack?
- Variable naming, function structure, complexity
- Copy-paste detection — should anything be shared?
- Minimal changes — anything unnecessary in the diff?

**Raven** — adversarial:
- What bug is hiding in code the author thinks is correct?
- Null checks, boundary conditions, error paths
- What happens when API rate limits hit, timeouts occur, data is malformed?
- Second-order effects on other components

**Cipher** — test adequacy:
- Do tests exist for the changes?
- Are edge cases covered?
- Do tests prove the code works, or just assert it runs?
- Any new code path without a corresponding test?

## Step 4 — Consolidated Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SQAD-Public Code Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: [N] | MAJOR: [N] | MINOR: [N] | NIT: [N]

[Findings table with file:line, agent, severity, suggested fix]

Forge: [verdict]
Raven: [verdict]
Cipher: [verdict]
```

## Step 5 — Track Operation

```bash
echo '{"ts":"[ISO_DATE]","command":"review-code","repo":"[REPO]","outcome":"[completed|user_aborted]","review_verdict":"[APPROVE|REQUEST_CHANGES]","findings":{"critical":[N],"major":[N],"minor":[N],"nit":[N]}}' >> sqad-method/output/tracking.jsonl
```

## Behavioral Rules

- **Speed is key** — this is a quick review, not a deep audit
- Focus on **CRITICAL and MAJOR** findings only for the summary
- Read the FULL file, not just the diff — bugs hide in surrounding context
- NEVER fabricate line numbers — verify every reference by reading the file
- If the diff is too large (>500 lines), suggest reviewing in chunks
