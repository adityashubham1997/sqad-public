---
node: root
children: [identity, architecture, stack, repos]
token_estimate: 200
load_when: "always — this is the navigation index"
---

# SQAD-Public Context Tree

This is the root index for SQAD-Public's tree-based context system.
Navigate to child nodes for detailed context. Only load what you need.

## Tree Structure

```
index.md (this file — always loaded, ~200 tokens)
├── identity.md         — company, project, team, critical rules
├── architecture.md     — system architecture (auto-generated from scan)
├── stack.md            — detected tech stack (auto-generated from detection)
└── repos/
    ├── index.md        — repository overview map
    └── {repo-name}.md  — per-repo detail (loaded when working in repo)
```

## Navigation Rules

1. **Always loaded:** This index + identity.md (via root CONTEXT.md)
2. **Load on demand:** architecture.md, stack.md — when cross-repo or design work
3. **Load per repo:** repos/{name}.md — when working in a specific repository
4. **Never preload:** All nodes load only when relevant to the current task

## How Agents Use This Tree

- Skills reference context nodes via `sqad-method/context/{node}.md`
- The LLM reads this index first, then navigates to the needed node
- Fragments in `sqad-method/fragments/` provide reusable stack/cloud knowledge
- Agent personas in `sqad-method/agents/` provide role-specific behavior
