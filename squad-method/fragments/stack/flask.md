---
fragment: stack/flask
description: Flask framework patterns and best practices
load_when: "stack.frameworks includes flask"
token_estimate: 220
---

# Flask Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Structure | Application factory pattern | Global `app = Flask(__name__)` |
| Config | `app.config.from_object()` with env classes | Hardcoded config values |
| Blueprints | Feature-based blueprints | All routes in single file |
| Database | Flask-SQLAlchemy with migrations (Alembic) | Raw SQL without ORM |
| Validation | Marshmallow or Pydantic | Manual request parsing |
| Auth | Flask-Login or Flask-JWT-Extended | Custom session handling |
| Testing | pytest with `app.test_client()` | Manual HTTP testing |

## Application Factory

```python
def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    db.init_app(app)
    migrate.init_app(app, db)
    login_manager.init_app(app)

    from .api import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app
```

## Route Structure

```python
# api/users.py
bp = Blueprint('users', __name__)

@bp.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify(users_schema.dump(users))

@bp.route('/users', methods=['POST'])
def create_user():
    data = user_schema.load(request.json)
    user = User(**data)
    db.session.add(user)
    db.session.commit()
    return jsonify(user_schema.dump(user)), 201
```

## Error Handling

```python
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(Exception)
def handle_exception(error):
    app.logger.error(f'Unhandled: {error}', exc_info=True)
    return jsonify({'error': 'Internal server error'}), 500
```

## Security

- Use `Flask-Talisman` for security headers (CSP, HSTS)
- Use `Flask-CORS` with restricted origins
- Use `Flask-Limiter` for rate limiting
- Never use `app.secret_key` from source code — use env vars
- Enable `SESSION_COOKIE_HTTPONLY` and `SESSION_COOKIE_SECURE`

## Anti-Patterns to Flag

- Global app instance without factory pattern
- Missing input validation on POST/PUT endpoints
- SQL queries with string formatting — use ORM or parameterized queries
- `DEBUG=True` in production
- Storing secrets in source code or `config.py`
