---
fragment: stack/dotnet-core
description: ".NET Core / .NET 6+ framework patterns and architecture"
load_when: "stack.frameworks includes dotnet-core OR stack.frameworks includes aspnet"
token_estimate: 300
---

# .NET Core / .NET 6+ Stack Context

## Project Structure

```
src/
├── MyApp.Api/              # ASP.NET Core Web API
│   ├── Controllers/        # API controllers (or Minimal API endpoints)
│   ├── Middleware/          # Custom middleware
│   ├── Filters/            # Action/exception filters
│   └── Program.cs          # Entry point + DI + middleware pipeline
├── MyApp.Core/             # Domain models, interfaces, business logic
│   ├── Entities/
│   ├── Interfaces/
│   └── Services/
├── MyApp.Infrastructure/   # Data access, external services
│   ├── Data/               # DbContext, migrations, repositories
│   └── Services/           # External API clients
└── MyApp.Tests/            # Test projects
    ├── Unit/
    └── Integration/
```

## Dependency Injection

```csharp
// Program.cs — register services
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddSingleton<ICacheService, RedisCacheService>();
builder.Services.AddTransient<IEmailSender, SmtpEmailSender>();
builder.Services.AddHttpClient<IGitHubClient, GitHubClient>(client =>
    client.BaseAddress = new Uri("https://api.github.com"));

// Use IOptions<T> for configuration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("Jwt"));
```

## Middleware Pipeline Order

```csharp
// Order matters — follow this sequence
app.UseExceptionHandler("/error");
app.UseHsts();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();
app.MapControllers();
```

## Authentication & Authorization

- Use `AddAuthentication().AddJwtBearer()` for API auth
- Use `[Authorize]` attribute with policy-based authorization
- Define policies: `builder.Services.AddAuthorization(o => o.AddPolicy("Admin", ...));`
- Use `IAuthorizationHandler` for complex rules
- Never store JWT secrets in `appsettings.json` — use Azure Key Vault / AWS Secrets Manager

## Health Checks & Observability

```csharp
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>()
    .AddRedis(redisConnString)
    .AddUrlGroup(new Uri("https://api.dependency.com/health"));

app.MapHealthChecks("/health", new HealthCheckOptions {
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

## Performance Patterns

- Use `IMemoryCache` or `IDistributedCache` for hot paths
- Enable response compression: `builder.Services.AddResponseCompression()`
- Use `async` streams (`IAsyncEnumerable<T>`) for large datasets
- Configure connection pooling for EF Core
- Use output caching (ASP.NET Core 7+) for read-heavy endpoints
- Profile with `dotnet-counters`, `dotnet-trace`, Application Insights

## Deployment Patterns

- Use `Dockerfile` with multi-stage build:
  ```dockerfile
  FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
  WORKDIR /src
  COPY *.csproj .
  RUN dotnet restore
  COPY . .
  RUN dotnet publish -c Release -o /app

  FROM mcr.microsoft.com/dotnet/aspnet:8.0
  COPY --from=build /app .
  ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
  ```
- Run as non-root user in container
- Use `/health` endpoint for liveness/readiness probes

## Anti-Patterns to Flag

- Mixing business logic into controllers — keep controllers thin
- Not using `CancellationToken` in async endpoints
- Synchronous I/O in middleware pipeline
- Missing input validation on API models — use FluentValidation or DataAnnotations
- Hardcoded connection strings in source code
- Not sealing classes that aren't designed for inheritance
