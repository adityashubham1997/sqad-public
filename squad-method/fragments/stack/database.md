---
fragment: stack/database
description: Database design, query optimization, and migration patterns
load_when: "stack.frameworks includes postgres OR mysql OR mongodb OR redis OR prisma OR sequelize OR typeorm OR knex OR drizzle OR sqlalchemy OR dbt"
token_estimate: 900
---

# Database Stack Context

## Database Selection Guide

| Type | Use Case | Examples |
|---|---|---|
| **Relational** | ACID transactions, complex queries, joins | PostgreSQL, MySQL, SQL Server, Oracle |
| **Document** | Flexible schema, nested data, rapid iteration | MongoDB, DynamoDB, CouchDB, Firestore |
| **Key-Value** | Caching, sessions, simple lookups | Redis, Memcached, DynamoDB |
| **Graph** | Relationship-heavy queries, recommendations | Neo4j, Neptune, TigerGraph |
| **Time-Series** | Metrics, IoT, event streams | TimescaleDB, InfluxDB, QuestDB |
| **Search** | Full-text search, faceted search | Elasticsearch, OpenSearch, Meilisearch |
| **Vector** | Embeddings, similarity search, AI/ML | pgvector, Pinecone, Weaviate, Qdrant |

## ORM/Query Builder Patterns

| Tool | Language | Pattern | Watch Out |
|---|---|---|---|
| **Prisma** | TypeScript | Schema-first, type-safe client | N+1 defaults, no raw SQL composability |
| **Drizzle** | TypeScript | SQL-like builder, type-safe | Less mature ecosystem |
| **TypeORM** | TypeScript | Active Record + Data Mapper | Lazy loading gotchas, migration bugs |
| **Sequelize** | JavaScript | Active Record, migrations | Implicit type coercion, scope leaks |
| **SQLAlchemy** | Python | Unit of Work, ORM + Core | Session management complexity |
| **Knex** | JavaScript | Query builder, migrations | Raw SQL injection if not careful |
| **ActiveRecord** | Ruby | Convention over config | N+1 everywhere, fat models |
| **Hibernate/JPA** | Java | Data Mapper, lazy loading | LazyInitializationException, N+1 |
| **EF Core** | C# | LINQ-to-SQL, migrations | Tracking mode gotchas, lazy loading |

## Migration Best Practices

### Zero-Downtime Migrations
1. **Add column** → deploy code that writes both → backfill → deploy code that reads new → drop old
2. **Rename column** → add new column → copy data → deploy → drop old
3. **Add NOT NULL** → add nullable first → backfill → add constraint
4. **Drop column** → stop reading → stop writing → drop

### Migration Tools
| Tool | Stack | Key Feature |
|---|---|---|
| Flyway | Java/JVM | Versioned SQL scripts |
| Liquibase | JVM | XML/YAML/SQL, rollback support |
| Alembic | Python | Auto-generate from SQLAlchemy models |
| Prisma Migrate | TypeScript | Schema-diff based |
| Knex Migrations | JavaScript | Programmatic up/down |
| Rails Migrations | Ruby | DSL, reversible by default |
| EF Migrations | C# | Code-first, auto-generate |

## Index Strategy

| Index Type | Use Case | Example |
|---|---|---|
| **B-tree** (default) | Equality, range, ORDER BY | `CREATE INDEX ON users(email)` |
| **Hash** | Equality only (faster) | `USING hash` |
| **Composite** | Multi-column queries | `ON orders(user_id, created_at)` |
| **Covering** | Avoid table lookup | `INCLUDE (name, email)` |
| **Partial** | Index subset of rows | `WHERE active = true` |
| **GIN** | Full-text, JSONB, arrays | `ON docs USING gin(body)` |
| **Expression** | Computed values | `ON users(lower(email))` |

## Connection Pooling

| Tool | For | Config |
|---|---|---|
| **PgBouncer** | PostgreSQL | Transaction/session/statement modes |
| **ProxySQL** | MySQL | Read/write splitting, connection pooling |
| **HikariCP** | JVM | Fast, minimal, production default |
| **node-postgres Pool** | Node.js | max, idleTimeoutMillis, connectionTimeoutMillis |

## Anti-Patterns

- **N+1 queries** — Fetching related records one by one in a loop
- **SELECT \*** — Transferring unnecessary data, breaking schema changes
- **OFFSET pagination** — O(n) per page. Use cursor/keyset pagination
- **Implicit transactions** — Not knowing when the ORM wraps in a transaction
- **Missing indexes** — No index on foreign keys, filter columns, ORDER BY columns
- **Over-indexing** — Indexes on every column, slowing writes for marginal read gain
- **No connection pool** — Opening a new connection per request
- **String concatenation SQL** — SQL injection vulnerability
