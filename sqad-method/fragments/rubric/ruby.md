---
rubric: ruby
description: Ruby-specific review checks
load_when: "stack.languages includes ruby"
---

# Ruby Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| RB-1 | **No SQL injection** | Raw SQL with string interpolation instead of parameterized queries → fail | CRITICAL |
| RB-2 | **Strong params** | Rails controllers must use `params.require().permit()` — no mass assignment | CRITICAL |
| RB-3 | **No `eval`/`send` from user input** | `eval`, `instance_eval`, `send` with user-controlled strings → fail | CRITICAL |
| RB-4 | **Exception handling** | Bare `rescue` without specifying exception class → fail (catches everything) | MAJOR |
| RB-5 | **N+1 queries** | ActiveRecord queries in loops without `includes`/`preload`/`eager_load` → fail | MAJOR |
| RB-6 | **Frozen string literals** | `# frozen_string_literal: true` missing in new files → fail | MINOR |
| RB-7 | **Method length** | Methods exceeding 20 lines should be refactored | MINOR |
| RB-8 | **Rubocop compliance** | Code must pass `rubocop` without offenses (or documented exceptions) | MINOR |
