---
rubric: cloud-gcp
description: GCP-specific review checks
load_when: "cloud.providers includes gcp"
---

# GCP Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| GCP-1 | **Public bucket** | GCS bucket with `allUsers` or `allAuthenticatedUsers` ACL without justification → fail | CRITICAL |
| GCP-2 | **Default service account** | Compute/Cloud Run using default service account instead of dedicated SA → fail | MAJOR |
| GCP-3 | **Missing audit logging** | Project without Cloud Audit Logs enabled for data access → fail | MAJOR |
| GCP-4 | **Overprivileged IAM** | Service account with `roles/editor` or `roles/owner` → fail | CRITICAL |
| GCP-5 | **Missing VPC SC** | Sensitive data services without VPC Service Controls perimeter → fail | MAJOR |
| GCP-6 | **Cloud SQL public IP** | Cloud SQL instance with public IP enabled without justification → fail | CRITICAL |
| GCP-7 | **Missing labels** | Resource without `environment`, `team`, `service` labels → fail | MINOR |
