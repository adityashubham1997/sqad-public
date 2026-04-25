---
rubric: rust
description: Rust-specific review checks
load_when: "stack.languages includes rust"
---

# Rust Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| RS-1 | **No unwrap in production** | `.unwrap()` or `.expect()` in non-test code → fail | MAJOR |
| RS-2 | **Error types** | Functions returning `Result` must use typed errors (not `Box<dyn Error>` in library code) | MAJOR |
| RS-3 | **No unsafe without justification** | `unsafe` block without `// SAFETY:` comment explaining why → fail | CRITICAL |
| RS-4 | **Clippy compliance** | Code must pass `cargo clippy` without warnings | MINOR |
| RS-5 | **No clone abuse** | Unnecessary `.clone()` where borrowing would suffice → fail | MINOR |
| RS-6 | **Lifetime annotations** | Prefer elision where possible; explicit lifetimes only when compiler requires | NIT |
| RS-7 | **Derive macros** | Common traits (Debug, Clone, PartialEq) should be derived unless custom impl needed | MINOR |
| RS-8 | **Async safety** | `Send + Sync` bounds on shared async state; no blocking calls in async context | CRITICAL |
