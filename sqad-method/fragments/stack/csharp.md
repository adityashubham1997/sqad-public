---
fragment: stack/csharp
description: "C# and .NET framework patterns and best practices"
load_when: "stack.languages includes csharp"
token_estimate: 300
---

# C# / .NET Stack Context

## Language Rules

- Use `var` when type is obvious from right side; explicit type when not
- Use pattern matching (`is`, `switch` expressions) over cascading `if`/`else`
- Use `record` types for immutable data transfer objects
- Use `async`/`await` end-to-end — never `.Result` or `.Wait()` (deadlock risk)
- Use nullable reference types (`#nullable enable`) in all new code
- Prefer `string.IsNullOrWhiteSpace()` over `== null || == ""`
- Use collection expressions `[1, 2, 3]` (C# 12+) and `LINQ` for data manipulation

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Dependency injection | Constructor injection via built-in DI | `new` for services, Service Locator |
| Configuration | `IOptions<T>` pattern | Static config classes |
| Logging | `ILogger<T>` with structured logging | `Console.WriteLine()`, string interpolation in logs |
| Error handling | Result pattern or typed exceptions | Catching `Exception` base class |
| Data access | EF Core with migrations | Raw SQL strings, stored proc-heavy |
| Serialization | `System.Text.Json` (built-in) | `Newtonsoft.Json` in new .NET 6+ projects |
| HTTP clients | `IHttpClientFactory` | `new HttpClient()` per request (socket exhaustion) |

## ASP.NET Core Patterns

```csharp
// Minimal API (preferred for simple endpoints)
app.MapGet("/users/{id}", async (int id, IUserService svc) =>
    await svc.GetAsync(id) is User user
        ? Results.Ok(user)
        : Results.NotFound());

// Controller (for complex endpoints with filters/model binding)
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet("{id}")]
    public async Task<ActionResult<User>> Get(int id) { ... }
}
```

## Testing Patterns

- **xUnit** (preferred) or **NUnit** / **MSTest**
- Use `WebApplicationFactory<Program>` for integration tests
- Mock with **Moq** or **NSubstitute**
- Use `IServiceCollection` test overrides
- EF Core: use in-memory provider or `Testcontainers` for real DB tests
- Assert with **FluentAssertions** for readable assertions

## Entity Framework Core

- Always use migrations — never manual schema changes
- Use `AsNoTracking()` for read-only queries
- Avoid N+1: use `.Include()` or projection with `.Select()`
- Index frequently queried columns
- Use `ValueConverter` for custom type mapping

## Anti-Patterns to Flag

- `async void` methods (except event handlers) — unhandled exceptions crash the process
- `.Result` or `.Wait()` on async code — deadlock risk
- Catching `Exception` without re-throwing or specific handling
- `new HttpClient()` in a loop — socket exhaustion
- Missing `CancellationToken` on async API endpoints
- String concatenation for SQL queries — use parameterized queries
- `public` fields instead of properties
