---
fragment: tracker/jira
description: Jira issue tracker integration
load_when: "tracker.type == jira"
extends: _tracker-base
---

# Jira Integration

## Status Mapping

| Jira Status | Canonical |
|---|---|
| To Do, Open, Backlog | `TODO` |
| In Progress, In Development | `IN_PROGRESS` |
| In Review, Code Review | `IN_REVIEW` |
| Done, Closed, Resolved | `DONE` |
| Blocked, Impediment | `BLOCKED` |

## ID Pattern

`[A-Z]+-\d+` (e.g., `PROJ-123`, `ACME-456`)

## MCP Tools (if available)

- `jira_get_issue` — fetch issue by key
- `jira_search` — JQL search
- `jira_create_issue` — create new issue
- `jira_update_issue` — update fields
- `jira_list_sprints` — get active/future sprints

## JQL Quick Reference

```
# Current sprint stories assigned to user
assignee = currentUser() AND sprint in openSprints() AND type = Story

# Blocked items in project
project = {{tracker_project_key}} AND status = Blocked

# Stories completed this sprint
project = {{tracker_project_key}} AND sprint in openSprints() AND status = Done
```

## Agent Tips

- Always use `{{tracker_project_key}}` in JQL, never hardcode
- Check if Jira MCP is available before using tools — fall back to manual if not
- Sprint data includes velocity (sum of story points in completed stories)
