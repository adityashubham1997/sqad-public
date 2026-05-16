# Monitoring & Observability Fragment

## When Loaded

Loaded when `config.yaml → cloud.monitoring` is non-empty, or when
`config.yaml → cloud.providers` includes any cloud provider.

## Three Pillars

### 1. Logging
- Use structured logging (JSON) — not printf-style strings
- Include correlation/trace IDs in every log entry
- Log levels: ERROR (actionable), WARN (degraded), INFO (state change), DEBUG (development)
- Never log secrets, PII, or auth tokens

### 2. Metrics
- RED method for services: Rate, Errors, Duration
- USE method for resources: Utilization, Saturation, Errors
- Custom business metrics for KPIs
- Histogram over summary for latency (supports percentiles)

### 3. Tracing
- Propagate trace context across service boundaries
- Instrument HTTP clients, DB calls, and external API calls
- Keep trace sampling at 1-10% in production
- Use OpenTelemetry as the vendor-neutral standard

## Tool-Specific Guidance

### Datadog
- Use `dd-trace` library for APM
- Custom metrics via StatsD or Datadog API
- Log correlation: include `dd.trace_id` and `dd.span_id`

### Prometheus + Grafana
- Expose `/metrics` endpoint in services
- Use recording rules for expensive queries
- Alert on symptoms (error rate), not causes (CPU)

### New Relic
- Use distributed tracing with `newrelic` agent
- Custom events for business metrics
- Browser monitoring for frontend

### PagerDuty / Opsgenie
- Route alerts by severity and service ownership
- Define escalation policies per team
- Acknowledge → investigate → resolve workflow

## Review Checks (Observability)

| ID | Check | Severity |
|---|---|---|
| OBS-1 | New services must have health check endpoint | MAJOR |
| OBS-2 | Error paths must log with structured context | MAJOR |
| OBS-3 | External API calls must have timeout and retry with backoff | MAJOR |
| OBS-4 | No PII in log output | CRITICAL |
| OBS-5 | New endpoints must have latency metric instrumentation | MINOR |
| OBS-6 | Alert thresholds must be documented | MINOR |
