---
name: squad-git-learn
description: >
  Learn from the team's git history — PR comments, review feedback, commit
  patterns. Extracts lessons and updates CONTEXT.md files. Use when user says
  "git learn", "learn from PRs", "extract git lessons", or runs /git-learn.
---

# SQUAD-Public Git Learn — Learn from Team's Git History

Analyse git history to extract patterns, lessons, and team conventions.
Updates CONTEXT.md files wherever `.git` exists.

Read `squad-method/config.yaml` for team config.

## Step 0 — Find All Git Boundaries

```bash
GIT_ROOTS=""
[ -d ".git" ] && GIT_ROOTS=". "
for dir in */; do [ -d "$dir/.git" ] && GIT_ROOTS="$GIT_ROOTS$dir "; done
echo "Git boundaries: $GIT_ROOTS"
```

## Input Modes

- `all` → analyse ALL repos (default)
- `repo-name` → specific repo only
- `--prs=50` → override PR count (default 30, max 100)

## Step 1 — Gather Git Data

For each git boundary:

### 1a. Recent Merged PRs
```bash
gh pr list --state merged --limit [N] --json number,title,headRefName,mergedAt,reviews,comments
```

### 1b. PR Review Comments
```bash
for pr in [merged PRs]; do
  gh api repos/$OWNER_REPO/pulls/$pr/comments --jq '.[].body'
  gh api repos/$OWNER_REPO/pulls/$pr/reviews --jq '.[] | select(.body != "") | .body'
done
```

### 1c. Commit History
```bash
git log --oneline -100 --format="%s"
```

**USER GATE:** "Scanned [N] repos, [M] PRs, [K] review comments. Analyse? [Continue/Adjust]"

## Step 2 — Extract Patterns

Per-repo and cross-repo patterns:
- Review comment themes (frequency, lesson)
- Commit message conventions
- Code convention learnings
- Cross-repo relationships

## Step 3 — Generate Report

Save to: `squad-method/output/reports/git-learn-[date].md`

Offer:
- **(a)** Update _base-agent.md with cross-repo rules
- **(b)** Update per-repo CONTEXT.md files
- **(c)** Create team-conventions.md fragment
- **(d)** All of the above
- **(e)** Just save the report

## Step 4 — Apply Learnings

Tag all updates: `<!-- git-learn: [date], source: [N] PRs -->`

## Behavioral Rules

- `.git` = context boundary. CONTEXT.md must exist there.
- Never fabricate review comments — quote exactly
- If `gh` fails, fall back to `git log` only
- Minimum 5 merged PRs for meaningful analysis
- Report patterns, not individual blame
- Tag all updates with date for next run to identify
