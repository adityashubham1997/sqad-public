---
name: sqad-dev-task
description: >
  End-to-end story implementation — analyse, spec, implement, test, review, PR.
  Six phases with user gates. Use when user says "dev task", "implement story",
  "dev this", provides a story number, or runs /dev-task.
---

# SQAD-Public Dev Task — End-to-End Story Implementation

Six phases, each with user gates. All 26 agents participate per their lens.

**Bootstrap (read now):**
- `sqad-method/config.yaml` — team config
- `sqad-method/agents/_base-agent.md` — base protocols (discussions, tracking)

**Phase-gated loading:**
- Phase 1: `sqad-method/agents/nova.md`, `sqad-method/agents/atlas.md`, `sqad-method/fragments/kg-query-protocol.md`
- Phase 2: `sqad-method/agents/forge.md`, `sqad-method/agents/compass.md`
- Phase 3: `sqad-method/agents/forge.md` (if not loaded), `sqad-method/fragments/review-rubric.md`
- Phase 4: `sqad-method/agents/cipher.md`, `sqad-method/fragments/tdd-workflow.md`
- Phase 5: `sqad-method/agents/raven.md`, `sqad-method/agents/sentinel.md`, `sqad-method/fragments/review-protocol.md`
- Phase 6: `sqad-method/fragments/tracking-protocol.md`

Track progress with TodoWrite.

---

## Phase 1 — ANALYSE (Nova + Atlas)

**Load now:** `sqad-method/agents/nova.md`, `sqad-method/agents/atlas.md`, `sqad-method/fragments/kg-query-protocol.md`

### 1a. Detect Input Mode

Parse `$ARGUMENTS`:
- Matches tracker ID pattern → **Tracker Mode**: fetch story details
- Everything else → **Description Mode**: treat as story description

### 1b. Fetch or Structure Requirements

**Tracker Mode:**
Use tracker MCP tools if available to fetch story details, AC, linked items.

**Description Mode:**
Nova structures into testable AC (GIVEN/WHEN/THEN).

### 1c. Architecture Impact (Atlas)

**Step 1 — READ CONTEXT (before any grep):**
- Read `<repo>/CLAUDE.md` — per-repo context with KG summary, god nodes, untested files, communities
- Read `<repo>/DEEP-CONTEXT.md` if available — architecture overview
- Read `<repo>/knowledge-graph-out/KG_REPORT.md` if exists — full KG analysis
- Read `complete-flow.md` at root for cross-repo understanding

**Step 2 — QUERY KG (before any grep):**
If `<repo>/knowledge-graph-out/graph.json` exists:
- Query reverse dependencies for every file likely to change
- Check god node status (degree > 30) for every file in scope
- Check test coverage for every file in scope
- Run 2-hop ripple analysis from the entry points
- See `sqad-method/fragments/kg-query-protocol.md` for query recipes

**Step 3 — GREP (only for pattern-matching):**
Use grep only to find code patterns and similar implementations.
Do NOT use grep for impact analysis — use KG for that.

Atlas assesses:
1. Repos affected
2. Files to change (specific paths, verified via KG + Grep)
3. Reverse dependencies for each file (from KG, not grep)
4. God nodes in the change path (from KG)
5. Test coverage gaps (from KG)
6. Cross-repo implications
7. Performance considerations
8. Security implications

For EVERY claim, cite the file path and line number.
If unverifiable: `[ASSUMPTION-N]: [what] — CONFIDENCE: UNCERTAIN`

**USER GATE:** "Review analysis. Anything to add or correct? [Continue/Adjust]"

---

## Phase 2 — SPEC (Forge + Compass)

**Load now:** `sqad-method/agents/forge.md`, `sqad-method/agents/compass.md`

### 2a. Technical Specification (Forge)

Forge writes the implementation spec:
- Exact files to create/modify (list each with justification)
- Function signatures
- Data model changes
- Error handling strategy
- Integration points

**MINIMALITY GATE (Forge):**
Forge MUST include in the spec:
```
Change Summary:
  Files to modify:  [N] — [list each with 1-line justification]
  Files to create:  [N] — [list each with why it can't be added to existing file]
  Estimated lines:  ~[N]
  Alternative considered: [describe a simpler approach and why it was rejected]
```
If no alternative was considered → spec is incomplete. If the alternative has fewer touch points and still satisfies the AC → use the alternative.

### 2b. Product Validation (Compass)

Compass validates:
- Does this solve the customer problem?
- Is the scope exactly what was asked?
- Any unnecessary scope?
- **Is there a simpler way to achieve this?** Compass independently evaluates whether the proposed spec is the minimum-viable approach.

### 2c. Architecture Minimality Check (Atlas)

Atlas validates the spec's approach:
- Is this the least-invasive architecture that satisfies the AC?
- Does it touch any god nodes unnecessarily?
- What is the blast radius of the proposed changes?
- **Propose at least one alternative** with fewer cross-component changes

**USER GATE:** "Review spec. Change plan: [N] files, ~[N] lines. Alternative: [brief]. [Approve/Revise/Use alternative]"

---

## Phase 3 — IMPLEMENT (Forge)

**Load now:** `sqad-method/fragments/review-rubric.md`

### 3a. Pre-Check

```bash
git status
git branch --show-current
```

Determine: create branch, stay on branch, or switch branch (per `_base-agent.md` Git Workflow).

### 3b. Implement

