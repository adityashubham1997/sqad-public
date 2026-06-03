# TDD Characterization Test Protocol (Phase 1.5)

## When to Use

Phase 1.5 of /dev-task: BEFORE writing implementation tests, write
characterization tests that capture CURRENT behavior of the modification area.
These serve as a behavioral baseline — any unintended change is detected immediately.

## Naming Convention

All characterization tests MUST be tagged:
```javascript
// SQUAD:characterization-test
describe('CHARACTERIZATION: [area being modified]', () => {
  // ...
});
```

## Protocol

### Before Implementation (Phase 1.5)

1. **Identify the 3-5 most critical functions/endpoints** in the modification area
2. **Write characterization tests** that capture CURRENT behavior:
   - Input → Expected Output assertions (from running the code, not guessing)
   - Error path assertions
   - Boundary condition assertions
3. **Tag all tests** with `// SQUAD:characterization-test`
4. **Run tests** — ALL MUST PASS (they test existing behavior)
5. **If any fail** → existing code has a bug. Report to user before proceeding.
   Decision: (a) fix the bug as part of this story, (b) document and proceed, (c) stop

### After Implementation (Phase 3)

6. **Re-run characterization tests**
7. **If any FAIL** → behavioral change detected
8. **Present diff to user**:
   ```
   ⚠️ Behavioral changes detected:
     - [test name]: Expected [X], now returns [Y]
   Approve these changes? [Yes/Revert/Adjust]
   ```
9. **User-approved changes** → update test expectations
10. **Cleanup**: Remove `// SQUAD:characterization-test` tagged tests (or keep if user requests)

## Test Pattern Examples

```javascript
// SQUAD:characterization-test
describe('CHARACTERIZATION: parseConfig', () => {
  it('returns null for missing file', () => {
    assert.equal(parseConfig('/non-existent'), null);
  });

  it('returns object with defaults for empty config', () => {
    const result = parseConfig(emptyConfigPath);
    assert.equal(result.stack.languages.length, 0);
  });
});
```

## Rules

- **Never guess** at expected values — run the code to confirm
- **Minimum 3 tests** per modified function
- **Scope to modification area only** — don't write characterization tests for untouched code
- **Always run BEFORE implementation** — post-implementation characterization tests are useless
- **Tags are mandatory** — `// SQUAD:characterization-test` enables cleanup automation
- **If the area has no tests at all** — the entire Phase 1.5 becomes the baseline; be extra careful
