---
rubric: python
description: Python-specific review checks
load_when: "stack.languages includes python"
---

# Python Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| PY-1 | **Type hints** | Public function without type hints → fail | MINOR |
| PY-2 | **No bare except** | `except:` without specifying exception type → fail | MAJOR |
| PY-3 | **F-string in SQL** | f-string or `.format()` in database queries → fail | CRITICAL |
| PY-4 | **Context managers** | File/connection open without `with` statement → fail | MAJOR |
| PY-5 | **No mutable defaults** | Mutable default arguments (list, dict) in function signature → fail | MAJOR |
