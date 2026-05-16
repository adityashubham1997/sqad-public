---
fragment: stack/ruby
description: Ruby stack knowledge and patterns
load_when: "stack.languages includes ruby"
token_estimate: 250
---

# Ruby Stack Context

## Language Rules

- Follow Ruby style guide (community or Rubocop config)
- `# frozen_string_literal: true` at top of every file
- Prefer `each` / `map` / `select` over `for` loops
- Use `&.` (safe navigation) for nil-safe method calls
- Raise specific exceptions — never bare `raise` or `rescue`
- Use keyword arguments for methods with 3+ params

## Common Patterns

| Pattern | Preferred | Avoid |
|---|---|---|
| Error handling | `rescue SpecificError => e` | Bare `rescue` (catches everything) |
| Iteration | `collection.map { \|x\| ... }` | `for x in collection` |
| Nil safety | `user&.name` | `user && user.name` |
| Configuration | ENV vars + dotenv or Rails credentials | Hardcoded config values |
| Testing | RSpec or Minitest | No tests |
| HTTP | Faraday or HTTParty | Net::HTTP directly |

## Rails-Specific (if detected)

- Strong params: `params.require(:model).permit(:field1, :field2)`
- ActiveRecord: use scopes, avoid N+1 with `includes`
- Migrations: always reversible, no data manipulation in schema migrations
- Background jobs: Sidekiq/GoodJob — never long operations in request cycle
- Caching: fragment caching with Russian doll strategy

## Testing Patterns

- RSpec: `describe`/`context`/`it` structure
- FactoryBot for test data (not fixtures)
- VCR or WebMock for external API mocking
- `rails test` or `bundle exec rspec`

## Anti-Patterns to Flag

- Mass assignment without strong params
- `rescue Exception` (catches system signals)
- N+1 queries (ActiveRecord loops without eager loading)
- Business logic in controllers (should be in services/models)
- Mutable global state
