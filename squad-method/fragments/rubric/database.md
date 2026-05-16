---
rubric: database
description: Database design, query optimization, and migration review checks
load_when: "stack.frameworks includes postgres OR mysql OR mongodb OR prisma OR sequelize OR typeorm OR knex OR sqlalchemy"
---

# Database Review Rubric

## Schema Design Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| DB-1 | **No primary key** | Table created without a primary key | CRITICAL |
| DB-2 | **Missing FK index** | Foreign key column without a matching index | MAJOR |
| DB-3 | **Missing NOT NULL** | Column allows NULL without business justification | MINOR |
| DB-4 | **No constraints** | Table without UNIQUE, CHECK, or FK constraints where data integrity requires them | MAJOR |
| DB-5 | **Inconsistent naming** | Tables/columns don't follow project naming convention (snake_case, singular, etc.) | MINOR |
| DB-6 | **PII unencrypted** | Personally identifiable information stored without encryption or masking | CRITICAL |

## Query Performance Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| QP-1 | **Full table scan** | Query on large table without index-supported WHERE clause | MAJOR |
| QP-2 | **N+1 queries** | Related records fetched in a loop instead of JOIN or batch | MAJOR |
| QP-3 | **SELECT \*** | Selecting all columns instead of explicit column list | MINOR |
| QP-4 | **OFFSET pagination** | Using OFFSET for pagination on large datasets instead of cursor/keyset | MAJOR |
| QP-5 | **Missing EXPLAIN** | Performance-critical query added without EXPLAIN ANALYZE verification | MINOR |
| QP-6 | **Unbounded query** | Query without LIMIT on potentially large result set | MAJOR |

## Migration Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| MG-1 | **Irreversible migration** | Migration without a `down` / rollback script | MAJOR |
| MG-2 | **NOT NULL without default** | Adding NOT NULL column to populated table without default value (table lock) | CRITICAL |
| MG-3 | **Destructive migration** | Dropping column/table without confirming data is no longer read | CRITICAL |
| MG-4 | **No data backfill** | Schema change requiring data migration without backfill script | MAJOR |

## Connection & Transaction Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| CT-1 | **No connection pool** | Application opens new DB connection per request | MAJOR |
| CT-2 | **Long transaction** | Transaction containing external HTTP calls or long-running operations | MAJOR |
| CT-3 | **SQL injection** | Query built with string concatenation instead of parameterized queries | CRITICAL |
| CT-4 | **Implicit transaction scope** | ORM transaction boundaries not explicitly managed in write operations | MINOR |
