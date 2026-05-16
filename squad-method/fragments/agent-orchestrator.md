---
fragment: agent-orchestrator
description: Deterministic parallel agent dispatch — ordered by dependency, max concurrency limits
included_by: dev-task, dev-analyst, brainstorm, review-pr, qa-task, create-prd, create-story
load_when: "skill dispatches >1 agent"
---

# SQUAD-Public — Deterministic Parallel Agent Orchestrator

**Loaded by:** every skill that dispatches >1 agent (`/dev-task`, `/dev-analyst`, `/brainstorm`, `/review-pr`, `/qa-task`, `/create-prd`, `/create-story`).
**Purpose:** topological, deterministic, parallel agent dispatch with verifiable completion. Agents run in dependency order, fan out where independent, and the orchestrator guarantees every agent ran.

---

## R1 — Three Mandatory Axes (per agent invocation)

| Axis | Source | Decided by |
|---|---|---|
| Model (fast/default/heavy) | `config.yaml → model_routing` | `getModel(agentId, phase, ctx)` |
| Effort (low/med/high/max — CLI path only) | same | `getEffort(agentId, phase, ctx)` |
| **Dispatch (sequential / parallel-fanout)** | THIS fragment | `getDispatchPlan(phase, agents, ctx)` |

**R1.1**: All three axes MUST be resolved BEFORE the first agent is invoked. NEVER invoke an agent without explicit model + effort + dispatch decision recorded in the run manifest.

## R2 — Dependency Graph (per phase)

Each agent declares **inputs** (what it consumes) and **outputs** (what it produces). The orchestrator builds a DAG, topologically sorts it, and fans out independent nodes in parallel.

### Example — Phase 1 (Analysis)

```
Oracle (research + KG + precedent)  ┐
Forge  (detect framework + scope)   ├─→ Nova (assemble requirements) ─→ Compass (frame value + summary)
Atlas  (architecture inference)     ┘                                   ─→ engineer [APPROVED]
```

