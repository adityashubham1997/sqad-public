# Microsoft Azure Fragment

## When Loaded

Loaded when `config.yaml → cloud.providers` includes `"azure"`.

## Azure-Specific Rules for Agents

### Authentication & Identity
- Use Managed Identity over connection strings/keys for Azure services
- Use Azure AD (Entra ID) for user/app authentication
- Store secrets in Azure Key Vault — never in config files
- Use RBAC with least privilege; prefer built-in roles over custom

### Compute & Runtime
- **Azure App Service** — managed web hosting (Linux/Windows)
- **Azure Functions** — serverless, event-driven
- **Azure Container Apps** — managed containers with auto-scaling
- **AKS** (Azure Kubernetes Service) — full Kubernetes orchestration
- **Azure Container Instances** — quick container deployment

### Data & Storage
- **Azure SQL** — managed SQL Server
- **Cosmos DB** — globally distributed NoSQL
- **Azure Storage** — blobs, queues, tables, files
- **Azure Cache for Redis** — managed Redis
- **Azure Database for PostgreSQL** — managed Postgres

### Messaging & Events
- **Azure Service Bus** — enterprise messaging (queues + topics)
- **Azure Event Grid** — event routing
- **Azure Event Hubs** — big data streaming (Kafka-compatible)
- **Azure Queue Storage** — simple message queue

### Networking
- **Azure Front Door** — global load balancer + WAF + CDN
- **Application Gateway** — regional L7 load balancer + WAF
- **Private Endpoints** — private connectivity to Azure services
- **VNet Integration** — isolate workloads in virtual networks

### Observability
- **Azure Monitor** — metrics, logs, alerts
- **Application Insights** — APM, distributed tracing, live metrics
- **Log Analytics** — Kusto queries on centralized logs

### CI/CD
- **Azure DevOps Pipelines** — CI/CD (YAML or classic)
- **GitHub Actions** — with Azure login action
- **Azure Container Registry** — Docker registry

### Review Checks (Azure-Specific)

| ID | Check | Severity |
|---|---|---|
| AZ-1 | No connection strings or keys in source code | CRITICAL |
| AZ-2 | Use Managed Identity for Azure service access | MAJOR |
| AZ-3 | Storage accounts not publicly accessible unless intended | CRITICAL |
| AZ-4 | Cosmos DB RU limits configured appropriately | MAJOR |
| AZ-5 | App Service/Functions use deployment slots for zero-downtime | MINOR |
| AZ-6 | Service Bus dead-letter queues configured | MAJOR |
| AZ-7 | Azure SQL uses private endpoint or VNet rules | MAJOR |
| AZ-8 | Key Vault soft-delete and purge protection enabled | MAJOR |
