## CI/CD ECONEURA-FULL

Este documento resume el flujo de CI/CD pensado para ECONEURA-FULL.

### CI Backend

- Workflow: `.github/workflows/backend-ci.yml`
- Disparadores:
  - `push` / `pull_request` sobre `packages/backend/**`, `tsconfig.base.json`, `package.json`.
- Pasos:
  - `npm install`
  - `npm run type-check:backend`
  - `npm run test:backend`

### CI Frontend

- Workflow: `.github/workflows/frontend-ci.yml`
- Disparadores:
  - `push` / `pull_request` sobre `packages/frontend/**`, `tsconfig.base.json`, `package.json`.
- Pasos:
  - `npm install`
  - `npm run type-check:frontend`

### Despliegue de Infraestructura
## 🔄 Google Cloud Infrastructure Deployment

The infrastructure is managed via **Google Cloud CLI (`gcloud`)** and Terraform.

### Workflow
1. **Build**: `npm run build` (Backend & Frontend)
2. **Deploy Backend**: `gcloud run deploy` (Cloud Run)
3. **Deploy Frontend**: `firebase deploy` (Firebase Hosting)

### Despliegue de Aplicación

- Workflow: `.github/workflows/app-deploy.yml`
- Disparador:
  - `workflow_dispatch` con input `environment`.
- Pasos actuales:
  - `npm install`
  - `npm run build:backend`
  - `npm run build:frontend`
  - Deploy backend a Cloud Run.
  - Deploy frontend a Firebase Hosting.
  - Smoke tests HTTP:
    - `GET /health` → verifica que el backend responde.
    - `GET /api/neuras/neura-ceo/chat` (mockeado o con token dev) → verifica que la cadena completa funciona.

### Smoke Tests Post-Deploy

Los smoke tests se ejecutan después de cada despliegue para verificar que:
1. El backend está levantado y responde en `/health`.
2. Los endpoints de API están accesibles (aunque sea con autenticación mock en dev).
3. El frontend se ha desplegado correctamente (verificación manual o automatizada).

**Nota:** En producción, los smoke tests deberían usar tokens reales o un usuario de prueba con permisos limitados.

### Secrets Requeridos

**Infraestructura:**
- `GCP_SA_KEY` – Service Account JSON para despliegue (Google Cloud).

**Aplicación:**
- `GCP_PROJECT_ID` – ID del proyecto Google Cloud (e.g., `econeura-109cc`).
- `GCP_SA_KEY` – Clave JSON de Service Account con permisos de despliegue.

**Runtime (Key Vault o GitHub Secrets):**
- `DATABASE_URL` – Connection string completa de PostgreSQL.
- `OPENAI_API_KEY` – API key de OpenAI.
- `EVENTSTORE_COSMOS_ENDPOINT`, `EVENTSTORE_COSMOS_KEY` – (Opcional, futuro) Para Event Store.
- `READMODELS_COSMOS_ENDPOINT`, `READMODELS_COSMOS_KEY` – (Opcional, futuro) Para Read Models.

**Nota:** Los secrets de runtime se validan en `packages/backend/src/config/envSchema.ts` usando Zod. Si faltan, el backend no arrancará con un error claro.