**Parallel layer 1 (no dependencies):** Oracle, Forge, Atlas — fan out simultaneously.
**Sync barrier:** wait for all 3 to complete + emit their declared outputs.
**Sequential layer 2:** Nova (consumes layer-1 outputs) → Compass (consumes Nova's output).
**User gate:** engineer `[APPROVED]`.

### Example — Phase 5 (Multi-agent review)

```
Raven    (logic/adversarial)  ┐
Atlas    (architecture)       │
Sentinel (security)           ├──→ Phoenix (synthesis verdict)
Forge    (code quality)       │
Cipher   (test coverage)      ┘
```

**5 reviewers, R5 cap = 5 → single batch:**
- **Batch 1 (parallel):** Raven + Atlas + Sentinel + Forge + Cipher — 5 concurrent subagents.
- **Sync barrier:** all 5 emit findings before Phoenix runs.
- **Sequential layer 2:** Phoenix synthesizes into single verdict.

## R3 — Output Contract (every agent declares)

Per agent, in their `.md` frontmatter, MUST appear:

```yaml
inputs:                                     # what I consume from prior agents
  - { from: oracle,  artifact: research_brief }
  - { from: forge,   artifact: framework_detection }
outputs:                                    # what I produce — orchestrator verifies
  - { id: req_ids,        format: yaml,    schema: req-id-list-v1 }
  - { id: pre_write_summary, format: markdown, max_lines: 60 }
deterministic: true                         # produces same output for same inputs
parallelizable_with: [oracle, forge, atlas] # safe to fan out alongside
```

**R3.1**: Output MUST be machine-parseable (YAML / JSON / structured markdown table). Free-form prose is NOT a valid output.
**R3.2**: Orchestrator parses each agent's output and validates against its schema. Schema mismatch = re-dispatch with `[INCOMPLETE]` flag and the missing fields cited.
**R3.3**: Max **2 re-dispatch attempts** per agent. Third failure → STOP, escalate to engineer.

## R4 — Determinism Guarantees

- **R4.1 RUN MANIFEST**: Every dispatch writes a JSON run manifest to `squad-method/output/.run/{phase}-{ISO8601}.json` containing: agent_id, model, effort, inputs_hash, outputs_hash, start_ts, end_ts, exit_status, retry_count.
- **R4.2 INPUTS HASH**: Each agent's inputs are content-hashed (SHA-256). Same hash → same model + effort decision → expected same output. Different output for same hash = non-determinism flag (logged, surfaced to engineer).
- **R4.3 SEQUENCED OUTPUT EMISSION**: Even under parallel fan-out, outputs are written to disk in **agent_id alphabetical order** at the sync barrier so downstream consumers always see consistent ordering.
- **R4.4 NO RACE CONDITIONS**: Each agent writes ONLY to its declared output files. Two agents writing the same path = critical orchestrator violation (block all subsequent dispatches).

## R5 — Parallel Dispatch Limits

| Path | Max concurrent | IDEs | Reason |
|---|---|---|---|
| **A** — Native subagent tool | **5** | Claude Code | API rate-limit + context budget |
| **B** — CLI subprocess | **3** | Codex (via codex CLI) | local CPU + token cost |
| **C** — Sequential simulation | **1** | Windsurf, Cursor, Kiro, Gemini, Antigravity | single thread, no native subagent API |

**R5.1**: If layer width > limit, orchestrator chunks into batches of `limit` size and runs sequentially-of-batches.
**R5.2**: Critical-path agent (the longest-duration on the topological path) is dispatched FIRST in each batch to minimize wall-clock.

## R6 — Completion Verification (the "ran everything" check)

After every phase:

1. **C1**: List of expected agents (from phase plan) compared to list of agents in run manifest. Any missing → STOP, re-dispatch.
2. **C2**: Each agent's outputs validated against their declared schema. Any invalid → re-dispatch (R3.3 limit).
3. **C3**: Outputs hash recorded; if a downstream agent's input depends on an upstream output, the input_hash MUST equal the upstream's output_hash (no silent input drift).
4. **C4**: Emit a phase-completion summary table:

   ```
   Phase 1 Completion — All 5 agents ran ✅
   | Agent    | Model   | Effort | Duration | Output bytes | Status |
   | oracle   | default | medium | 12s      | 2.1 KB       | ✅      |
   | forge    | default | medium | 4s       | 0.4 KB       | ✅      |
   | atlas    | heavy   | high   | 18s      | 3.0 KB       | ✅      |
   | nova     | default | medium | 9s       | 1.6 KB       | ✅      |
   | compass  | default | medium | 7s       | 1.1 KB       | ✅      |
   ```

5. **C5**: If any row shows ❌ or `MISSING` → orchestrator HALTS phase advancement until resolved.

## R7 — Orchestrator Implementation Notes

- **Path A (Native subagent tool — Claude Code)**: dispatcher = a single conversation issues N parallel `Agent(...)` calls in one message → harness fans out to N concurrent subagents.
- **Path B (CLI subprocess — Codex)**: dispatcher = a Bash script issues N parallel `codex --print "..." &` background processes + `wait` barrier; outputs collected from per-agent files. Can also use `claude` CLI if installed.
- **Path C (Sequential simulation — Windsurf, Cursor, Kiro, Gemini, Antigravity)**: No native subagent API and no CLI for background dispatch. The orchestrator runs agents **one-at-a-time within the main conversation** using structured persona switching. Each agent's output is collected into the same R3 schema. Dependency ordering (R1) still enforced. Parallel layers execute sequentially left-to-right.
- **All paths**: must read the same run manifest format (R4.1) so a session can switch paths without losing determinism.

### Path C Protocol (Sequential IDEs — Windsurf, Cursor, Kiro, Gemini, Antigravity)

Limitation: single LLM thread, no `Agent()` tool, no subprocess CLI.

**What Path C does:**
1. Orchestrator resolves dependency DAG (R1) — same as Path A/B
2. For each parallel layer, agents run **sequentially** in priority order (critical-path first per R5.2)
3. Before each agent turn, the LLM loads:
   - Agent persona from `squad-method/agents/{name}.md`
   - Phase-specific system prompt + context
   - Prior agent outputs from the same layer (if needed for cross-reference)
4. Agent output validated against R3 schema inline
5. Run manifest entry written per agent (same format as R4.1)
6. Phase completion table emitted (same as R6 C4)

**What Path C cannot do (honest gaps):**
- ❌ True parallel execution — wall-clock is sum of all agents, not max
- ❌ Per-agent model selection — uses whatever model the user selected in their IDE
- ❌ Isolated context per agent — all agents share the same conversation context window

**What Path C preserves:**
- ✅ Dependency ordering (R1 DAG)
- ✅ Output contracts (R3 schemas)
- ✅ Run manifest + determinism hashing (R4)
- ✅ Anti-skip rules (R8) — every agent runs
- ✅ Gate ledger enforcement (R9)
- ✅ Completion verification (R6)

### Path Selection (auto-detect across all 7 IDEs)

| Signal | Path | IDEs | Parallelism |
|---|---|---|---|
| `Agent()` tool in toolbox | A (native subagent) | Claude Code | ✅ true parallel |
| `codex` or `claude` CLI on PATH | B (CLI subprocess) | Codex, any with CLI | ✅ true parallel |
| Neither available | C (sequential simulation) | Windsurf, Cursor, Kiro, Gemini, Antigravity | ❌ sequential |

## R8 — Anti-skip Rules (HARD)

- **R8.1**: NEVER skip an agent because "it's faster" — every declared agent MUST run or the phase is INCOMPLETE.
- **R8.2**: NEVER cache outputs across sessions unless the engineer explicitly tags `[CACHE-OK]` on the input.
- **R8.3**: NEVER dispatch an agent without recording its decision in the run manifest BEFORE invocation (no retroactive logging).
- **R8.4**: If two agents have the same output_id declared, the orchestrator REJECTS the phase plan as malformed.

## R9 — Rule & Gate Enforcement Ledger (the "everything ran" guarantee)

### R9.1 — Rule Manifest (per fragment)

Every fragment under `squad-method/fragments/` MUST declare its rules in a YAML block at the bottom:

```yaml
rule_manifest:
  fragment_id: my-fragment
  rules:
    - { id: R0, name: framework_detection, severity: HARD, fires_in: [phase_1, phase_3, phase_5] }
    - { id: R1, name: pattern_compliance,  severity: HARD, fires_in: [phase_3] }
  gates:
    - { id: G_REQUIREMENTS, name: requirements_exist, blocks: phase_1 }
```

### R9.2 — Gate Ledger (per session)

The orchestrator maintains `squad-method/output/.gate-ledger.json`:

```json
{
  "session_id": "ISO8601",
  "gates": {
    "G_REQUIREMENTS":    { "status": "PASSED",  "phase": "phase_1", "evidence": "REQUIREMENTS.md found" },
    "G_CONTEXT_LOADED":  { "status": "PASSED",  "phase": "phase_1", "evidence": "CLAUDE.md SHA256:abc..." },
    "G_TESTS_PASS":      { "status": "PENDING", "phase": "phase_4" }
  }
}
```

- **R9.2.1**: Orchestrator BLOCKS phase advancement if any gate required-for-phase has status ≠ PASSED.
- **R9.2.2**: Hook scripts update gate ledger entries on fire — no agent can bypass a hook-owned gate.

### R9.3 — Per-Agent Rule Audit (every output emits `rules_fired`)

Every agent output MUST include:

```yaml
rules_fired:
  - { rule: R0, fragment: my-fragment, status: APPLIED }
  - { rule: R1, fragment: my-fragment, status: SKIPPED, reason: "not applicable — no framework change in this diff" }
gates_checked:
  - { gate: G_REQUIREMENTS, status: PASSED, evidence: "found at ./REQUIREMENTS.md" }
```

- **R9.3.1**: Orchestrator reads `rule_manifest` for every fragment loaded by the agent → cross-checks against `rules_fired` → any rule with `fires_in` matching current phase that doesn't appear in `rules_fired` is a **MISSED RULE** error.
- **R9.3.2**: MISSED RULE → orchestrator re-dispatches the agent with the missed rules cited in the prompt. Max 2 retries (per R3.3). Third miss → STOP, escalate.

### R9.4 — Skill Coverage Audit (the "everything implemented" check)

At end of every phase the orchestrator emits:

```
Phase 1 — Skill Coverage Audit
| Fragment          | Rules declared | Fired | Skipped (with reason) | Missed | Status |
| review-rubric     | 5              | 4     | 1                     | 0      | ✅ COMPLETE |
| safety-guards     | 9              | 9     | 0                     | 0      | ✅ COMPLETE |
TOTAL: 14 rules · 13 fired · 1 skipped (justified) · 0 missed → PHASE 1 PASSES ENFORCEMENT
```

- **R9.4.1**: ANY row with `Missed > 0` → phase BLOCKED. No exceptions.
- **R9.4.2**: Skipped rules require explicit text reason; "not applicable" alone is REJECTED.

## R10 — Session Mode Enforcement (continuous-conversation skills)

Skills like `/assemble` and `/brainstorm` are continuous-conversation — the entire chat is the skill. These skills create a **session file** at `squad-method/output/progress/session-{skill}-{date}.md` that persists the active mode.

**R10.1** Before EVERY agent response in a continuous-conversation skill, the orchestrator MUST check for an active session file (`ls squad-method/output/progress/session-* 2>/dev/null`).

**R10.2** If a session file exists with `Status: ACTIVE`, the orchestrator MUST:
- Re-read the session file
- Dispatch agents in the skill's mode (agent personas, character voices, selection rules)
- Never revert to default non-agent behavior while the session is active

**R10.3** Session files survive context compaction. After compaction, the session file is the SOLE source of truth for "what mode am I in?" The orchestrator MUST trust the session file over in-context memory.

**R10.4** Session files are deleted ONLY when the user explicitly exits the skill or the skill completes its final phase.

## R11 — Hand-offs to Other Fragments

- Model + effort decisions: `squad-method/tools/router/index.js`
- Per-agent personas: `squad-method/agents/*.md`
- Tracking telemetry: `squad-method/fragments/tracking-protocol.md`
- Context injection: `squad-method/fragments/context-injection-protocol.md`
- Learning loop: `squad-method/fragments/learning-loop.md`

---

```yaml
rule_manifest:
  fragment_id: agent-orchestrator
  rules:
    - { id: R1,    name: three_mandatory_axes,                 severity: HARD, fires_in: [any] }
    - { id: R1.1,  name: axes_resolved_before_invocation,      severity: HARD, fires_in: [any] }
    - { id: R2,    name: dependency_graph_per_phase,           severity: HARD, fires_in: [any] }
    - { id: R3,    name: output_contract_declared,             severity: HARD, fires_in: [any] }
    - { id: R3.1,  name: output_machine_parseable,             severity: HARD, fires_in: [any] }
    - { id: R3.2,  name: schema_mismatch_redispatch,           severity: HARD, fires_in: [any] }
    - { id: R3.3,  name: max_two_redispatch_attempts,          severity: HARD, fires_in: [any] }
    - { id: R4.1,  name: run_manifest_per_dispatch,            severity: HARD, fires_in: [any] }
    - { id: R4.2,  name: inputs_hash_sha256,                   severity: HARD, fires_in: [any] }
    - { id: R4.3,  name: sequenced_output_emission_alpha,      severity: HARD, fires_in: [any] }
    - { id: R4.4,  name: no_race_conditions,                   severity: HARD, fires_in: [any] }
    - { id: R5,    name: parallel_dispatch_limits,             severity: HARD, fires_in: [any] }
    - { id: R5.1,  name: chunk_when_layer_above_limit,         severity: HARD, fires_in: [any] }
    - { id: R5.2,  name: critical_path_first_in_batch,         severity: HARD, fires_in: [any] }
    - { id: R6,    name: completion_verification,              severity: HARD, fires_in: [any] }
    - { id: R7,    name: orchestrator_implementation_notes,    severity: SOFT, fires_in: [any] }
    - { id: R8.1,  name: never_skip_agent,                     severity: HARD, fires_in: [any] }
    - { id: R8.2,  name: never_cache_across_sessions,          severity: HARD, fires_in: [any] }
    - { id: R8.3,  name: record_decision_before_invocation,    severity: HARD, fires_in: [any] }
    - { id: R8.4,  name: reject_duplicate_output_id,           severity: HARD, fires_in: [any] }
    - { id: R9,    name: rule_and_gate_enforcement_ledger,     severity: HARD, fires_in: [any] }
    - { id: R9.1,  name: rule_manifest_per_fragment,           severity: HARD, fires_in: [any] }
    - { id: R9.2,  name: gate_ledger_per_session,              severity: HARD, fires_in: [any] }
    - { id: R9.2.1,name: block_phase_on_unpassed_gate,         severity: HARD, fires_in: [any] }
    - { id: R9.2.2,name: hooks_own_gate_updates,               severity: HARD, fires_in: [any] }
    - { id: R9.3,  name: per_agent_rule_audit_rules_fired,     severity: HARD, fires_in: [any] }
    - { id: R9.3.1,name: missed_rule_detection,                severity: HARD, fires_in: [any] }
    - { id: R9.3.2,name: missed_rule_redispatch_max2,          severity: HARD, fires_in: [any] }
    - { id: R9.4,  name: skill_coverage_audit_per_phase,       severity: HARD, fires_in: [any] }
    - { id: R9.4.1,name: any_missed_row_blocks_phase,          severity: HARD, fires_in: [any] }
    - { id: R9.4.2,name: skipped_rules_require_explicit_reason, severity: HARD, fires_in: [any] }
    - { id: R10,   name: session_mode_enforcement,             severity: HARD, fires_in: [any] }
  gates:
    - { id: G_PHASE_COMPLETE,    name: all_expected_agents_ran_outputs_valid, blocks: any_phase }
    - { id: G_RULE_AUDIT_CLEAN,  name: skill_coverage_audit_zero_missed,      blocks: any_phase }
```

**End of fragment.** The contract is: declare inputs/outputs, hash them, fan out where independent, verify completion. Sequential single-session IDEs (Windsurf, Cursor, Kiro, Gemini, Antigravity) cannot match true parallel dispatch — but SQUAD preserves ALL correctness guarantees across all 7 supported IDEs. Only wall-clock time and per-agent model isolation differ between paths.
