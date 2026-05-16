---
rubric: docker
description: Docker-specific review checks
load_when: "cloud.container includes docker"
---

# Docker Review Rubric

| ID | Check | Rule | Severity if Failed |
|---|---|---|---|
| DK-1 | **Running as root** | Dockerfile without `USER` instruction (runs as root) → fail | CRITICAL |
| DK-2 | **No multi-stage** | Production image without multi-stage build (includes build tools) → fail | MAJOR |
| DK-3 | **Latest base** | `FROM image:latest` instead of pinned version tag or SHA → fail | MAJOR |
| DK-4 | **Missing HEALTHCHECK** | No `HEALTHCHECK` instruction for long-running services → fail | MAJOR |
| DK-5 | **Secrets in image** | `COPY` or `ENV` with credentials/secrets in Dockerfile → fail | CRITICAL |
| DK-6 | **Missing .dockerignore** | No `.dockerignore` file (copies unnecessary files into context) → fail | MINOR |
| DK-7 | **Layer optimization** | `COPY . .` before `RUN npm install` — invalidates dependency cache → fail | MINOR |
