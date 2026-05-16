---
fragment: tracker/github-issues
description: GitHub Issues tracker integration
load_when: "tracker.type == github-issues"
extends: _tracker-base
---

# GitHub Issues Integration

## Status Mapping

| GitHub State | Canonical |
|---|---|
| Open (no assignee) | `TODO` |
| Open (assigned, "in progress" label) | `IN_PROGRESS` |
| Open ("review" label or linked PR) | `IN_REVIEW` |
| Closed | `DONE` |
| Open ("blocked" label) | `BLOCKED` |

## ID Pattern

`#\d+` (e.g., `#42`, `#123`)

## CLI Usage

```bash
# Fetch issue
gh issue view 42 --json title,body,labels,assignees,milestone,state

# Search issues
gh issue list --label "bug" --state open --milestone "v1.0"

# Create issue
gh issue create --title "..." --body "..." --label "enhancement" --assignee "@me"

# Close issue
gh issue close 42 --comment "Fixed in PR #43"
```

## Sprint Equivalent

GitHub uses **Milestones** as sprint equivalent:
- Milestone = Sprint/Iteration
- Labels = Story type, priority, status refinement
- Projects (v2) = Board views with custom fields

## Agent Tips

- Use `gh` CLI for all GitHub Issues operations
- Milestones provide sprint-level grouping
- Labels are the primary mechanism for status beyond open/closed
- Link PRs to issues with `Fixes #42` in PR body
