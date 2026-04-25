---
rubric: cloud-aws
description: AWS-specific review checks
load_when: "cloud.providers includes aws"
---

# AWS Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| AWS-1 | **S3 public access** | S3 bucket with public access enabled without explicit justification → fail | CRITICAL |
| AWS-2 | **Unencrypted RDS** | RDS instance without `storage_encrypted = true` → fail | CRITICAL |
| AWS-3 | **Lambda timeout** | Lambda with default 3s timeout for operations that may exceed it → fail | MAJOR |
| AWS-4 | **Missing VPC endpoints** | S3/DynamoDB access from VPC without VPC endpoint (traffic over internet) → fail | MAJOR |
| AWS-5 | **CloudWatch alarms** | Critical service without CloudWatch alarms for errors/latency → fail | MAJOR |
| AWS-6 | **Missing tags** | Resource without `Environment`, `Team`, `Service` tags → fail | MINOR |
| AWS-7 | **Default VPC** | Resources deployed in default VPC instead of custom VPC → fail | MAJOR |
