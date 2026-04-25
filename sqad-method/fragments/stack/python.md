---
fragment: stack/python
description: Python stack knowledge and patterns
load_when: "stack.languages includes python"
token_estimate: 250
---

# Python Stack Context

## Language Rules

- Follow PEP 8 style — use `black` or `ruff` for formatting
- Type hints on all public function signatures (PEP 484)
- Use `dataclasses` or `pydantic` for structured data
- Prefer `pathlib.Path` over `os.path`
- Use `with` statements for resource management
- f-strings for formatting (never `.format()` in SQL queries)

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Data classes | `@dataclass` or Pydantic `BaseModel` | Plain dicts |
| Config | `pydantic-settings` or `environ` | Hardcoded values |
| Iteration | List/dict comprehensions | Manual loop + append |
| Imports | Absolute imports | Relative imports (except in packages) |
| Testing | `pytest` with fixtures | `unittest.TestCase` in new code |
| Async | `asyncio` + `httpx` | `requests` in async context |

## Testing Patterns

- **pytest** — standard for modern Python
- Use fixtures for test data and setup/teardown
- `pytest-mock` for mocking
- `pytest-asyncio` for async tests
- Parametrize with `@pytest.mark.parametrize`

## Anti-Patterns to Flag

- Bare `except:` — always specify exception type
- Mutable default arguments (`def fn(items=[])`)
- f-strings in SQL queries (injection risk)
- `import *` — pollutes namespace
- Deep nesting — restructure with early returns
