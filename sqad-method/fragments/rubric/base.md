---
rubric: base
description: >
  Universal review rubric — always loaded regardless of stack. Contains
  language-agnostic quality checks that apply to every project.
always_load: true
---

# Base Review Rubric

## Purpose

Every review uses this rubric. Each check has a **clear decision rule** — no
ambiguity, no "use your judgment." Agents still bring their unique lens, but
the rubric ensures nothing is missed.

## How to Use

1. Before writing prose findings, **run every applicable check** below
2. Record pass/fail per check
3. Failed checks become findings at the specified severity
4. Agent-specific insights (beyond the rubric) are added as additional findings
5. Present rubric results in a table at the start of each agent's review

```
| # | Check | Result | Severity | Notes |
|---|---|---|---|---|
| U-1 | No hardcoded credentials | PASS | — | — |
| U-2 | Null safety | FAIL | CRITICAL | line 47: obj.prop.split() |
```

---

## Universal Checks (All Agents)

### Code Quality (Forge)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| U-1 | **No hardcoded credentials** | Passwords, API keys, tokens in source → fail | CRITICAL |
| U-2 | **Null safety** | Nested property access without guard clause → fail | CRITICAL |
| U-3 | **Error handling** | Swallowed errors (empty catch / log-only) → fail | MAJOR |
| U-4 | **No magic values** | Hardcoded strings/numbers not in constants → fail | MAJOR |
| U-5 | **DRY** | Same logic block appears 2+ times in changed files → fail | MINOR |
| U-6 | **Variable naming** | Single-letter vars, `data`, `temp`, `result` without context → fail | MINOR |

### Testing (Cipher)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| T-1 | **New method has test** | Any new public method without corresponding test → fail | CRITICAL |
| T-2 | **Coverage not dropped** | New code paths without test assertions → fail | MAJOR |
| T-3 | **Error paths tested** | New catch/error handler without negative test → fail | MAJOR |
| T-4 | **Assertions are meaningful** | Test asserts only `!== undefined` or `=== true` without checking actual values → fail | MINOR |
| T-5 | **Test follows patterns** | Test structure deviates from existing test patterns → fail | MINOR |

### Security & Architecture (Atlas)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| S-1 | **No hardcoded credentials** | Passwords, API keys, tokens in source → fail | CRITICAL |
| S-2 | **Input validation** | User input used without sanitization → fail | CRITICAL |
| S-3 | **Auth coverage** | New endpoint without authentication → fail | CRITICAL |

### Adversarial (Raven)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| A-1 | **Second-order effects** | Changed function is called by 3+ other files — caller impact not assessed → fail | MAJOR |
| A-2 | **Error propagation** | Function catches error but swallows it (empty catch / log-only) → fail | MAJOR |
| A-3 | **Boundary conditions** | Numeric operations without bounds checking (division, array index) → fail | MAJOR |
| A-4 | **Timeout/retry** | External API call without timeout configuration → fail | MINOR |

### Product (Compass)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| P-1 | **AC coverage** | Acceptance criterion not addressed by any changed file → fail | CRITICAL |
| P-2 | **Scope creep** | Changed file not traceable to any AC → fail | MAJOR |

### Delivery (Tempo)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| G-1 | **All AC implemented** | AC count vs implementation items — mismatch → fail | CRITICAL |
| G-2 | **Shippable state** | Tests failing, build broken, or incomplete feature → fail | CRITICAL |

### Documentation (Scribe)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| D-1 | **Public API documented** | New public method/endpoint without docs → fail | MINOR |
| D-2 | **Complex logic explained** | >20 line function without inline reasoning → fail | NIT |

---

## Rubric Scoring

After all checks:

| Condition | Verdict |
|---|---|
| 0 CRITICAL, 0 MAJOR | **APPROVE** |
| 0 CRITICAL, 1+ MAJOR | **REQUEST CHANGES** (agent discussion: fix now or accept?) |
| 1+ CRITICAL | **BLOCK** — must fix before merge |

## Evolving the Rubric

This rubric is a **living document**. New rules are added when:

1. `/git-learn` discovers a recurring review theme (3+ PRs)
2. `/health` detects a blind spot (e.g., 0% detection rate for a category)
3. An agent discussion concludes with a new rule recommendation
4. A production incident reveals a missed check

New rules are tagged with their origin:
```markdown
| X-N | **[check]** | [rule] | [severity] | <!-- added: [date], source: [origin] -->
```
