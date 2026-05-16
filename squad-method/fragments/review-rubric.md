---
fragment: review-rubric
description: >
  Structured review rubric with machine-checkable rules. Replaces vague
  persona-based review with explicit decision trees per agent.
  Structured processes outperform attitude instructions.
included_by: review-protocol.md, dev-task Phase 5, review-pr, review-story
---

# SQUAD-Public Review Rubric

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
| C-1 | Null safety | PASS | — | — |
| C-2 | No magic values | FAIL | MAJOR | line 47: hardcoded timeout=3000 |
| ... | ... | ... | ... | ... |
```

## How Rubric Loading Works

1. **Always load:** This file (universal checks) + `rubric/security.md`
2. **Stack-conditional:** Load rubric modules matching detected stack:
   - JavaScript detected → load `rubric/javascript.md`
   - TypeScript detected → load `rubric/typescript.md`
   - Python detected → load `rubric/python.md`
   - Java detected → load `rubric/java.md`
   - React detected → load `rubric/react.md`
   - Go detected → load `rubric/go.md`
   - Rust detected → load `rubric/rust.md`
   - Terraform detected → load `rubric/terraform.md`
3. **Cloud-conditional:** If cloud infra detected → load `rubric/zero-trust-infra.md`

---

## Universal Checks (All Agents, All Stacks)

These apply to every review, regardless of agent lens or technology stack.

### Code Quality (Forge)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| C-1 | **Null safety** | Nested property/field access without guard clause → fail | CRITICAL |
| C-2 | **No magic values** | Hardcoded strings/numbers not in constants → fail | MAJOR |
| C-3 | **No commented-out code** | Commented code blocks in changed files → fail | MAJOR |
| C-4 | **Correct log levels** | Debug-level data logged at info/warn; non-errors at error → fail | MAJOR |
| C-5 | **Variable naming** | Single-letter vars, `data`, `temp`, `result` without context → fail | MINOR |
| C-6 | **DRY** | Same logic block appears 2+ times in changed files → fail | MINOR |
| C-7 | **No debug artifacts** | Debug prints, breakpoints, test credentials left in production code → fail | MAJOR |
| C-8 | **Error handling pattern** | Function catches error but swallows it (empty catch / log-only) → fail | MAJOR |

### Testing (Cipher)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| T-1 | **New public method has test** | Any new public method/function without corresponding test → fail | CRITICAL |
| T-2 | **Coverage not dropped** | New code paths without test assertions → fail | MAJOR |
| T-3 | **Error paths tested** | New catch/error handler without negative test → fail | MAJOR |
| T-4 | **Assertions are meaningful** | Test asserts only truthiness/defined without checking actual values → fail | MINOR |
| T-5 | **Test follows patterns** | Test structure deviates from existing project test conventions → fail | MINOR |
| T-6 | **No flaky patterns** | Sleep/delay in tests, time-dependent assertions, shared mutable state between tests → fail | MAJOR |

### Security & Architecture (Atlas / Sentinel)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| S-1 | **No hardcoded credentials** | Passwords, API keys, tokens, connection strings in source → fail | CRITICAL |
| S-2 | **Authorization coverage** | New endpoint/resource/table without access control → fail | CRITICAL |
| S-3 | **Input validation** | User input in queries/commands without sanitization → fail | CRITICAL |
| S-4 | **No unbounded queries** | Database query without limit on potentially large datasets → fail | MAJOR |
| S-5 | **Dependency safety** | New dependency with known critical CVEs → fail | MAJOR |
| S-6 | **Extension point contract** | New extension/plugin point without default implementation or documented contract → fail | MAJOR |
| S-7 | **Dispatch shape** | switch/if-chain over discriminant with 2+ distinct logic branches → fail; each branch is a candidate for its own implementation | MAJOR |
| S-8 | **Silent default branch** | switch/if-chain default that logs-and-returns-success → fail; unknown discriminants MUST throw or delegate | MAJOR |

### Adversarial (Raven)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| A-1 | **Second-order effects** | Changed function called by 3+ other files — caller impact not assessed → fail | MAJOR |
| A-2 | **Boundary conditions** | Numeric operations without bounds checking (division, array index, negative values) → fail | MAJOR |
| A-3 | **Timeout/retry** | External API/service call without timeout configuration → fail | MINOR |
| A-4 | **Concurrency safety** | Shared mutable state without synchronization in concurrent context → fail | MAJOR |

### Release Compliance (Stratos)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| R-1 | **L10N** | User-facing strings not externalized / not using i18n mechanism → fail | MAJOR |
| R-2 | **Metadata completeness** | New artifacts missing description, label, or documentation → fail | MAJOR |
| R-3 | **Scanner safety** | Patterns known to trigger static analysis/security scanners → fail | MAJOR |
| R-4 | **No auto-generated modifications** | Changes to auto-generated files → fail | CRITICAL |

### Documentation (Scribe)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| D-1 | **Public API documented** | New public method/endpoint without doc comment → fail | MINOR |
| D-2 | **Complex logic explained** | >20 line function without inline reasoning → fail | NIT |

### Product (Compass)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| P-1 | **AC coverage** | Acceptance criterion not addressed by any changed file → fail | CRITICAL |
| P-2 | **Scope creep** | Changed file not traceable to any AC → fail | MAJOR |

### Delivery (Nova)

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| G-1 | **All AC implemented** | AC count vs implementation items — mismatch → fail | CRITICAL |
| G-2 | **Shippable state** | Tests failing, build broken, or incomplete feature → fail | CRITICAL |

---

## Stack-Specific Checks (loaded conditionally)

Load the relevant `fragments/rubric/<lang>.md` and `fragments/rubric/security.md`
based on detected stack. Each adds per-language checks.

**Database-specific checks** (loaded when SQL/migrations detected):

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| DB-1 | **Migration reversibility** | Schema migration without rollback/down script → fail | MAJOR |
| DB-2 | **Index on FK** | Foreign key column without index → fail | MAJOR |
| DB-3 | **No SELECT *** | `SELECT *` in production queries → fail | MAJOR |
| DB-4 | **Transaction boundaries** | Multi-statement write without explicit transaction → fail | MAJOR |
| DB-5 | **Idempotent migrations** | Migration fails on re-run → fail | CRITICAL |

**Frontend-specific checks** (loaded when React/Vue/Angular/HTML detected):

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| FE-1 | **No innerHTML** | `innerHTML` or `dangerouslySetInnerHTML` with user data → fail | CRITICAL |
| FE-2 | **Accessibility** | New interactive element without aria-label/role → fail | MAJOR |
| FE-3 | **Bundle impact** | New dependency >100KB without justification → fail | MAJOR |
| FE-4 | **Key prop** | List rendering without stable key prop → fail | MINOR |
| FE-5 | **No inline styles** | Inline styles where CSS class/module should be used → fail | MINOR |

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
5. A `.code-review-guidelines/` directory exists in a repo — those rules are loaded as repo-specific checks

New rules are tagged with their origin:
```markdown
| X-N | **[check]** | [rule] | [severity] | <!-- added: [date], source: [origin] -->
```

## Git Learnings as Runtime Review Checks

At review time, agents MUST read the `## Learnings` section from the relevant
`CONTEXT.md` (per-repo for the files under review, root for cross-repo PRs).
Each learning that contains an actionable rule becomes a **dynamic check**:

