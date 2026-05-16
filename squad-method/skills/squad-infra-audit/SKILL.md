---
name: squad-infra-audit
description: >
  Audit infrastructure observability, monitoring, alerting, and configuration
  management. Covers Datadog, New Relic, Ansible, Azure DevOps, Prometheus,
  and other infra tools.
  Use when user says "audit infrastructure", "review monitoring",
  "check observability", "audit infra", or runs /infra-audit.
---

# SQUAD-Public Infrastructure Audit — Phoenix + Stratos + Kernel

Comprehensive audit of infrastructure monitoring, observability, alerting,
configuration management, and CI/CD practices.

**Bootstrap (read now):**
- `squad-method/config.yaml` — team config
- `squad-method/agents/_base-agent.md` — base protocols
- `squad-method/agents/phoenix.md` — DevOps/SRE lens
- `squad-method/agents/stratos.md` — Cloud Architect lens
- `squad-method/fragments/cloud/monitoring.md` — observability patterns
- `squad-method/fragments/rubric/observability.md` — infra review checks

**Phase-gated loading:**
- Phase 2: `squad-method/agents/kernel.md` — systems-level review
- Phase 2: `squad-method/fragments/cloud/ansible.md` — if Ansible detected
- Phase 2: `squad-method/fragments/cloud/azure-devops.md` — if Azure DevOps detected
- Phase 3: `squad-method/agents/aegis.md` — security lens on infra

Track progress with TodoWrite.

---

## Phase 1 — DISCOVERY (Phoenix + Stratos)

### 1a. Detect Infrastructure Stack

Scan for infrastructure tooling:

```
Search for: datadog, dd-trace, dd-agent, ddtrace,
  newrelic, new_relic, @newrelic, newrelic.yml,
  prometheus, grafana, alertmanager, loki, tempo, mimir,
  ansible, playbook, inventory, vault,
  azure-pipelines, azuredevops,
  pagerduty, opsgenie, victorops, incident.io,
  terraform, pulumi, cloudformation,
  .sentryclirc, sentry-cli, @sentry/node,
  opentelemetry, otel, jaeger, zipkin
```

Catalog findings:
- **APM** — Datadog APM, New Relic, Dynatrace, AppDynamics
- **Metrics** — Prometheus, Datadog Metrics, CloudWatch, Azure Monitor
- **Logging** — ELK, Loki, Datadog Logs, CloudWatch Logs, Splunk
- **Tracing** — OpenTelemetry, Jaeger, Zipkin, Datadog/New Relic distributed tracing
- **Alerting** — PagerDuty, Opsgenie, Datadog Monitors, New Relic Alerts
- **Config Management** — Ansible, Chef, Puppet, Salt
- **CI/CD** — GitHub Actions, GitLab CI, Azure DevOps, Jenkins, CircleCI
- **IaC** — Terraform, Pulumi, CloudFormation, CDK, Ansible

### 1b. Map Observability Coverage

For each service/component:
1. Is it instrumented for APM/tracing?
2. Are logs structured and correlated with traces?
3. Are custom metrics exposed?
4. Are alerts defined with runbooks?
5. Are SLOs/SLIs defined?

**USER GATE:** "Here's the infrastructure inventory. [Continue/Adjust scope]"

---

## Phase 2 — ANALYSIS (Phoenix + Kernel)

### 2a. Observability Gap Analysis

For each service, check:
- **Tracing** — Is distributed tracing enabled? Trace context propagated?
- **Logging** — Structured JSON? Correlation IDs? Log levels appropriate?
- **Metrics** — RED (Rate, Errors, Duration) for services? USE for resources?
- **Health checks** — `/health` endpoint? Readiness/liveness probes?
- **Alerting** — Alerts on symptoms? Runbooks linked? Escalation defined?

### 2b. Rubric Check

Run checks from:
- `observability.md` rubric (DD-*, NR-*, OBS-*, CFG-*)
- `cloud/ansible.md` checks (ANS-*) if Ansible detected
- `cloud/azure-devops.md` checks (ADO-*) if Azure DevOps detected

### 2c. Configuration Management Review (if applicable)

- Are playbooks/recipes idempotent?
- Are secrets encrypted (Vault, SOPS)?
- Is there drift detection?
- Are changes tested before production (Molecule, Test Kitchen)?

---

## Phase 3 — SECURITY REVIEW (Aegis + Phoenix)

### 3a. Infrastructure Security

- **Secrets management** — Are API keys, tokens, certs in a vault?
- **Network segmentation** — Are monitoring endpoints restricted?
- **Access control** — Who can modify alerts, dashboards, pipelines?
- **Audit logging** — Are infra changes tracked and auditable?
- **PII in logs** — Is sensitive data filtered before ingestion?

---

## Phase 4 — REPORT (Phoenix + Stratos)

```markdown
# Infrastructure Audit Report

## Executive Summary
- Services audited: [N]
- Observability coverage: [N]% instrumented
- Critical findings: [N]
- Monitoring tools: [list]

## Observability Matrix
[Table: Service | APM | Logs | Metrics | Alerts | SLO | Health]

## Findings
### Critical
[PII in logs, secrets in config, no alerts on critical paths]

### Major
[Missing tracing, unstructured logs, no runbooks]

## Tool-Specific Recommendations
### Datadog / New Relic / Prometheus
[Targeted improvements per tool]

### Ansible / Azure DevOps
[Configuration and pipeline improvements]

## Recommendations
[Prioritized action items with effort/impact]
```

**USER GATE:** "Report complete. [Export/Discuss findings/Create stories]"

---

## Behavioral Rules

1. **NEVER fabricate findings.** Every claim cites a file path and line.
2. **Coverage gaps must show what's missing, not just what's present.**
3. **Alert recommendations must include specific thresholds and rationale.**
4. **Tool recommendations must match the detected stack — don't suggest Datadog if they use New Relic.**
5. **Track the operation** — log to `squad-method/output/tracking.jsonl`.
