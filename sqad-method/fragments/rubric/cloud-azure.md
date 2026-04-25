---
rubric: cloud-azure
description: Azure-specific review checks
load_when: "cloud.providers includes azure"
---

# Azure Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| AZ-1 | **Storage public access** | Blob container with public access level other than `None` without justification → fail | CRITICAL |
| AZ-2 | **Missing managed identity** | Service using connection strings where managed identity is available → fail | MAJOR |
| AZ-3 | **NSG open ports** | Network Security Group with `0.0.0.0/0` inbound on non-80/443 ports → fail | CRITICAL |
| AZ-4 | **Missing diagnostics** | Resource without diagnostic settings sending to Log Analytics → fail | MAJOR |
| AZ-5 | **Key Vault missing** | Secrets stored in App Settings instead of Key Vault references → fail | MAJOR |
| AZ-6 | **Missing resource locks** | Production resources without `CanNotDelete` lock → fail | MINOR |
| AZ-7 | **TLS version** | App Service or Function with minimum TLS version < 1.2 → fail | CRITICAL |
