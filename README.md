# 🦅 ECONEURA: GOOGLE CLOUD NATIVE EDITION

**Status**: MIGRATED (Strategy Phoenix)
**Project ID**: `gen-lang-client-0254169723`
**Region**: `us-central1`

---

## 🏗️ Architecture (Google Native)

This project is built on **Google Cloud Platform**.


### 1. Backend (`packages/backend`)
*   **Runtime**: Node.js 20 (Dockerized for **Cloud Run**).
*   **Database**: PostgreSQL 15 on **Cloud SQL**, connected via Unix Sockets (`/cloudsql/...`).
*   **Storage**: `@google-cloud/storage` (replacing Azure Blob).
*   **Logging**: Google Cloud Logging (Json Structured).
*   **Secrets**: API Keys injected via `env.ts` (Gemini, JWT).

### 2. Frontend (`packages/frontend`)
*   **Hosting**: **Firebase Hosting**.
*   **Design**: Pixel-Perfect Mirror of `ECONEURA-GO` (all components preserved).
*   **Integration**: Rewrites configured in `firebase.json` for API calls.

### 3. Infrastructure (`infrastructure/`)
*   **Tool**: Terraform.
*   **Resources**: Cloud Run, Cloud SQL, Artifact Registry, Secret Manager.

---

## 🚀 How to Deploy (Production)

### Prerequisites
1.  **Google Cloud CLI** (`gcloud`) installed & authenticated.
2.  **Terraform** installed.

### Automated Command
Run the master script to deploy everything:
```bash
./deploy.sh
```

### Manual Steps
1.  **Infrastructure**:
    ```bash
    cd infrastructure
    terraform init
    terraform apply
    ```
2.  **Backend**:
    ```bash
    cd packages/backend
    gcloud run deploy econeura-backend --source .
    ```
3.  **Frontend**:
    ```bash
    cd packages/frontend
    npm run build
    firebase deploy
    ```

---

## 🔑 Key Configuration
*   **Gemini API Key**: Configured in `src/config/env.ts`.
*   **Database Config**: Auto-detected via `INSTANCE_CONNECTION_NAME` (Cloud Run) or localhost (Dev).
