---
rubric: typescript
description: TypeScript-specific review checks
load_when: "stack.languages includes typescript"
---

# TypeScript Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| TS-1 | **No `any` type** | `any` where proper type is possible → fail | MAJOR |
| TS-2 | **Optional chaining** | Nullable property access without `?.` → fail | MAJOR |
| TS-3 | **No unsafe assertions** | `as` type assertion without runtime validation → fail | MINOR |
| TS-4 | **Strict mode** | `strict: true` not enabled in tsconfig.json → fail | MINOR |
| TS-5 | **No `@ts-ignore`** | `@ts-ignore` without explanation comment → fail | MINOR |
