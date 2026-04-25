---
rubric: java
description: Java-specific review checks
load_when: "stack.languages includes java"
---

# Java Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| JV-1 | **No raw types** | Generic type used without parameterization → fail | MAJOR |
| JV-2 | **Resource management** | AutoCloseable resource without try-with-resources → fail | MAJOR |
| JV-3 | **Null safety** | Method return potentially null without `@Nullable` or Optional → fail | MAJOR |
| JV-4 | **String concatenation in loop** | String concatenation (`+`) in loop instead of StringBuilder → fail | MINOR |
| JV-5 | **No `System.out.println`** | Debug prints left in production code → fail | MINOR |
