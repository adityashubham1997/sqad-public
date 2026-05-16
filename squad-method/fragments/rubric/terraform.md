---
rubric: terraform
description: Terraform-specific review checks
load_when: "cloud.iac includes terraform"
---

# Terraform Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| TF-1 | **No hardcoded IDs** | Region, account IDs, or AMI IDs hardcoded → fail | CRITICAL |
| TF-2 | **State locking** | Backend configuration without state locking (DynamoDB/GCS) → fail | CRITICAL |
| TF-3 | **Consistent naming** | Resources not following naming convention → fail | MAJOR |
| TF-4 | **Module versioning** | Module source without version pin → fail | MAJOR |
| TF-5 | **Destructive protection** | Destructive change without `prevent_destroy` lifecycle → fail | MAJOR |
| TF-6 | **Variables validated** | Variable without `validation` block where constraints apply → fail | MINOR |
| TF-7 | **Outputs documented** | Output without `description` field → fail | MINOR |
