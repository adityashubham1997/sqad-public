---
fragment: stack/rails
description: Ruby on Rails framework patterns and best practices
load_when: "stack.frameworks includes rails"
token_estimate: 250
---

# Ruby on Rails Stack Context

## Core Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Architecture | Service objects for business logic | Fat controllers or fat models |
| Models | Scopes, validations, callbacks (sparingly) | Complex logic in callbacks |
| Controllers | Thin — 7 RESTful actions max | Custom actions for CRUD-like operations |
| Views | Partials, helpers, ViewComponent | Complex logic in ERB templates |
| Routing | RESTful resources, shallow nesting | Deeply nested routes (>2 levels) |
| Background | Sidekiq / Solid Queue | Long-running work in request cycle |
| Config | `credentials.yml.enc` + Rails credentials | Env vars for secrets in plain text |

## Controller Structure

```ruby
class UsersController < ApplicationController
  before_action :authenticate_user!
  before_action :set_user, only: [:show, :update, :destroy]

  def index
    @users = User.active.includes(:profile).page(params[:page])
    render json: UserSerializer.new(@users)
  end

  def create
    result = Users::CreateService.call(user_params)
    if result.success?
      render json: UserSerializer.new(result.user), status: :created
    else
      render json: { errors: result.errors }, status: :unprocessable_entity
    end
  end

  private

  def set_user = @user = User.find(params[:id])
  def user_params = params.require(:user).permit(:name, :email)
end
```

## ActiveRecord Best Practices

- Use scopes for reusable query logic
- Use `includes` / `eager_load` / `preload` to avoid N+1
- Use `find_each` for batch processing large datasets
- Use database-level constraints (not just model validations)
- Run `bullet` gem in development to detect N+1 queries

## Security (Built-in)

- CSRF protection via `protect_from_forgery`
- SQL injection prevention via ActiveRecord parameterization
- XSS protection via ERB auto-escaping
- Use `strong_parameters` — never mass-assign without permit
- Use `has_secure_password` for bcrypt password hashing
- Run `brakeman` for static security analysis

## Testing Patterns

- **RSpec** (preferred) or **Minitest**
- Use `FactoryBot` for test data factories
- Use `shoulda-matchers` for model spec one-liners
- Use `VCR` or `WebMock` for external HTTP mocking
- Request specs over controller specs (RSpec)
- System specs with Capybara for E2E

## Anti-Patterns to Flag

- N+1 queries — check with `bullet` gem
- Callbacks for complex business logic — use service objects
- `skip_before_action :verify_authenticity_token` without justification
- Missing database indexes on foreign keys
- `User.all.each` without `find_each` for large tables
- Storing secrets in `config/database.yml` or environment files in source
