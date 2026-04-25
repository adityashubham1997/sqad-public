---
fragment: stack/go
description: Go stack knowledge and patterns
load_when: "stack.languages includes go"
token_estimate: 250
---

# Go Stack Context

## Language Rules

- Follow `gofmt` / `goimports` — non-negotiable
- Error handling: check every error, wrap with `fmt.Errorf("context: %w", err)`
- Use interfaces for dependencies (testability)
- Keep packages small and focused
- Use `context.Context` for cancellation and timeouts
- Prefer composition over inheritance

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Error handling | `if err != nil { return fmt.Errorf(...) }` | Ignoring errors with `_` |
| Concurrency | Goroutines + channels + `sync.WaitGroup` | Shared mutable state |
| Config | Struct with env tags or Viper | Global variables |
| HTTP | `net/http` stdlib or Chi/Echo/Gin | Heavy frameworks |
| Testing | Table-driven tests | Single-case test functions |
| DI | Constructor injection (func params) | Global singletons |

## Testing Patterns

- Built-in `testing` package — no external framework needed
- Table-driven tests with `t.Run()` for subtests
- `testify` for assertions and mocking
- `httptest` for HTTP handler testing
- `go test -race` for race condition detection

## Anti-Patterns to Flag

- Ignoring errors (`_, _ = fn()`)
- Package-level mutable state
- `init()` functions with side effects
- Missing `context.Context` in long-running operations
- Naked goroutines without lifecycle management
