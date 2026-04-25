# Plugins Directory

Place custom stack fragments, rubric modules, or agent extensions here.

## How Plugins Work

Files in this directory are loaded alongside built-in fragments. Each plugin must have YAML frontmatter with a `load_when` condition.

### Example: Custom Stack Fragment

```markdown
---
fragment: stack/remix
description: Remix framework patterns
load_when: "stack.frameworks includes remix"
---

# Remix Stack Context
[Your patterns, rules, anti-patterns]
```

### Example: Custom Rubric Module

```markdown
---
rubric: team-standards
description: Team-specific review checks
load_when: "always"
---

| ID | Check | Rule | Severity |
|---|---|---|---|
| TEAM-1 | **Logging** | Every API endpoint must log request/response | MAJOR |
```

## Preserved on Update

This directory is **never overwritten** by `sqad-public update`. Your plugins are safe.

## Future: Plugin CLI (Phase 4)

```bash
npx sqad-public plugin add <url>   # Coming soon
```
