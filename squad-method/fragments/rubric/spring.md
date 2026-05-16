---
rubric: spring
description: Spring Boot-specific review checks
load_when: "stack.frameworks includes spring"
---

# Spring Boot Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| SP-1 | **Field injection** | `@Autowired` on field instead of constructor injection → fail | MAJOR |
| SP-2 | **Entity in response** | JPA entity returned directly from controller (use DTO) → fail | MAJOR |
| SP-3 | **N+1 queries** | Lazy-loaded collection accessed in loop without `@EntityGraph` or `JOIN FETCH` → fail | MAJOR |
| SP-4 | **Missing readOnly** | `@Transactional` on read-only method without `readOnly = true` → fail | MINOR |
| SP-5 | **Private @Transactional** | `@Transactional` on private method (proxy won't intercept) → fail | CRITICAL |
| SP-6 | **Catching Exception** | Service catching generic `Exception` instead of specific types → fail | MAJOR |
| SP-7 | **Missing validation** | Request body without `@Valid` annotation on controller parameter → fail | MAJOR |
