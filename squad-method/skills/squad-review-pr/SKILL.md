---
name: squad-review-pr
description: >
  Pure code review of a pull request. Reviews the diff for quality, bugs,
  security, architecture, and release compliance. Use when user says "review pr",
  "review this PR", "code review PR", provides a PR URL/number, or runs /review-pr.
---

# SQUAD-Public Review PR — Pure Code Review

Five agents review: **Forge** (code), **Raven** (adversarial),
**Cipher** (tests), **Atlas** (architecture), **Catalyst** (release).

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols (discussions, tracking)

**Step-gated loading:**
- Step 2: `squad-method/fragments/kg-query-protocol.md`
- Step 3: `squad-method/agents/forge.md`, `squad-method/agents/raven.md`, `squad-method/agents/cipher.md`, `squad-method/agents/atlas.md`, `squad-method/agents/catalyst.md`, `squad-method/fragments/review-protocol.md`, `squad-method/fragments/review-rubric.md`
- Step 4: `squad-method/templates/review-report.md`
- Step 6: `squad-method/fragments/tracking-protocol.md`

## Step 1 — Fetch PR

### 1a. Get PR Details

Parse `$ARGUMENTS` for PR number or URL.

```bash
gh pr view [NUMBER] --json title,body,baseRefName,headRefName,files,additions,deletions,changedFiles
gh pr diff [NUMBER]
```

If `gh` not configured:
```bash
git fetch origin pull/[NUMBER]/head:pr-[NUMBER]
git diff main...pr-[NUMBER]
```

If neither works: "I can't fetch this PR. Can you provide the branch name or paste the diff?"

### 1b. Show PR Summary

```
PR #[N]: [title]
Base: [base] ← Head: [head]
Files changed: [N] (+[additions] -[deletions])

Changed files:
  [file_path] (+N -N)
```

**USER GATE:** "Review this PR? [Continue/Adjust scope]"

## Step 2 — Read Changed Files

**Load now:** `squad-method/fragments/kg-query-protocol.md`

**Load deep context:**
- Read `<repo>/DEEP-CONTEXT.md` if exists
- **Query `<repo>/knowledge-graph-out/graph.json`** if exists — run blast radius analysis
- If KG not available, proceed with CONTEXT.md + code analysis

For each changed file:
1. Read the FULL current file — context matters
2. Read the diff to understand what changed
3. If new file, find a pattern reference (similar existing file)

## Step 3 — Parallel Agent Review

**Load now:** agent files + review fragments.

**Batch 1 (parallel):**

**Forge** — code quality:
- Idiomatic for the project stack?
- Variable naming, function structure, complexity
- Copy-paste detection — should anything be shared?

**Raven** — adversarial:
- Hidden bug in code the author thinks is correct?
- Null checks, boundary conditions, error paths
- Rate limits, timeouts, malformed data?

**Cipher** — test adequacy:
- Do tests exist for the changes?
- Edge cases covered?
- Tests prove correctness?

**Batch 2 (parallel):**

**Atlas** — architecture:
- Fits established architecture?
- Cross-repo implications?
- Performance impact?
- Security: auth, injection, credentials?

**Catalyst** — release compliance:
- L10N: hardcoded strings that should be externalized?
- Missing descriptions, labels?
- Release blockers?

## Step 4 — Consolidated Report

**Load now:** `squad-method/templates/review-report.md`

Deduplicate findings. Group by severity.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  SQUAD-Public PR Review — #[number] [title]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL: [N] | MAJOR: [N] | MINOR: [N] | NIT: [N]
Verdict: APPROVE / REQUEST CHANGES

[Findings table with file:line, agent, severity, fix]
[Per-agent verdicts]
```

## Step 5 — Offer to Post Comments

"Want me to post these findings as PR review comments? [Yes/Edit first/Skip]"

If yes:
```bash
gh pr review [NUMBER] --comment --body "[findings summary]"
```

Save to: `squad-method/output/reviews/review-pr-[number]-[date].md`

## Step 6 — Track Operation

```bash
echo '{"ts":"[ISO_DATE]","command":"review-pr","repo":"[REPO]","outcome":"[completed|user_aborted]","review_verdict":"[APPROVE|REQUEST_CHANGES]","findings":{"critical":[N],"major":[N],"minor":[N],"nit":[N]},"discussions_count":[N]}' >> squad-method/output/tracking.jsonl
```

## Behavioral Rules

- Read the FULL file, not just the diff — bugs hide in surrounding context
- NEVER fabricate line numbers — verify every reference
- If PR is too large (>500 lines changed), suggest reviewing in chunks
- Don't post PR comments without user approval
- If `gh` commands fail, fall back to local git — don't error out
