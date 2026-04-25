---
node: architecture
parent: root
children: []
token_estimate: 300
load_when: "cross-repo work, new feature design, architecture review, /dev-analyst"
---

# System Architecture

<!-- SQAD:auto-generated — rebuilt by /refresh from codebase scan -->
<!-- Replace this template with your actual architecture after running /setup -->

## Overview

{{project_name}} — {{project_description}}

## Service Map

```
<!-- Populated by /refresh after scanning repos -->
<!-- Example:
  Frontend (React/Next.js)
    → API Gateway
      → Auth Service
      → Core Service → Database
      → Notification Service → Queue → Email/SMS
-->
```

## Key Architectural Decisions

| Decision | Choice | Justification |
|---|---|---|
| <!-- e.g., Database | PostgreSQL | ACID compliance needed --> |

## Data Flow

| Flow | Source | Pipeline | Destination |
|---|---|---|---|
| <!-- Populated by /refresh --> |

## Cross-Service Dependencies

<!-- Populated by /refresh and Knowledge Graph analysis -->

## Conventions

- **API style:** REST / GraphQL / gRPC (detected)
- **Auth:** JWT / OAuth2 / Session (detected)
- **Database:** {{detected from scan}}
- **Messaging:** {{detected from scan}}
