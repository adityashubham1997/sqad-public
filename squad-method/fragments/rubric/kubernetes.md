---
rubric: kubernetes
description: Kubernetes-specific review checks
load_when: "cloud.container includes kubernetes"
---

# Kubernetes Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| K8S-1 | **Running as root** | Container without `securityContext.runAsNonRoot: true` → fail | CRITICAL |
| K8S-2 | **Missing resource limits** | Pod without CPU/memory `limits` set → fail | MAJOR |
| K8S-3 | **Missing probes** | Deployment without liveness AND readiness probes → fail | MAJOR |
| K8S-4 | **Latest tag** | Image using `:latest` tag instead of specific version/SHA → fail | MAJOR |
| K8S-5 | **Privileged container** | Container with `privileged: true` without justification → fail | CRITICAL |
| K8S-6 | **Missing PDB** | Production Deployment without PodDisruptionBudget → fail | MAJOR |
| K8S-7 | **No network policy** | Namespace without NetworkPolicy (allows all traffic) → fail | MAJOR |
| K8S-8 | **Missing HPA** | User-facing Deployment without HorizontalPodAutoscaler → fail | MINOR |
