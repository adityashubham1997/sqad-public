# Review Rubric — Modular Check System

## How Rubric Loading Works

1. **Always load:** `rubric/base.md` (universal checks) + `rubric/security.md`
2. **Stack-conditional:** Load rubric modules matching detected stack:
   - JavaScript detected → load `rubric/javascript.md`
   - TypeScript detected → load `rubric/typescript.md`
   - Python detected → load `rubric/python.md`
   - Java detected → load `rubric/java.md`
   - React detected → load `rubric/react.md`
   - Go detected → load `rubric/go.md` (if exists)
   - Rust detected → load `rubric/rust.md` (if exists)
   - Ruby detected → load `rubric/ruby.md` (if exists)
   - Terraform detected → load `rubric/terraform.md`
3. **Cloud-conditional:** If cloud infra detected → load `rubric/zero-trust-infra.md`

## Check Severity Levels

| Level | Meaning | Action |
|---|---|---|
| **CRITICAL** | Blocks merge. Security, data loss, crash risk. | Must fix before PR merge |
| **MAJOR** | Should fix. Correctness, reliability, maintainability. | Fix in this sprint |
| **MINOR** | Fix if time permits. Style, naming, minor improvements. | Fix as convenient |
| **NIT** | Optional. Preference, minor style. | Author's discretion |

## Review Process

1. Load applicable rubric modules (base + stack + cloud)
2. Run each check against the code being reviewed
3. Score each finding with severity level
4. For each finding: cite file:line, explain issue, suggest fix
5. Deduplicate — same issue in multiple checks = report once at highest severity
6. Present grouped by severity: CRITICAL → MAJOR → MINOR → NIT

## Stack Detection for Rubric Loading

Read `sqad-method/config.yaml → stack.languages` and `stack.frameworks`:
```yaml
stack:
  languages: ["javascript", "typescript"]
  frameworks: ["react", "express"]
```

Load rubric modules matching detected entries.

## Adding Custom Rubric Checks

Teams can add project-specific checks in `sqad-method/fragments/rubric/custom.md`.
This file is preserved during `sqad-public update` and loaded alongside base checks.
