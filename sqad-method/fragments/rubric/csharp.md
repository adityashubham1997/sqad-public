---
rubric: csharp
description: "C# and .NET-specific review checks"
load_when: "stack.languages includes csharp"
---

# C# / .NET Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| CS-1 | **async void** | `async void` method that is not an event handler → fail | CRITICAL |
| CS-2 | **Sync over async** | `.Result` or `.Wait()` on async code (deadlock risk) → fail | CRITICAL |
| CS-3 | **SQL injection** | String interpolation/concatenation in SQL query → fail | CRITICAL |
| CS-4 | **HttpClient misuse** | `new HttpClient()` per request instead of `IHttpClientFactory` (socket exhaustion) → fail | MAJOR |
| CS-5 | **Missing CancellationToken** | Async API endpoint without `CancellationToken` parameter → fail | MAJOR |
| CS-6 | **Nullable disabled** | New file without `#nullable enable` or project-wide nullable context → fail | MAJOR |
| CS-7 | **Catching Exception** | Catching base `Exception` without re-throw or specific handling → fail | MAJOR |
| CS-8 | **Public fields** | Public mutable field instead of property → fail | MINOR |
| CS-9 | **Missing sealed** | Non-abstract class not designed for inheritance missing `sealed` keyword → fail | MINOR |
