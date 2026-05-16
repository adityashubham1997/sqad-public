---
name: squad-test-story
description: >
  Story-aware test generation. Analyzes what changed, checks existing coverage,
  generates targeted tests following existing patterns. Use when user says
  "test story", "write tests for", "test this change", or runs /test-story.
---

# SQUAD-Public Test Story — Story-Aware Test Generation

Two agents: **Cipher** (QA) writes tests, **Forge** (Dev Lead) reviews quality.

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols
- `squad-method/agents/cipher.md` — primary

**Step-gated loading:**
- Step 2: `squad-method/fragments/tdd-workflow.md`
- Step 3: `squad-method/fragments/kg-query-protocol.md`
- Step 6: `squad-method/agents/forge.md`

## Step 1 — Identify What Changed

Detect input mode (tracker ID or description), find changed files via git.

**USER GATE:** "These are the changes I'll write tests for. [Continue/Adjust]"

## Step 2 — Detect Test Framework

**Load now:** `squad-method/fragments/tdd-workflow.md`

Find test directory, detect framework from package.json/config, read 2-3
existing tests to learn patterns. Also check sibling repos for shared infra.

## Step 3 — Check Existing Coverage

**Load now:** `squad-method/fragments/kg-query-protocol.md`

Search for existing tests. Use KG test edges if available. Identify gaps.

## Step 4 — Generate Tests

Cipher writes tests following EXACT patterns learned in Step 2.
Priority: new functions → modified functions → error paths → edge cases.

## Step 5 — Run Tests

```bash
[detected_test_command]
```

Diagnose failures: test bug → fix; code bug → report.

## Step 6 — Forge Reviews Tests

**Load now:** `squad-method/agents/forge.md`

Forge reviews: right things tested? Patterns followed? Realistic mocks?

## Step 7 — Report

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  🧪 Cipher — Test Story Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Story: [number/description]
New tests added: [M] | All passing: YES
Forge: "[verdict]"
```

**USER GATE:** "Review the tests. [Accept/Revise/Add more]"

## Behavioral Rules

- NEVER write tests without first learning existing patterns
- NEVER fabricate test results — run the actual test command
- Tests must PASS before reporting completion
