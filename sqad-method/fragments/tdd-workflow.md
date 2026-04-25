---
fragment: tdd-workflow
description: Test-Driven Development cycle for SQAD-Public
included_by: dev-task, test-story, agents that generate code
---

# TDD Workflow

## The Cycle

```
1. DETECT  — Analyze existing test framework (Jest? Mocha? pytest? JUnit? Go test?)
2. READ    — Read 2-3 existing test files to learn patterns
3. WRITE   — Write failing tests FIRST based on acceptance criteria
4. RUN     — Confirm tests fail for the right reasons
5. IMPLEMENT — Write the minimum code to make tests pass
6. RUN     — Confirm all tests pass (new + existing)
7. REFACTOR — Clean up if needed, re-run tests
```

## Test Quality Rules

- **Test the contract, not the implementation** — if the internal logic changes but the output is the same, tests should still pass
- **Only necessary tests** — test what matters (boundaries, errors, state transitions), not every internal method
- **Mirror existing patterns** — new tests should look like they belong in the existing test suite
- **One assertion per concern** — each test case tests one specific behavior
- **Descriptive names** — `it('should return empty array when no events match filter')` not `it('test1')`

## Before Writing ANY Test

1. What test framework does this repo use? (detect from dependency manifest)
2. What test patterns are used? (read existing files in test directory)
3. What mocking library? (Sinon? Jest mocks? pytest fixtures? Mockito?)
4. What is the directory structure? (where do test files live?)
5. What naming convention? (*.test.js? *.spec.ts? test_*.py? *Test.java?)

## Verification Checklist

After every code change:
```bash
# Run using the project's configured test command
{{test_command}}
# Run lint if configured
{{lint_command}}
```
