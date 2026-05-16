# Google Cloud Platform (GCP) Fragment

## When Loaded

Loaded when `config.yaml → cloud.providers` includes `"gcp"`.

## GCP-Specific Rules for Agents

### Authentication & IAM
- Use Workload Identity Federation over service account keys
- Prefer per-service service accounts over shared accounts
- Bind IAM roles at the narrowest scope (project > folder > org)
- Never commit service account key JSON files

### Compute & Runtime
- **Cloud Run** — default for stateless HTTP workloads (auto-scales to zero)
- **GKE** — use for complex orchestration, stateful workloads
- **Cloud Functions** — event-driven, single-purpose triggers
- **App Engine** — legacy; prefer Cloud Run for new projects

### Data & Storage
- **Cloud SQL** — managed relational (Postgres, MySQL)
- **Firestore** — NoSQL document DB, real-time sync
- **Cloud Storage** — object storage; use signed URLs for access control
- **BigQuery** — analytics warehouse; partition and cluster tables
- **Memorystore** — managed Redis/Memcached

### Messaging & Events
- **Pub/Sub** — async messaging, event-driven architectures
- **Cloud Tasks** — delayed/scheduled task execution
- **Eventarc** — event routing from GCP services to targets

### Networking
- **VPC Service Controls** — perimeter-based access for sensitive data
- **Cloud Armor** — WAF and DDoS protection
- **Cloud CDN** — caching at edge
- **Private Google Access** — access GCP APIs without public IPs

### Observability
- **Cloud Logging** (formerly Stackdriver) — structured logging
- **Cloud Monitoring** — metrics, dashboards, alerting
- **Cloud Trace** — distributed tracing
- **Error Reporting** — exception tracking

### CI/CD
- **Cloud Build** — native CI/CD
- **Artifact Registry** — container and package registry
- **Cloud Deploy** — managed continuous delivery to GKE/Cloud Run

### Review Checks (GCP-Specific)

| ID | Check | Severity |
|---|---|---|
| GCP-1 | No SA key files in repo | CRITICAL |
| GCP-2 | IAM roles scoped to project, not org | MAJOR |
| GCP-3 | Cloud Storage buckets not public unless intended | CRITICAL |
| GCP-4 | BigQuery tables use partitioning for large datasets | MAJOR |
| GCP-5 | Cloud Run services have concurrency/memory limits set | MINOR |
| GCP-6 | Pub/Sub dead-letter topics configured | MAJOR |
| GCP-7 | Cloud SQL connections use Cloud SQL Auth Proxy or private IP | MAJOR |
