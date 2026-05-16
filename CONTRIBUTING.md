# Contributing to SQUAD-Public

## Architecture

```
squad-public/
├── bin/                  # CLI entry point
├── lib/
│   ├── detect/           # Stack, cloud, IDE, tracker detection
│   ├── generate/         # Config, context files, IDE skill deployment
│   ├── transform/        # IDE-specific transformers (7 IDEs)
│   ├── init.js           # Installation orchestrator
│   ├── update.js         # Update logic
│   └── uninstall.js      # Cleanup
├── squad-method/
│   ├── agents/           # 14 agents + _base-agent
│   ├── fragments/        # Modular knowledge (rubric/, stack/, cloud/, tracker/)
│   ├── skills/           # 25 canonical skills
│   ├── templates/        # Output templates
│   ├── tools/            # Knowledge graph builder
│   ├── context/          # Context file templates
│   └── config.yaml       # Team configuration template
├── test/                 # Node.js built-in test runner
└── package.json
```

## Adding a New Agent

1. Create `squad-method/agents/your-agent.md` following the frontmatter schema:
   ```yaml
   ---
   extends: _base-agent
   name: YourAgent
   agent_id: squad-your-role
   role: Your Role Title
   icon: "🎯"
   review_lens: "What this agent specifically looks for"
   capabilities: [list, of, capabilities]
   ---
   ```
2. Add to `squad-method/config.yaml` agents list
3. Reference in relevant skills

## Adding a New Skill

1. Create `squad-method/skills/squad-your-skill/SKILL.md`
2. Use frontmatter:
   ```yaml
   ---
   name: squad-your-skill
   description: >
     One-paragraph description of what this skill does and when to trigger it.
   ---
   ```
3. Reference agents by their SQUAD-Public names (not original SQUAD names)
4. Include user gates at every phase transition
5. Include tracking step as final step

## Adding a Fragment

Fragments are modular knowledge files loaded conditionally:

- **`fragments/rubric/`** — review checks per language/framework
- **`fragments/stack/`** — language-specific patterns and anti-patterns
- **`fragments/cloud/`** — cloud provider rules and checks
- **`fragments/tracker/`** — tracker integration adapters

Each fragment has frontmatter specifying when to load:
```yaml
---
fragment: category/name
description: What this fragment provides
load_when: "config condition expression"
---
```

## Adding an IDE Transformer

1. Create `lib/transform/your-ide.js`
2. Export a `deploy(workspacePath, skill, options)` function
3. Export `IDE_ID` and `SKILLS_PATH` constants
4. Register in `lib/generate/ide-skills.js` TRANSFORMER_MAP

Most IDEs use the same `SKILL.md` format — use `deploySkillDir` from `base.js`.
For IDEs with custom formats (like Cursor's `.mdc`), implement a content transform.

## Adding a Tracker Adapter

1. Create `squad-method/fragments/tracker/your-tracker.md`
2. Follow the schema in `_tracker-base.md`
3. Map statuses to canonical: `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `DONE`, `BLOCKED`
4. Add detection logic to `lib/detect/tracker.js`

## Testing

```bash
npm test                    # Run all tests
node --test test/file.test.js  # Run specific test file
```

Tests use Node.js built-in test runner (no dependencies). Tests should:
- Use temp directories (cleaned up in `after()`)
- Not depend on network or external services
- Be fast (<100ms each)

## Code Style

- ESM imports (`import` not `require`)
- No external runtime dependencies (Node.js built-in only)
- Descriptive JSDoc on exported functions
- Existing code patterns > personal preference

## Agent Name Reference

| Agent | Role | ID |
|---|---|---|
| Nova | Dev Analyst | squad-analyst |
| Atlas | Solution Architect | squad-architect |
| Forge | Dev Lead | squad-dev-lead |
| Cipher | QA Engineer | squad-qa |
| Sentinel | QA Architect | squad-qa-architect |
| Tempo | Scrum Master | squad-scrum |
| Raven | Code Reviewer | squad-reviewer |
| Catalyst | Release Engineer | squad-release |
| Oracle | Technical Researcher | squad-researcher |
| Scribe | Tech Writer | squad-doc |
| Compass | Product Manager | squad-pm |
| Aegis | Security Analyst | squad-security |
| Stratos | Cloud Architect | squad-cloud-architect |
| Phoenix | Cloud DevOps/SRE | squad-devops |
