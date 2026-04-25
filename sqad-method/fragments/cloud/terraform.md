---
fragment: cloud/terraform
description: Terraform IaC patterns and best practices
load_when: "cloud.iac includes terraform"
token_estimate: 250
---

# Terraform Context

## Structure

```
infra/
├── modules/          # Reusable modules
│   ├── vpc/
│   ├── ecs/
│   └── rds/
├── environments/     # Per-environment configs
│   ├── dev/
│   ├── staging/
│   └── prod/
├── backend.tf        # State configuration
├── providers.tf      # Provider configuration
├── variables.tf      # Input variables
├── outputs.tf        # Output values
└── main.tf           # Resource composition
```

## Best Practices

- **State:** Remote backend with locking (S3+DynamoDB, GCS, Azure Blob)
- **Modules:** Reusable, versioned, pinned sources
- **Variables:** Always validate, always describe, always type
- **Naming:** `{project}-{env}-{resource}-{qualifier}`
- **Tags:** owner, team, environment, purpose on every resource
- **Lifecycle:** `prevent_destroy` on stateful resources
- **Secrets:** Never in .tf files — use Vault, SSM, or Secrets Manager

## Anti-Patterns to Flag

- Hardcoded region, account IDs, or AMI IDs
- Backend without state locking
- Module source without version pin
- `count` for complex conditional resources (use `for_each`)
- No consistent resource naming
- Missing variable descriptions
- Destructive changes without `prevent_destroy`
