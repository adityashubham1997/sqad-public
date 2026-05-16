---
fragment: stack/nestjs
description: NestJS framework patterns and best practices
load_when: "stack.frameworks includes nestjs"
token_estimate: 250
---

# NestJS Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Modules | Feature modules with clear boundaries | Single AppModule for everything |
| Controllers | Thin — delegate to services | Business logic in controllers |
| Services | `@Injectable()` with scoped providers | Manual instantiation |
| Validation | `class-validator` + `ValidationPipe` | Manual validation in controllers |
| Config | `@nestjs/config` with typed schema | Direct `process.env` access |
| ORM | Prisma, TypeORM, or MikroORM | Raw queries without abstraction |
| Auth | Guards + decorators + Passport | Auth checks in every controller method |

## Module Structure

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // only export what other modules need
})
export class UsersModule {}
```

## Guard & Decorator Pattern

```typescript
// Auth guard
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Custom decorator for current user
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user,
);

// Usage
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@CurrentUser() user: User) { return user; }
```

## Error Handling

- Use built-in exception classes: `NotFoundException`, `BadRequestException`, etc.
- Custom exceptions extend `HttpException`
- Global exception filter for consistent error format
- Use `ExceptionFilter` for domain-specific error mapping

## Testing Patterns

- Use `Test.createTestingModule()` for unit tests
- Override providers with mocks: `.overrideProvider(Service).useValue(mockService)`
- E2E tests with `@nestjs/testing` + supertest
- Use `INestApplication` for full integration tests

## Anti-Patterns to Flag

- Circular module dependencies — use `forwardRef()` sparingly
- Not using `ValidationPipe` globally for input validation
- Injecting `Repository` directly in controllers (bypass service layer)
- Missing `@ApiTags()` / `@ApiResponse()` when using Swagger
- Synchronous operations in Guards that should be async
