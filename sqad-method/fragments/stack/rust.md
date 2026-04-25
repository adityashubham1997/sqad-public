---
fragment: stack/rust
description: Rust stack knowledge and patterns
load_when: "stack.languages includes rust"
token_estimate: 250
---

# Rust Stack Context

## Language Rules

- Follow `rustfmt` and `clippy` — run both before PR
- Use `Result<T, E>` for fallible operations, `Option<T>` for absence
- Prefer `?` operator for error propagation
- Use `thiserror` for library errors, `anyhow` for application errors
- Minimize `unsafe` — justify every usage in comments
- Prefer `impl Trait` over `dyn Trait` where monomorphization is acceptable

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Error handling | `Result<T, E>` + `?` operator | `unwrap()` / `expect()` in library code |
| Serialization | `serde` derive macros | Manual serialization |
| Async | `tokio` or `async-std` | Blocking in async context |
| CLI | `clap` derive API | Manual argument parsing |
| HTTP | `axum`, `actix-web`, or `reqwest` | Raw TCP handling |
| Testing | `#[test]` + `assert_eq!` | No tests |

## Testing Patterns

- Built-in `#[test]` attribute — no external framework needed
- Unit tests in `mod tests` at bottom of file
- Integration tests in `tests/` directory
- `mockall` for trait mocking
- Property testing with `proptest`

## Anti-Patterns to Flag

- `unwrap()` in production code without justification
- `clone()` to satisfy borrow checker — restructure ownership instead
- Unnecessary `unsafe` blocks
- `String` where `&str` suffices
- Missing error context in propagation chains
