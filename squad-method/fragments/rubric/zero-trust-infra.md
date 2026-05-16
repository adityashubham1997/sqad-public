---
rubric: zero-trust-infra
description: >
  Zero Trust and infrastructure security rubric — loaded when cloud providers
  or IaC tools are detected. Covers IAM, network, encryption, and tagging.
load_when: "cloud.providers is not empty OR cloud.iac is not empty"
agents: [aegis, stratos]
---

# Zero Trust Infrastructure Rubric

## Purpose

Enforces Zero Trust principles and least privilege in cloud infrastructure.
Loaded automatically when `config.yaml` detects cloud providers or IaC tools.
Aegis and Stratos co-own this rubric.

## Core Principles

```
1. NEVER TRUST, ALWAYS VERIFY
   Every request authenticated regardless of source network.
   Internal ≠ trusted — lateral movement is #1 breach technique.

2. LEAST PRIVILEGE ACCESS
   Minimum permissions for the task. Specific resources, not wildcards.
   Time-bound where possible.

3. ASSUME BREACH
   Design for containment. Audit trails for all access.
   Blast radius minimization through segmentation.

4. VERIFY EXPLICITLY
   Validate identity at every layer (user → service → data).
   Re-verify on privilege escalation.
```

## IAM Checks

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| ZT-1 | **IAM wildcard actions** | `"Action": "*"` in IAM policy → fail | CRITICAL |
| ZT-2 | **IAM wildcard resources** | `"Resource": "*"` where specific ARN possible → fail | CRITICAL |
| ZT-3 | **Admin access** | AdministratorAccess or equivalent attached → fail | CRITICAL |
| ZT-7 | **Shared roles** | Multiple services using same IAM role → fail | MAJOR |
| ZT-10 | **Long-lived keys** | Static access keys instead of role assumption → fail | MAJOR |
| ZT-11 | **No MFA** | IAM user without MFA enforcement → fail | MAJOR |
| ZT-12 | **No key rotation** | KMS or secrets without rotation configured → fail | MAJOR |

## Network Security Checks

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| ZT-4 | **Open ingress** | `0.0.0.0/0` on non-443/80 ports → fail | CRITICAL |
| ZT-6 | **No TLS** | Load balancer or API gateway without TLS 1.2+ → fail | CRITICAL |
| ZT-8 | **Open egress** | `0.0.0.0/0` egress without documented justification → fail | MAJOR |
| ZT-9 | **No flow logs** | VPC/VNet without flow logs enabled → fail | MAJOR |

## Encryption Checks

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| ZT-5 | **Unencrypted storage** | S3/RDS/EBS/GCS/Azure Storage without encryption at rest → fail | CRITICAL |

## Tagging Checks

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| ZT-13 | **Missing tags** | Resources without owner/team/env tags → fail | MINOR |

## Example — Bad vs Good

```hcl
# BAD — wildcard action and resource
resource "aws_iam_role_policy" "lambda_policy" {
  role   = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = "s3:*"
      Resource = "*"
    }]
  })
}

# GOOD — specific actions and resources
resource "aws_iam_role_policy" "lambda_policy" {
  role   = aws_iam_role.lambda_role.id
  policy = jsonencode({
    Statement = [{
      Effect   = "Allow"
      Action   = ["s3:GetObject", "s3:PutObject"]
      Resource = [
        "${aws_s3_bucket.data.arn}",
        "${aws_s3_bucket.data.arn}/*"
      ]
    }]
  })
}
```

## Application to Reviews

1. Load this rubric when cloud/IaC is detected in `config.yaml`
2. Run all ZT-* checks against changed IaC files (*.tf, *.yaml, CDK, etc.)
3. For each failed check, cite the exact file:line and the specific violation
4. CRITICAL findings block merge — no exceptions
5. MAJOR findings must be fixed before release
