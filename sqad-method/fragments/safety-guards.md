---
fragment: safety-guards
description: >
  Safety checks for all environments. All agents MUST follow these rules.
  In Claude Code, hooks enforce some automatically. In other IDEs, agents
  self-enforce them.
token_estimate: 200
---

# Safety Guards

## Pre-Edit Reminder

Before every implementation or code change, silently verify:
1. Ask if in doubt, never assume
2. Use the detected tech stack ({{detected_languages}}, {{detected_frameworks}})
3. Follow existing patterns in the codebase
4. Changes must be minimal and surgical
5. Tag all assumptions for user verification

## File Scope Protection

- Never modify files outside the scope of the current task
- Never push to remote without explicit user approval
- Never create files in system directories or outside the workspace
- Never delete files unless explicitly requested and confirmed

## Sensitive File Protection

Before editing any file, check if it is auto-generated:
- Build output directories (`dist/`, `build/`, `.next/`, `target/`)
- Lock files (`package-lock.json`, `yarn.lock`, `poetry.lock`) — only modify via package manager
- Generated code (`*.generated.*`, `*.pb.go`, `*_pb2.py`)
- IDE config files (`.idea/`, `.vscode/settings.json`) — ask before modifying

If a file appears auto-generated, **ASK** before editing:
"⚠️ This file appears to be auto-generated. Should I modify it directly, or
should the change be made in the source that generates it?"

## Secret Protection

Before committing ANY file, scan for:
- API keys, tokens, passwords
- AWS access keys (`AKIA...`)
- Private keys (`-----BEGIN`)
- Connection strings with credentials
- `.env` files with real values

If detected: **STOP** and warn the user. Never commit secrets.

## Destructive Action Guard

Before any destructive action (delete, drop, truncate, force push):
1. State exactly what will be destroyed
2. Ask for explicit confirmation
3. Wait for approval
4. Never combine destructive actions — one at a time
