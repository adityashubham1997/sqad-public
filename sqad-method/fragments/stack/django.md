---
fragment: stack/django
description: Django framework patterns and best practices
load_when: "stack.frameworks includes django"
token_estimate: 250
---

# Django Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Views | Class-based views (CBVs) for CRUD, function views for custom | Raw SQL in views |
| Models | Fat models, thin views | Business logic in views |
| Forms | `ModelForm` / `Form` with validation | Manual request.POST parsing |
| ORM | QuerySet chaining, `select_related`/`prefetch_related` | N+1 queries, raw SQL unless necessary |
| Config | `django-environ` for env vars | Secrets in `settings.py` |
| Auth | Django auth + `django-allauth` | Custom auth from scratch |
| API | Django REST Framework (DRF) | Manual JSON serialization |

## Model Best Practices

```python
class User(AbstractUser):
    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['email'])]

    bio = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def get_full_name(self) -> str:
        return f"{self.first_name} {self.last_name}".strip()
```

## QuerySet Optimization

- Use `select_related()` for ForeignKey (SQL JOIN)
- Use `prefetch_related()` for ManyToMany / reverse FK
- Use `.only()` / `.defer()` to limit fetched fields
- Use `.exists()` instead of `.count() > 0`
- Use `F()` and `Q()` for complex queries
- Use `.iterator()` for large QuerySets to reduce memory

## Security (Built-in)

- CSRF protection enabled by default — never disable globally
- SQL injection protection via ORM parameterization
- XSS protection via auto-escaping templates
- Clickjacking protection via `X-Frame-Options` middleware
- Use `django.contrib.auth.hashers` — never hash passwords manually

## Testing Patterns

- **pytest-django** (recommended) or Django's `TestCase`
- Use `APIClient` from DRF for API tests
- `TransactionTestCase` for tests needing real transactions
- `factory_boy` for model factories
- `override_settings` decorator for config-dependent tests

## Anti-Patterns to Flag

- Queries inside loops (N+1) — use `prefetch_related`
- Business logic in views instead of model methods or services
- `settings.DEBUG = True` in production
- Missing database indexes on frequently filtered fields
- Using `eval()` or `exec()` with user input