Forge implements per the approved spec:
- Follow existing code patterns (Grounding L1a)
- Minimal changes — only what AC requires
- Self-review against rubric checks as you code
- Stage specific files only
- **STOP after each file** and ask: "Am I still on the minimum path?"
- **If you find yourself changing a file not in the spec** — STOP, present to user: "I need to also change [file] because [reason]. Approve?"

### 3c. Minimality Self-Check + Self-Review

Before presenting to user, Forge runs:

**1. Minimality Self-Check (FIRST):**
```
MINIMALITY SELF-CHECK:
  Files changed: [N]  — matches spec? [YES/NO]
  Files added:   [N]  — each justified? [YES/NO]
  Unplanned changes: [list any files not in the original spec]
  Drive-by refactors: [NONE / list]
  New abstractions:   [NONE / list with justification]
```
If any unplanned changes exist → remove them or present to user for approval.

**2. Rubric checks:**
- M-1 through M-8 (MINIMALITY checks — see `rubric/base.md`)
- C-1 through C-N (CRITICAL checks)
- U-1 through U-N (universal checks)
Fix any issues found before proceeding.

**3. Run FULL test suite:**
```bash
[detected_test_command]
```
If any EXISTING tests fail → diagnose and fix before proceeding. New tests passing but old tests failing = regression = CRITICAL.

**USER GATE:** "Implementation complete. [N] files changed, [N] lines. Minimality check: [PASS/findings]. [Continue to tests/Revise]"

---

## Phase 4 — TEST (Cipher)

**Load now:** `sqad-method/agents/cipher.md`, `sqad-method/fragments/tdd-workflow.md`

### 4a. Detect Test Framework

Read existing test files to learn patterns:
- Framework (Jest, Mocha, pytest, Go test, etc.)
- Structure and conventions
- Mocking approach
- Assertion style

### 4b. Write Tests

Cipher writes tests following existing patterns:
- Unit tests for new logic
- Integration tests for changed contracts
- Edge case coverage from AC
- Error path tests

### 4c. Run Tests

```bash
[detected_test_command]
```

If failures: diagnose test bug vs code bug.
- Test bug → fix
- Code bug → report to user

**USER GATE:** "Tests passing. [Continue to review/Add more tests]"

---

## Phase 5 — REVIEW (Raven + Sentinel + Forge + Cipher)

**Load now:** `sqad-method/agents/raven.md`, `sqad-method/agents/sentinel.md`,
  `sqad-method/fragments/review-protocol.md`

Dispatch agents in parallel:

**Forge** — code quality:
- Idiomatic for the detected stack?
- Follows project patterns?
- Minimal and surgical changes?

**Raven** — adversarial:
- Hidden bugs? Null checks? Boundary conditions?
- What happens when assumptions break?
- Second-order effects?

**Cipher** — test adequacy:
- Edge cases covered?
- Tests prove correctness, not just execution?
- Every new code path tested?

**Sentinel** — test architecture:
- Tests at the right layer?
- Test pyramid balanced?
- Risk coverage adequate?

Consolidated report:
```
CRITICAL: [N] | MAJOR: [N] | MINOR: [N] | NIT: [N]
Verdict: APPROVE / REQUEST CHANGES
[Per-agent verdicts]
```

**USER GATE:** "Review complete. [Fix findings/Accept/Discuss]"

If CRITICAL findings: fix → re-review.

---

## Phase 6 — PR (Forge)

**Load now:** `sqad-method/fragments/tracking-protocol.md`

### 6a. Check PR State

```bash
gh pr list --state open --head "$(git branch --show-current)" 2>/dev/null
```

### 6b. Commit & PR

Per `_base-agent.md` Git Workflow:
- Stage specific files
- Commit with descriptive message
- Create or update PR

### 6c. Track Operation

```bash
echo '{"ts":"[ISO_DATE]","command":"dev-task","repo":"[REPO]","story":"[STORY]","outcome":"[completed|user_aborted]","phases_completed":[N],"review_verdict":"[APPROVE|REQUEST_CHANGES]","findings":{"critical":[N],"major":[N],"minor":[N],"nit":[N]},"discussions_count":[N],"assumptions_count":[N]}' >> sqad-method/output/tracking.jsonl
```

## Behavioral Rules

1. **NEVER skip a user gate.** Every phase transition requires user approval.
2. **NEVER fabricate file paths, test results, or tracker data.**
3. **NEVER implement beyond the AC.** No bonus features, no extra refactoring.
4. **Grounding waterfall is mandatory.** Search codebase before inventing patterns.
5. **Tag all assumptions** `[ASSUMPTION-N]` — compile at each gate.
6. **Agent discussions** — if agents disagree, trigger Discussion Protocol.
7. **Track the operation** — final step, always.
8. **TDD when possible** — write test first, then implementation.
9. **Self-review before team review** — Forge checks rubric before Phase 5.
10. **MINIMUM CHANGE IS A HARD CONSTRAINT** — not a nice-to-have. Every change must be the smallest diff that satisfies the AC. Count files and lines. If a simpler path exists, take it.
11. **ALWAYS consider an alternative approach** — before speccing, propose at least one simpler option. Compare touch-point counts. User decides.
12. **REVIEWERS MUST AUDIT MINIMALITY FIRST** — before checking code quality, Phase 5 reviewers must independently assess whether a simpler approach existed. This is check M-1 in the rubric.
13. **REGRESSION = CRITICAL** — if existing tests break after implementation, that is a CRITICAL finding. New tests passing does not offset broken old tests.
14. **NO UNPLANNED FILES** — if implementation requires changing a file not in the approved spec, STOP and get user approval before proceeding.
