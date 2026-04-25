---
fragment: stack/express
description: Express.js framework patterns and best practices
load_when: "stack.frameworks includes express"
token_estimate: 240
---

# Express.js Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Error handling | Centralized error middleware | Try/catch in every route |
| Validation | Zod / Joi / express-validator | Manual validation in handlers |
| Routing | Router modules per domain | All routes in single file |
| Middleware | Composition chain, single responsibility | God middleware doing everything |
| Auth | Passport.js or custom JWT middleware | Auth logic in every route |
| Logging | Structured logger (pino, winston) | `console.log()` |

## Route Structure

```typescript
// routes/users.ts
const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const users = await userService.findAll();
  res.json({ data: users });
}));

router.post('/', validate(createUserSchema), asyncHandler(async (req, res) => {
  const user = await userService.create(req.body);
  res.status(201).json({ data: user });
}));

export default router;
```

## Error Handling

```typescript
// Centralized error handler (must have 4 params)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error({ err, path: req.path });
  const status = err instanceof AppError ? err.statusCode : 500;
  res.status(status).json({ error: err.message });
});
```

## Security Middleware

- **helmet** — security headers (CSP, HSTS, X-Frame-Options)
- **cors** — configured CORS (never `origin: '*'` in production)
- **express-rate-limit** — rate limiting on auth endpoints
- **csurf** or double-submit cookie — CSRF protection

## Anti-Patterns to Flag

- Missing `async` error wrapper — unhandled rejections crash the process
- `app.use(cors())` without origin restriction
- Synchronous heavy computation blocking the event loop
- Not using `helmet()` for security headers
- Returning stack traces in error responses
- Missing input validation on POST/PUT endpoints
