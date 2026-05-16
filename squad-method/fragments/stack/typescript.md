---
fragment: stack/typescript
description: TypeScript stack knowledge and patterns
load_when: "stack.languages includes typescript"
token_estimate: 300
---

# TypeScript Stack Context

## Language Rules

- Prefer `interface` over `type` for object shapes (extendable)
- Use `strict: true` in tsconfig.json — no exceptions
- Prefer `unknown` over `any` — force type narrowing
- Use discriminated unions for state machines
- Prefer `const` assertions for literal types
- Use `satisfies` operator for type-safe object literals (TS 4.9+)

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Null checks | Optional chaining `?.` | Nested if statements |
| Type narrowing | Type guards, `in` operator | `as` assertions |
| Async errors | try/catch with typed errors | `.catch()` chains |
| Enums | `as const` objects | TypeScript `enum` (tree-shaking issues) |
| Imports | Named imports | Default imports (refactoring friendly) |

## Testing Patterns

- **Jest** or **Vitest** — most common
- Type-safe mocks with `jest.MockedFunction<typeof fn>`
- Use `expectTypeOf` for compile-time type testing (vitest)
- Test `.d.ts` files with `tsd` or `expect-type`

## Anti-Patterns to Flag

- `any` proliferation — especially in function parameters
- `@ts-ignore` without explanation
- Type assertions (`as`) without runtime validation
- Barrel files (`index.ts`) that re-export everything (circular deps)
- `object` type instead of specific shape
