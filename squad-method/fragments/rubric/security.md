---
rubric: security
description: >
  Security review rubric — always loaded regardless of stack. Covers OWASP
  Top 10, auth, input validation, secrets, and dependency security.
always_load: true
agent: aegis
---

# Security Review Rubric

## Purpose

Security checks that apply to every project. Aegis owns this rubric but all
agents must be aware of CRITICAL security findings — they block merge regardless
of which agent discovers them.

## Checks

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| SEC-1 | **No hardcoded secrets** | Passwords, API keys, tokens, connection strings in source → fail | CRITICAL |
| SEC-2 | **Input validation** | User input in queries/commands without sanitization → fail | CRITICAL |
| SEC-3 | **Auth enforcement** | New endpoint/route without authentication → fail | CRITICAL |
| SEC-4 | **Parameterized queries** | String interpolation in SQL/NoSQL queries → fail | CRITICAL |
| SEC-5 | **CORS policy** | `Access-Control-Allow-Origin: *` in production config → fail | CRITICAL |
| SEC-6 | **Error exposure** | Stack traces, SQL errors, internal paths in API responses → fail | MAJOR |
| SEC-7 | **Dependency CVEs** | Known critical CVE in direct dependency → fail | MAJOR |
| SEC-8 | **Rate limiting** | Auth endpoints without rate limiting → fail | MAJOR |
| SEC-9 | **CSRF protection** | State-changing endpoint without CSRF token → fail | MAJOR |
| SEC-10 | **Security headers** | Missing CSP, HSTS, X-Frame-Options, X-Content-Type-Options → fail | MINOR |

## OWASP Top 10 Quick Reference

| # | Category | What to Check |
|---|---|---|
| A01 | Broken Access Control | Missing auth, IDOR, privilege escalation |
| A02 | Cryptographic Failures | Weak encryption, exposed secrets, plain-text storage |
| A03 | Injection | SQL, NoSQL, command, LDAP, XSS injection |
| A04 | Insecure Design | Missing threat model, trust boundary violations |
| A05 | Security Misconfiguration | Default creds, unnecessary features, verbose errors |
| A06 | Vulnerable Components | Outdated deps with known CVEs |
| A07 | Auth Failures | Weak passwords, missing MFA, session fixation |
| A08 | Data Integrity Failures | Unsigned updates, insecure deserialization |
| A09 | Logging Failures | Insufficient audit logging, missing alerting |
| A10 | SSRF | Unvalidated URLs, internal service access via user input |

## Application to Reviews

1. Run all SEC-* checks against changed files
2. For each failed check, cite the exact file:line and the OWASP category
3. Suggest a concrete fix with code example
4. CRITICAL findings block merge — no exceptions
5. If compliance frameworks are configured (SOC2, HIPAA, PCI, GDPR),
   cross-reference findings against compliance requirements
