---
fragment: cloud/kubernetes
description: Kubernetes patterns and best practices
load_when: "cloud.container includes kubernetes"
token_estimate: 250
---

# Kubernetes Context

## Resource Requirements

- Always set `requests` and `limits` for CPU and memory
- Requests = guaranteed resources, Limits = maximum allowed
- Start conservative, tune based on metrics

## Probes

- **Liveness:** Restart if unhealthy (e.g., `/healthz`)
- **Readiness:** Remove from service if not ready (e.g., `/ready`)
- **Startup:** Delay liveness checks for slow-starting apps
- Set appropriate `initialDelaySeconds`, `periodSeconds`, `failureThreshold`

## Security

- Run as non-root: `securityContext.runAsNonRoot: true`
- Read-only root filesystem where possible
- Use NetworkPolicies to restrict pod-to-pod traffic
- RBAC with least privilege — no cluster-admin for apps
- Use Secrets (not ConfigMaps) for sensitive data
- Enable Pod Security Standards (restricted)

## Deployment Best Practices

- Rolling updates with `maxUnavailable: 0, maxSurge: 1` for zero downtime
- Pod Disruption Budgets (PDB) for availability during maintenance
- Horizontal Pod Autoscaler (HPA) for scaling
- Use `topologySpreadConstraints` for AZ distribution

## Anti-Patterns to Flag

- No resource limits set
- Missing liveness/readiness probes
- Running as root
- `imagePullPolicy: Always` without pinned tag
- Storing secrets in ConfigMaps
- No NetworkPolicy (default allow-all)
- Single replica in production
