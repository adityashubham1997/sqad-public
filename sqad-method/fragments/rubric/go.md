---
rubric: go
description: Go-specific review checks
load_when: "stack.languages includes go"
---

# Go Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| GO-1 | **Error handling** | Returned `error` must be checked — `_ = fn()` discarding errors → fail | CRITICAL |
| GO-2 | **No bare goroutines** | `go func()` without recovery or context/cancel → fail | MAJOR |
| GO-3 | **Context propagation** | HTTP handlers and service methods must accept `context.Context` as first param | MAJOR |
| GO-4 | **Defer usage** | Resources (files, connections, locks) must use `defer` for cleanup | MAJOR |
| GO-5 | **No data races** | Shared state without mutex or channel synchronization → fail | CRITICAL |
| GO-6 | **Exported names documented** | Exported functions/types missing doc comment → fail | MINOR |
| GO-7 | **No init() abuse** | `init()` should only set package-level defaults, not do I/O or heavy work | MINOR |
| GO-8 | **Structured logging** | Use `slog` or structured logger — no `fmt.Println` for operational logs | MINOR |
