---
fragment: safety-guards
description: >
  Safety enforcement layer for all 7 supported IDEs. Provides hook parity across
  Claude Code (automatic harness hooks), Windsurf, Cursor, Codex, Kiro, Gemini,
  and Antigravity (all script-invoked via hooks.sh). All agents MUST follow these rules.
version: 2.0
token_estimate: 500
---

# Safety Guards (Multi-IDE Hook Parity)

## MANDATORY: Run Hook Script at Skill Start

**Every non-Claude-Code IDE skill MUST run the hook script as its FIRST action.
This applies to: Windsurf, Cursor, Codex, Kiro, Gemini, Antigravity.**

```bash
bash squad-method/tools/hooks.sh all
```

If ANY check returns ❌ BLOCK → **STOP. Do not proceed.** Show the user the failure
and the fix instruction. Do not attempt to work around blocked checks.

> **Honest caveat:** In Claude Code, hooks fire at the harness level — the LLM
> cannot bypass them. In all other IDEs (Windsurf, Cursor, Codex, Kiro, Gemini,
> Antigravity), this script runs when the skill calls it. This is "hard to
> bypass" not "impossible to bypass." The enforcement is real but relies on
> skill compliance, not harness interception.

---

## Hook 1: Session Skills Gate

**When:** Skill start (Step 0 / Phase 0)
**Claude Code equivalent:** settings.json → PreToolUse(Read|Bash)

**Check:** SQUAD skills exist in an IDE directory, `config.yaml` present, `_base-agent.md` present.

```bash
bash squad-method/tools/hooks.sh session-start
```

**If BLOCKED:** Run installer to install SQUAD skills.

---

## Hook 2: Pre-Edit Guard (auto-generated files)

**When:** Before editing ANY file
**Claude Code equivalent:** PreToolUse(Write|Edit)

**NEVER edit** files matching these patterns — they are auto-generated:
- Build outputs: `dist/`, `build/`, `.next/`, `target/`, `out/`
- Lock files: `package-lock.json`, `yarn.lock`, `poetry.lock`, `Cargo.lock`
- Generated code: `*.generated.*`, `*.pb.go`, `*_pb2.py`, `*.g.dart`
- IDE auto-config: `.idea/workspace.xml`, `.vscode/settings.json`

```bash
bash squad-method/tools/hooks.sh pre-edit [FILE_PATH]
```

**If BLOCKED:** "⚠️ This file is auto-generated. Modify the source, not the output."

---

## Hook 3: Secret Detection

**When:** Before committing ANY file
**Claude Code equivalent:** PreToolUse(Bash) for git commands

**Scan for:**
- AWS access keys (`AKIA[0-9A-Z]{16}`)
- Private keys (`-----BEGIN.*PRIVATE KEY`)
- API keys, tokens, passwords in code
- Connection strings with embedded credentials
- `.env` files with real values

```bash
bash squad-method/tools/hooks.sh secrets [FILE_PATH]
```

**If BLOCKED:** "⚠️ Secret detected. Never commit credentials to source control."

---

## Hook 4: Progress Save (pre-compact equivalent)

**When:** Before long operations or when context window is filling
**Claude Code equivalent:** PreCompact event

Windsurf/Cursor/Codex/Kiro/Gemini/Antigravity have no PreCompact event. Instead, skills MUST:
- Update progress doc BEFORE every user gate (already enforced by _base-agent.md)
- Run progress save check when conversation exceeds ~40 messages:

```bash
bash squad-method/tools/hooks.sh progress-save
```

---

## Hook 5: Gate Ledger Check

**When:** At phase transitions
**Claude Code equivalent:** Stop hook → gate-ledger-finalize.sh

Verifies all gates for the current phase are PASSED before advancing:

```bash
bash squad-method/tools/hooks.sh gate-ledger
```

---

## Pre-Edit Safety Checks (apply to ALL edits)

Before every implementation or code change, silently verify:
1. Run `hooks.sh pre-edit [FILE_PATH]` for potentially auto-generated files
2. Ask if in doubt, never assume
3. Use the detected tech stack ({{detected_languages}}, {{detected_frameworks}})
4. Follow existing patterns in the codebase
5. Changes must be minimal and surgical
6. Tag all assumptions for user verification

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

---

## Hook Parity Summary

