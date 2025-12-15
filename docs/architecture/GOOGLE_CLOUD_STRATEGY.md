# ☁️ ECONEURA: Google Cloud Strategy (Best SaaS)

To transform ECONEURA into the "Best SaaS", we must migrate from a "Node.js Monolith" to a "Google Cloud Native Ecosystem".

## 1. Architecture: The Hexagonal Cloud

We will treat Google Cloud services as our Infrastructure Layer.

| Feature | Current Local Implementation | **Google Cloud Native Target** | Why? |
| :--- | :--- | :--- | :--- |
| **Compute** | Node.js Process | **Cloud Run** (Serverless) | Zero-maintenance scaling to 0. |
| **Database** | Postgres (Local/Docker) | **Cloud SQL** (PostgreSQL) | Managed backups, HA, security. |
| **Events** | `EventEmitter` (InMemory) | **Cloud Pub/Sub** | Decoupled scaling (Chat Service != Automation Worker). |
| **File Storage** | Local Disk (`uploads/`) | **Cloud Storage** (GCS) | Infinite storage, global CDN, no disk limits. |
| **Secrets** | `.env` File | **Secret Manager** | Encryption at rest, rotation, audit logs. |
| **Logging** | Console/File | **Cloud Logging** | Structured JSON, Error Reporting. |
| **CI/CD** | Manual | **Cloud Build** | Automated vulnerability scanning & deploy. |

## 2. Implementation Roadmap

### Phase 1: Storage decoupled (Critical for Cloud Run)
- [ ] Install `@google-cloud/storage`.
- [ ] Create `GoogleStorageProvider` implementing a storage interface.
- [ ] Update `uploadRoutes.ts` to use `GoogleStorageProvider` instead of `diskStorage`.

### Phase 2: Event Bus Evolution
- [ ] Install `@google-cloud/pubsub`.
- [ ] Create `PubSubEventBus` extending our `EventBus`.
- [ ] Implementation: `emitEvent` -> Publishes to Topic.

### Phase 3: Infrastructure as Code (Terraform/gcloud)
- [ ] `deploy.sh` script to provision:
    - Cloud Storage Bucket (`econeura-uploads`).
    - Cloud SQL Instance (`econeura-db`).
    - Pub/Sub Topics (`chat-messages`, `automation-triggers`).

## 3. Immediate Action Plan (The "Perfect Realization")
We will implement **Phase 1 (Storage)** immediately, as local uploads are the biggest blocker for a "SaaS" architecture (Cloud Run containers have ephemeral filesystems).

Then we will implement **Phase 2 (Events)** interface to prove design readiness.
