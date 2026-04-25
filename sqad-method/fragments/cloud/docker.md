---
fragment: cloud/docker
description: Docker container patterns and best practices
load_when: "cloud.container includes docker"
token_estimate: 200
---

# Docker Context

## Dockerfile Best Practices

- Multi-stage builds to minimize image size
- Pin base image versions (never `latest`)
- Run as non-root user
- Use `.dockerignore` to exclude unnecessary files
- Order layers from least to most frequently changing (cache optimization)
- One process per container
- Use HEALTHCHECK instruction

## Example — Multi-Stage Build

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --production=false
COPY . .
RUN npm run build

# Runtime stage
FROM node:20-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
USER app
EXPOSE 3000
HEALTHCHECK CMD wget -q --spider http://localhost:3000/health || exit 1
CMD ["node", "dist/index.js"]
```

## Security

- Scan images with Trivy, Snyk, or Docker Scout
- Never store secrets in images — use runtime injection
- Use distroless or Alpine base images
- Keep images small — fewer packages = smaller attack surface
- Pin dependencies in lockfiles

## Anti-Patterns to Flag

- `latest` tag in FROM
- Running as root
- Secrets in Dockerfile (ARG, ENV, COPY .env)
- No HEALTHCHECK
- Installing dev dependencies in production image
- Single-stage build with build tools in final image
