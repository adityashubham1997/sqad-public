---
fragment: tracker/linear
description: Linear issue tracker integration
load_when: "tracker.type == linear"
extends: _tracker-base
---

# Linear Integration

## Status Mapping

| Linear Status | Canonical |
|---|---|
| Backlog, Triage | `TODO` |
| In Progress, Started | `IN_PROGRESS` |
| In Review | `IN_REVIEW` |
| Done, Completed | `DONE` |
| Canceled | `CANCELED` |

## ID Pattern

`[A-Z]+-\d+` (e.g., `ENG-123`, `FE-456`)

Linear uses team prefix + auto-incrementing number.

## MCP Tools (if available)

- `linear_get_issue` — fetch issue by identifier
- `linear_search` — search issues with filters
- `linear_create_issue` — create new issue
- `linear_update_issue` — update fields/state
- `linear_list_cycles` — get active/upcoming cycles

## GraphQL Quick Reference

```graphql
# Current cycle issues assigned to user
{
  issues(filter: {
    assignee: { isMe: { eq: true } }
    cycle: { isActive: { eq: true } }
  }) {
    nodes { identifier title state { name } priority }
  }
}

# Issues by team and state
{
  issues(filter: {
    team: { key: { eq: "{{tracker_project_key}}" } }
    state: { type: { in: ["started", "unstarted"] } }
  }) {
    nodes { identifier title assignee { name } }
  }
}
```

## Agent Tips

- Linear uses "Cycles" instead of "Sprints"
- Priority is numeric: 0=None, 1=Urgent, 2=High, 3=Medium, 4=Low
- Labels and projects are separate concepts from teams
- Use team key `{{tracker_project_key}}` for filtering
- Linear API is GraphQL — check if MCP wraps it
