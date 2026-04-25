---
rubric: javascript
description: JavaScript-specific review checks
load_when: "stack.languages includes javascript"
---

# JavaScript Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| JS-1 | **No `var` usage** | Any `var` keyword in changed files → fail | MAJOR |
| JS-2 | **Strict equality** | `==` or `!=` instead of `===`/`!==` → fail | MAJOR |
| JS-3 | **No `eval()`** | Use of `eval()` or `new Function()` from user input → fail | CRITICAL |
| JS-4 | **Promise handling** | Unhandled promise rejection (missing `.catch()` or try/catch on await) → fail | MAJOR |
| JS-5 | **No console.log** | `console.log` left in production code → fail | MINOR |
