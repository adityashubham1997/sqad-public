---
fragment: cloud/aws
description: AWS cloud patterns and best practices
load_when: "cloud.providers includes aws"
token_estimate: 300
---

# AWS Cloud Context

## Key Services

| Service | Use Case | Anti-Pattern |
|---|---|---|
| EC2 | Compute (VMs) | Over-provisioned instances |
| Lambda | Serverless functions | Cold start sensitive workloads |
| ECS/Fargate | Container orchestration | Running on EC2 when Fargate suffices |
| S3 | Object storage | Public buckets, no lifecycle policies |
| RDS | Managed databases | Multi-AZ disabled in production |
| DynamoDB | NoSQL key-value | Hot partition keys |
| IAM | Identity & access | Wildcard policies |
| VPC | Network isolation | Single AZ deployments |
| CloudWatch | Monitoring | Unstructured logs |
| SQS/SNS | Messaging | Polling without long-poll |

## Well-Architected Pillars

1. **Operational Excellence** — automate everything, IaC, runbooks
2. **Security** — least privilege, encryption, Zero Trust
3. **Reliability** — multi-AZ, auto-scaling, backup/restore
4. **Performance** — right-size, caching, CDN
5. **Cost Optimization** — reserved instances, lifecycle policies, right-sizing
6. **Sustainability** — efficient resource usage

## IAM Best Practices

- Per-service IAM roles — never shared
- Specific actions, specific resources — no wildcards
- Use assume-role, not long-lived keys
- Enable MFA for all IAM users
- Condition blocks where applicable (IP, MFA, time)
- Tag all IAM resources

## Networking

- Private subnets for databases and internal services
- VPC endpoints for AWS service access (avoid NAT gateway costs)
- Security groups as primary — NACLs as secondary defense
- Flow logs on all VPCs
