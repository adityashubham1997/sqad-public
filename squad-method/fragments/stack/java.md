---
fragment: stack/java
description: Java stack knowledge and patterns
load_when: "stack.languages includes java"
token_estimate: 250
---

# Java Stack Context

## Language Rules

- Use records for immutable data carriers (Java 16+)
- Use `var` for local variables when type is obvious (Java 10+)
- Use sealed classes for restricted hierarchies (Java 17+)
- Always use try-with-resources for AutoCloseable
- Prefer `Optional` over null returns for public APIs
- Use `Stream` API for collection transformations

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Immutable data | Records | POJOs with getters/setters |
| Null handling | `Optional<T>` | Returning null |
| Collections | `List.of()`, `Map.of()` (immutable) | `new ArrayList<>()` for constants |
| Concurrency | Virtual threads (Java 21+), CompletableFuture | Raw Thread creation |
| Logging | SLF4J + Logback | `System.out.println()` |
| DI | Constructor injection | Field injection |

## Testing Patterns

- **JUnit 5** — standard for modern Java
- `@Nested` classes for test grouping
- Mockito for mocking (`@Mock`, `@InjectMocks`)
- AssertJ for fluent assertions
- Testcontainers for integration tests

## Anti-Patterns to Flag

- Raw types (generic without parameterization)
- Checked exceptions for control flow
- String concatenation in loops (use StringBuilder)
- `System.out.println()` in production code
- God classes (>500 lines)
