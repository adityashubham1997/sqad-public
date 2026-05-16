---
fragment: stack/javascript
description: JavaScript stack knowledge and patterns
load_when: "stack.languages includes javascript"
token_estimate: 250
---

# JavaScript Stack Context

## Language Rules

- Use `const` by default, `let` when reassignment needed — never `var`
- Use `===` and `!==` — never loose equality
- Use template literals over string concatenation
- Use arrow functions for callbacks, named functions for top-level
- Use destructuring for clean parameter extraction
- Prefer `async/await` over raw Promise chains

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Iteration | `map`/`filter`/`reduce` | `for` loops (when functional fits) |
| Null checks | Optional chaining `?.`, nullish coalescing `??` | `|| ''` (falsy trap) |
| Object copy | Spread `{...obj}` or `structuredClone()` | `Object.assign()` |
| Module system | ES modules (`import/export`) | CommonJS (`require`) in new code |
| Error handling | Named error classes | Generic `throw new Error()` |

## Testing Patterns

- **Jest**, **Mocha + Chai**, or **Vitest**
- Mock with `jest.mock()`, `sinon.stub()`, or `vi.mock()`
- Use `describe`/`it` structure consistently
- One assertion per test for clarity

## Anti-Patterns to Flag

- `var` usage anywhere
- `eval()` or `new Function()` from user input
- Prototype pollution via `Object.assign` from untrusted source
- Callback hell — restructure with async/await
- Unhandled promise rejections
