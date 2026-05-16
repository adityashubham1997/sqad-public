---
fragment: stack/fastapi
description: FastAPI framework patterns and best practices
load_when: "stack.frameworks includes fastapi"
token_estimate: 240
---

# FastAPI Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Validation | Pydantic models for request/response | Manual dict parsing |
| DI | `Depends()` for dependency injection | Global state, manual wiring |
| DB | SQLAlchemy 2.0 or Tortoise ORM | Raw SQL without ORM |
| Auth | OAuth2 + JWT with `Depends` | Auth logic in every endpoint |
| Async | `async def` for I/O-bound routes | `def` with blocking I/O |
| Config | Pydantic `BaseSettings` with env vars | Hardcoded config |
| Testing | `TestClient` (httpx-based) + pytest | Manual HTTP calls |

## Route Structure

```python
from fastapi import APIRouter, Depends, HTTPException, status

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: AsyncSession = Depends(get_db)):
    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(body: CreateUserRequest, db: AsyncSession = Depends(get_db)):
    user = User(**body.model_dump())
    db.add(user)
    await db.commit()
    return user
```

## Dependency Injection

```python
# Database session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session() as session:
        yield session

# Auth dependency
async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    payload = decode_jwt(token)
    user = await user_repo.get(payload["sub"])
    if not user:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user
```

## Performance Patterns

- Use `async def` for all I/O-bound operations
- Use background tasks: `BackgroundTasks` for fire-and-forget
- Use `response_model_exclude_unset=True` to reduce payload size
- Configure connection pooling for SQLAlchemy async engine
- Use `@lru_cache` on `get_settings()` for config caching

## Testing Patterns

- Use `TestClient` from `fastapi.testclient` (sync) or `httpx.AsyncClient` (async)
- Override dependencies with `app.dependency_overrides[get_db] = mock_db`
- Use `factory_boy` or `Faker` for test data
- Test Pydantic models separately for validation edge cases

## Anti-Patterns to Flag

- Synchronous `def` for routes that do I/O (blocks event loop)
- Not using `response_model` — leaks internal fields
- Missing `Depends()` for auth on protected endpoints
- Returning SQLAlchemy models directly (use Pydantic schemas)
- Missing input validation (relying on raw dict access)
