---
name: sqad-refresh-git
description: >
  Enrich CONTEXT.md files with learnings from PR review comments and git
  history. The slow, deep-analysis companion to /refresh. Use when user says
  "refresh git", "learn from PRs", "enrich context from git", or runs
  /refresh-git.
---

# SQAD-Public Refresh Git — Enrich CONTEXT.md from PR History

Pull PR review comments and add learnings to CONTEXT.md files.
This is the slow, deep companion to `/refresh` (which is fast, code-only).

Read `sqad-method/config.yaml` for GitHub host config.

## Step 1 — Find Git Boundaries

```bash
GIT_BOUNDARIES=""
[ -d ".git" ] && GIT_BOUNDARIES=". "
for dir in */; do [ -d "$dir/.git" ] && GIT_BOUNDARIES="$GIT_BOUNDARIES$dir "; done
```

## Step 2 — For Each Boundary

### 2a. Get GitHub Remote
### 2b. Fetch Recent Merged PRs
### 2c. Collect ALL Review Comments (aggregate first, then analyse)
### 2d. Get Commit Messages

**USER GATE:** "Collected [K] comments from [M] PRs across [N] boundaries. Analyse? [Continue/Skip]"

## Step 3 — Analyse Aggregated Patterns

### 3a. Theme Extraction (frequency >= 3 to be valid)
### 3b. Commit Conventions
### 3c. Cross-Boundary Themes

## Step 4 — Incremental Update of CONTEXT.md Files

**CRITICAL: INCREMENTAL, not replace-all.**

| Situation | Action |
|---|---|
| New learning | ADD |
| Same theme exists | KEEP existing |
| Frequency changed | UPDATE count |
| Theme gone from recent PRs | EVALUATE — remove if team learned |

Tag: `<!-- sqad-refresh-git: [date], source: [N] PRs, incremental -->`

Line limits: root <200, per-repo <100. Prune lowest-frequency first.

## Step 5 — Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📚 Scribe — Git Learnings Applied
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Boundaries: [N] | PRs: [M] | Comments: [K]
Top learnings: [list]
```

Save to: `sqad-method/output/reports/refresh-git-[date].md`

## Behavioral Rules

- This is the SLOW operation. /refresh is fast.
- Wherever .git exists, CONTEXT.md must exist.
- Never fabricate PR comments.
- Frequency >= 3 = real pattern. Below that = noise.
- Respect line limits. Prune low-frequency learnings.
- Tag everything for next-run identification.