1. Read `<repo>/CONTEXT.md` → find `## Learnings`
2. For each learning with a clear rule (e.g., "always use constants for field names — 5 PRs"):
   - Treat as a **MAJOR** check during this review
   - If the changed code violates the learned pattern → flag it
   - Cite the learning: `"Per git learning (5 PRs): [rule]"`
3. Learnings without clear actionable rules → context only, not flagged

This means the rubric **grows automatically** as `/git-learn`
discovers new patterns. No manual rubric editing needed for team-specific conventions.

## Adding Custom Rubric Checks

Teams can add project-specific checks in `squad-method/fragments/rubric/custom.md`.
This file is preserved during updates and loaded alongside base checks.

```yaml
rule_manifest:
  fragment_id: review-rubric
  rules:
    - { id: RR1,  name: rubric_run_before_lens_findings,  severity: HARD, fires_in: [phase_5] }
    - { id: RR2,  name: all_checks_evaluated,             severity: HARD, fires_in: [phase_5] }
    - { id: RR3,  name: critical_blocks_merge,            severity: HARD, fires_in: [phase_5] }
    - { id: RR4,  name: evidence_per_finding,             severity: HARD, fires_in: [phase_5] }
    - { id: RR5,  name: rubric_evolves_from_data,         severity: SOFT, fires_in: [any] }
```
