---
name: squad-db-audit
description: >
  Audit database schema design, query performance, migration safety, and
  connection management. Identifies N+1 queries, missing indexes, unsafe
  migrations, and schema anti-patterns.
  Use when user says "audit database", "review schema", "check query
  performance", or runs /db-audit.
---

# SQUAD-Public Database Audit — Dynamo + Index

Comprehensive audit of database schema design, query performance, migrations,
and connection management.

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols
- `squad-method/agents/_base-architect.md` — architect protocols
- `squad-method/agents/dynamo.md` — Database Architect lens
- `squad-method/agents/index.md` — Query Optimizer lens
- `squad-method/fragments/stack/database.md` — DB patterns
- `squad-method/fragments/rubric/database.md` — DB review checks

Track progress with TodoWrite.

---

## Phase 1 — DISCOVERY (Dynamo + Index)

### 1a. Detect Database Stack

Scan for database indicators:

```
Search for: prisma, typeorm, sequelize, knex, drizzle, sqlalchemy,
  hibernate, activerecord, ef core, mongoose, pymongo,
  pg, mysql2, mssql, oracle, sqlite,
  redis, memcached, elasticsearch,
  migration, schema, model, entity,
  .sql files, .prisma files, schema.rb, alembic/
```

Catalog findings:
- **Database engines** — PostgreSQL, MySQL, MongoDB, Redis, etc.
- **ORMs / query builders** — Prisma, TypeORM, SQLAlchemy, ActiveRecord, etc.
- **Migration tools** — Prisma Migrate, Alembic, Flyway, Knex, Rails migrations
- **Connection pooling** — PgBouncer, HikariCP, built-in pool config
- **Schema management** — schema files, entity definitions, models

### 1b. Map Database Architecture

1. Identify all database connections and their purpose
2. Map table/collection relationships (ER model)
3. Identify migration history and pending migrations
4. Check connection pool configuration

**USER GATE:** "Here's the database inventory. [Continue/Adjust scope]"

---

## Phase 2 — SCHEMA REVIEW (Dynamo)

### 2a. Schema Design Audit

- Are tables properly normalized (or intentionally denormalized)?
- Do all tables have primary keys?
- Are foreign keys indexed?
- Are constraints (NOT NULL, UNIQUE, CHECK) applied where needed?
- Is naming consistent across all tables and columns?
- Is PII identified and handled (encryption, masking)?

### 2b. Migration Safety Check

- Are all migrations reversible (up + down)?
- Any NOT NULL additions to populated tables without default values?
- Any destructive operations (DROP) without confirmation of no active reads?
- Is the migration strategy compatible with zero-downtime deploys?

### 2c. Run Schema Rubric

Run checks DB-1 through DB-6 and MG-1 through MG-4 from rubric.

---

## Phase 3 — QUERY PERFORMANCE (Index)

### 3a. Query Analysis

- Identify N+1 query patterns in ORM code
- Check for missing indexes on frequently filtered/joined columns
- Identify full table scans on large tables
- Check pagination strategy (OFFSET vs cursor)
- Verify EXPLAIN ANALYZE for critical queries

### 3b. Connection & Transaction Review

- Is connection pooling configured?
- Are transactions kept short? No HTTP calls inside transactions?
- Are queries parameterized (no SQL injection)?
- Are read replicas used where appropriate?

### 3c. Run Performance Rubric

Run checks QP-1 through QP-6 and CT-1 through CT-4 from rubric.

---

## Phase 4 — REPORT (Dynamo + Index)

```markdown
# Database Audit Report

## Executive Summary
- Databases: [list]
- Tables/Collections: [N]
- Critical findings: [N]
- Schema quality: [good/needs work/poor]

## Schema Inventory
[Table: Entity | PK | FKs | Indexes | Constraints | Issues]

## Query Performance
[Table: Query | Source File | Type | Est. Cost | Issue]

## Migration Safety
[Table: Migration | Reversible | Risk | Notes]

## Findings
### Critical
[SQL injection, missing PKs, NOT NULL without default]

### Major
[N+1 queries, missing indexes, full table scans]

## Recommendations
[Prioritized fixes with effort/impact]
```

**USER GATE:** "Report complete. [Export/Discuss/Create stories]"

---

## Behavioral Rules

1. **NEVER fabricate findings.** Every claim cites file path and line.
2. **Query performance claims must reference EXPLAIN output or table size estimates.**
3. **Schema issues must show the specific table and column.**
4. **Migration risks must describe the failure scenario.**
5. **Track the operation** — log to `squad-method/output/tracking.jsonl`.
