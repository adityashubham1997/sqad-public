---
rubric: observability
description: Observability, monitoring, and infrastructure tool review checks (Datadog, New Relic, Ansible, etc.)
load_when: "cloud.monitoring is non-empty OR cloud.iac includes ansible"
---

# Observability & Infrastructure Rubric

## Datadog Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| DD-1 | **No APM tracing** | Service deployed without `dd-trace` instrumentation | MAJOR |
| DD-2 | **Missing log correlation** | Logs don't include `dd.trace_id` and `dd.span_id` for APM linkage | MAJOR |
| DD-3 | **Untagged resources** | Custom metrics and monitors missing `service`, `env`, `version` tags | MINOR |
| DD-4 | **No synthetic monitors** | Critical user journeys without Datadog Synthetics checks | MINOR |
| DD-5 | **Alert without runbook** | Monitor triggers without linked runbook or investigation steps | MAJOR |

## New Relic Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| NR-1 | **No distributed tracing** | Service missing New Relic agent with distributed tracing enabled | MAJOR |
| NR-2 | **Missing custom events** | Business-critical actions not tracked as custom events | MINOR |
| NR-3 | **No alert policies** | Service deployed without NRQL alert conditions | MAJOR |
| NR-4 | **Browser monitoring absent** | User-facing app without New Relic Browser agent | MINOR |
| NR-5 | **No SLI/SLO defined** | Service without Service Level Indicators in New Relic | MAJOR |

## General Observability Checks

| ID | Check | Rule | Severity |
|---|---|---|---|
| OBS-1 | **No health endpoint** | New service missing `/health` or `/healthz` endpoint | MAJOR |
| OBS-2 | **Unstructured logs** | Logs using printf-style strings instead of structured JSON | MAJOR |
| OBS-3 | **No timeout/retry** | External API calls without timeout and exponential backoff | MAJOR |
| OBS-4 | **PII in logs** | Personal data (email, SSN, tokens) appearing in log output | CRITICAL |
| OBS-5 | **No latency metrics** | New endpoints without request duration instrumentation | MINOR |
| OBS-6 | **Missing alert thresholds** | Alert conditions without documented thresholds and rationale | MINOR |
| OBS-7 | **No on-call runbooks** | Alerts fire without documented investigation/remediation steps | MAJOR |
| OBS-8 | **No SLO/error budget** | Service without defined SLO and error budget tracking | MAJOR |

## Infrastructure Checks (Ansible/Chef/Puppet)

| ID | Check | Rule | Severity |
|---|---|---|---|
| CFG-1 | **Plaintext secrets** | Credentials in config files not encrypted (Vault, SOPS, sealed secrets) | CRITICAL |
| CFG-2 | **Non-idempotent** | Configuration tasks not safe to re-run (data loss, duplicate resources) | MAJOR |
| CFG-3 | **No drift detection** | Infrastructure state not periodically reconciled against declared config | MINOR |
| CFG-4 | **No rollback plan** | Configuration changes without documented rollback procedure | MAJOR |
