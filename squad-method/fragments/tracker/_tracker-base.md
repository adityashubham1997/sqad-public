---
fragment: tracker/_tracker-base
description: Abstract interface for issue tracker integration
load_when: "tracker.type is not empty"
---

# Tracker Abstraction Layer

## Universal Status Mapping

All trackers map to these canonical states:

| Canonical | Description |
|---|---|
| `TODO` | Not started |
| `IN_PROGRESS` | Work has begun |
| `IN_REVIEW` | Ready for review |
| `DONE` | Completed and verified |
| `BLOCKED` | Cannot proceed |

## Universal Operations

All tracker adapters support:

1. **Fetch story** — get work item by ID → title, description, AC, status, assignee, sprint
2. **Search stories** — query by sprint/cycle, assignee, status
3. **Update status** — move to canonical state
4. **Create story** — with title, description, AC, labels
5. **Link items** — parent/child, blocks/blocked-by, related

## ID Pattern Detection

| Tracker | Pattern | Example |
|---|---|---|
| Jira | `[A-Z]+-\d+` | PROJ-123 |
| Linear | `[A-Z]+-\d+` | ENG-456 |
| Shortcut | `sc-\d+` | sc-789 |
| GitHub Issues | `#\d+` | #42 |
| Notion | UUID | page ID |

## Agent Usage

- **Tempo** — sprint/cycle data, velocity, standup
- **Nova** — story analysis, AC extraction
- **Compass** — story validation, priority
- **Catalyst** — release stories, completion status
- **Oracle** — research related work items
