---
fragment: tracker/notion
description: Notion database as issue tracker integration
load_when: "tracker.type == notion"
extends: _tracker-base
---

# Notion Integration

## Status Mapping

Notion databases use custom "Status" property. Common mappings:

| Notion Status | Canonical |
|---|---|
| Not started, Backlog, To do | `TODO` |
| In progress | `IN_PROGRESS` |
| In review | `IN_REVIEW` |
| Done, Complete | `DONE` |
| Blocked | `BLOCKED` |

⚠️ Notion status names are user-defined — check the actual database schema.

## ID Pattern

Notion pages use UUIDs. Teams often add a custom "ID" or "Ticket #" property.
Pattern varies: `TASK-\d+`, `#\d+`, or UUID.

## MCP Tools (if available)

- `notion_get_page` — fetch page/task by ID
- `notion_query_database` — query database with filters
- `notion_create_page` — create new page in database
- `notion_update_page` — update properties

## API Quick Reference

```bash
# Query database for in-progress tasks
curl -s "https://api.notion.com/v1/databases/{{tracker_project_key}}/query" \
  -H "Authorization: Bearer $NOTION_API_KEY" \
  -H "Notion-Version: 2022-06-28" \
  -d '{"filter": {"property": "Status", "status": {"equals": "In progress"}}}'
```

## Agent Tips

- `{{tracker_project_key}}` is the Notion database ID
- Notion is flexible — schema varies per workspace
- Relations link tasks to sprints/epics (as related databases)
- Sprint tracking is often a separate "Sprints" database linked via relation
- Check database schema before querying — property names are custom
- Notion API pagination uses `start_cursor` + `has_more`
- If Notion MCP isn't available, the API is REST-based
