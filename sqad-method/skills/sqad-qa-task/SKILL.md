---
name: sqad-qa-task
description: >
  End-to-end QA workflow. Analyses dependencies, discovers existing test patterns,
  grounds the test strategy, generates a test spec, gets user approval, then
  writes and reviews tests. Use when user says "qa task", "test plan",
  "write tests for story", "qa this", or runs /qa-task.
---

# SQAD-Public QA Task — End-to-End QA Workflow

Primary: **Sentinel** (QA Architect). Supporting: **Cipher** (QA Engineer),
**Forge** (code quality review of tests), **Nova** (AC validation).

**Bootstrap (read now):**
- `sqad-method/config.yaml` — team config
- `sqad-method/agents/_base-agent.md` — base protocols
- `sqad-method/agents/sentinel.md` — Sentinel drives this workflow
- `sqad-method/agents/nova.md` — AC validation

**Phase-gated loading:**
- Phase 1: `sqad-method/fragments/kg-query-protocol.md`
- Phase 4: `sqad-method/agents/cipher.md`, `sqad-method/fragments/tdd-workflow.md`
- Phase 5: `sqad-method/agents/forge.md`, `sqad-method/agents/raven.md`, `sqad-method/fragments/tracking-protocol.md`

---

## Phase 1 — UNDERSTAND (Sentinel + Nova)

**Load now:** `sqad-method/fragments/kg-query-protocol.md`

### 1a. Detect Input Mode
Parse `$ARGUMENTS`: tracker ID → Tracker Mode; else → Description Mode.

### 1b. Fetch or Structure Requirements
Tracker Mode: fetch story details via tracker MCP.
Description Mode: Nova structures into GIVEN/WHEN/THEN AC.

### 1c. Dependency Analysis (Sentinel)
- Read DEEP-CONTEXT.md, complete-flow.md
- Query knowledge graph for reverse deps, test coverage, god nodes
- Map what this story touches and what depends on it

**USER GATE:** "Dependencies mapped. Is this scope correct? [Continue/Adjust]"

---

## Phase 2 — DISCOVER (Sentinel)

### 2a. Existing Test Infrastructure Audit
Search ALL repos for existing test patterns, helpers, fixtures, shared infra.

### 2b. Learn Existing Patterns
Framework, setup patterns, fixture patterns, mock strategy, assertion style.

### 2c. Identify Reusable Infrastructure
```
🧪 Sentinel — Test Infrastructure Audit

Test framework: [detected]
Test location: [path]
Pattern reference: [file]
Shared infra to reuse: [list]
New infra needed: [list]
```

**USER GATE:** "Test infrastructure discovered. [Continue/Adjust]"

---

## Phase 3 — STRATEGIZE (Sentinel)

### 3a. Risk Assessment
| Component | What Could Break | Likelihood | Impact | Test Layer |

### 3b. Test Methodology Selection
Unit / Integration / E2E / Contract / Negative testing per component.

### 3c. Test Pyramid Validation

### 3d. Generate Test Spec
Detailed test specification with scenarios by layer.

**USER GATE:** "Review this test spec. [Approve/Revise/Add scenarios]"

---

## Phase 4 — IMPLEMENT (Cipher + Sentinel oversight)

**Load now:** `sqad-method/agents/cipher.md`, `sqad-method/fragments/tdd-workflow.md`

Cipher writes tests per Sentinel's spec:
- Unit → Integration → E2E → Negative
- Sentinel reviews each block as Cipher writes
- Run tests and report results

**USER GATE:** "Tests passing. [Continue/Add more/Adjust]"

---

## Phase 5 — TEAM REVIEW

**Load now:** remaining agent files + tracking protocol.

| Agent | Review |
|---|---|
| 🧪 **Sentinel** | Test strategy sound? Right layer? Risk covered? |
| 💻 **Forge** | Test code quality? Follows patterns? |
| 🧪 **Cipher** | Edge cases covered? Assertions meaningful? |
| 📊 **Nova** | Every AC has a test? |
| 🔍 **Raven** | What's NOT tested that should be? |

**USER GATE:** "Review findings. [Fix/Accept/Discuss]"

## Behavioral Rules

1. **Sentinel drives strategy, Cipher executes.**
2. **REUSE BEFORE CREATE.** Search all repos before building new test infra.
3. **Test pyramid discipline.** Too many E2E or too few unit tests = MAJOR.
4. **Risk-based, not coverage-based.** Tests catch real failures.
5. **QA doesn't fix production code.** Report bugs to user.
6. **Every user gate is mandatory.**
7. **Track operation** as final step.
