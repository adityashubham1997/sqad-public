---
fragment: tracker/shortcut
description: Shortcut (formerly Clubhouse) issue tracker integration
load_when: "tracker.type == shortcut"
extends: _tracker-base
---

# Shortcut Integration

## Status Mapping

| Shortcut State | Canonical |
|---|---|
| Unstarted, Backlog | `TODO` |
| Started, In Development | `IN_PROGRESS` |
| Ready for Review | `IN_REVIEW` |
| Done, Completed | `DONE` |
| Blocked | `BLOCKED` |

## ID Pattern

`sc-\d+` or `#\d+` (e.g., `sc-12345`, `#12345`)

Shortcut uses numeric IDs with optional `sc-` prefix.

## MCP Tools (if available)

- `shortcut_get_story` — fetch story by ID
- `shortcut_search` — search stories
- `shortcut_create_story` — create new story
- `shortcut_update_story` — update fields/state
- `shortcut_list_iterations` — get iterations (sprints)

## API Quick Reference

```bash
# Search stories in project
curl -s "https://api.app.shortcut.com/api/v3/search/stories" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN" \
  -d '{"query": "project:{{tracker_project_key}} state:Started"}'

# Get current iteration
curl -s "https://api.app.shortcut.com/api/v3/iterations" \
  -H "Shortcut-Token: $SHORTCUT_API_TOKEN"
```

## Agent Tips

- Shortcut uses "Iterations" for sprints
- Stories belong to "Projects" (equivalent to epics in other trackers)
- Epics in Shortcut are higher-level groupings above Projects
- Story points are called "Estimate" — use Fibonacci scale
- Use `{{tracker_project_key}}` for project filtering
