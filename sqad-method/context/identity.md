---
node: identity
parent: root
children: []
token_estimate: 250
load_when: "always — loaded via root CONTEXT.md"
---

# Project Identity

## Company
- **Name:** {{company_name}}
- **Domain:** {{project_domain}}
- **Compliance:** {{compliance}}

## Project
- **Name:** {{project_name}}
- **Description:** {{project_description}}
- **Type:** {{project_type}}

## Team
- **Name:** {{team_name}}

## User
- **Name:** {{user_name}}
- **Role:** {{user_role}}

## Critical Rules (always active)

1. All tests must pass before any story is considered done
2. TDD: write tests first, then implementation
3. {{tracker_type}} is the single source of truth for stories, sprints, defects
4. User confirms at every phase gate — no autonomous multi-step execution
5. Never fabricate data — if uncertain, ASK
6. Use detected tech stack ({{detected_languages}}, {{detected_frameworks}}) unless explicitly told otherwise
7. All assumptions must be declared, tagged, and verified by user
8. Agents must ask when in doubt — the cost of asking is zero
9. Security is everyone's responsibility — Aegis enforces, all agents aware

## Quick Reference

- **Test:** `{{test_command}}`
- **Build:** `{{build_command}}`
- **Lint:** `{{lint_command}}`
- **GitHub:** {{github_host}}/{{github_org}}
- **Default branch:** {{default_branch}}