| # | Hook | Claude Code | Windsurf / Cursor / Codex / Kiro / Gemini / Antigravity | Enforcement |
|---|---|---|---|---|
| 1 | Skills Gate | `settings.json` → automatic | `hooks.sh session-start` | Skill calls at Step 0 |
| 2 | Pre-Edit Guard | `settings.json` → automatic | `hooks.sh pre-edit` | Skill calls before edits |
| 3 | Secret Detection | `settings.json` → automatic | `hooks.sh secrets` | Skill calls before commit |
| 4 | Progress Save | PreCompact → automatic | `hooks.sh progress-save` | Skill calls at 40+ messages |
| 5 | Gate Ledger | Stop hook → automatic | `hooks.sh gate-ledger` | Skill calls at phase boundary |

## Orchestration Parity Summary (All 7 IDEs)

| Capability | Claude Code | Codex (OpenAI) | Windsurf / Cursor / Kiro / Gemini / Antigravity | Notes |
|---|---|---|---|---|
| Parallel subagents | `Agent()` tool → true parallel (Path A) | CLI subprocess (Path B) | Sequential simulation (Path C) | Wall-clock slower in Path C |
| CLI subprocess dispatch | `claude --print` bg (Path B) | Codex session spawns (Path B) | Not available without CLI | Platform limitation |
| Per-agent model selection | fast/default/heavy per agent | model flag per spawn | Single model (user-selected) | Platform limitation |
| Isolated agent context | Separate context per `Agent()` call | Separate per subprocess | Shared conversation context | Platform limitation |
| Dependency DAG ordering | ✅ R1 enforced | ✅ R1 enforced | ✅ R1 enforced | **Full Parity** |
| Output contracts (R3) | ✅ Schema validated | ✅ Schema validated | ✅ Schema validated | **Full Parity** |
| Run manifests (R4) | ✅ Written per agent | ✅ Written per agent | ✅ Written per agent | **Full Parity** |
| Anti-skip (R8) | ✅ Every agent runs | ✅ Every agent runs | ✅ Every agent runs | **Full Parity** |
| Gate ledger (R9) | ✅ Hook-enforced | ✅ Script-enforced | ✅ Script-enforced | **Full Parity** |
| Quality Gate (V2) | ✅ Signal detection | ✅ Signal detection | ✅ Signal detection | **Full Parity** |
| Learning Loop | ✅ tracking.jsonl | ✅ tracking.jsonl | ✅ tracking.jsonl | **Full Parity** |
| Hook enforcement | Automatic (harness) | Script (skill calls) | Script (skill calls) | Claude = impossible to bypass |

### IDE Path Detection (auto-detect at runtime)

| IDE | Path | Reason |
|---|---|---|
| Claude Code | **A** (native subagent tool) | Has `Agent()` tool in harness |
| Codex | **B** (CLI subprocess) | OpenAI CLI with model/effort flags |
| Windsurf | **C** (sequential simulation) | No external subprocess spawning |
| Cursor | **C** (sequential simulation) | No external subprocess spawning |
| Kiro | **C** (sequential simulation) | No external subprocess spawning |
| Gemini | **C** (sequential simulation) | No external subprocess spawning |
| Antigravity | **C** (sequential simulation) | No external subprocess spawning |

> **Honest statement:** Most IDEs beyond Claude Code have no native subagent API
> and no way to spawn parallel LLM threads without external API calls. Path C
> (sequential simulation) is the best we can do within their infrastructure.
> All correctness guarantees are preserved — only wall-clock time and per-agent
> model isolation are lost. If an IDE gains subprocess or agent capabilities in
> the future, update the path detection logic in `_base-agent.md` and `agent-orchestrator.md`.

```yaml
rule_manifest:
  fragment_id: safety-guards
  rules:
    - { id: H1, name: skills_gate_session_start,     severity: HARD, fires_in: [any] }
    - { id: H2, name: pre_edit_auto_generated_guard, severity: HARD, fires_in: [phase_3, phase_4, phase_5] }
    - { id: H3, name: secret_detection_pre_commit,   severity: HARD, fires_in: [phase_6] }
    - { id: H4, name: progress_save_pre_compact,     severity: HARD, fires_in: [any] }
    - { id: H5, name: gate_ledger_phase_check,       severity: HARD, fires_in: [any] }
```
