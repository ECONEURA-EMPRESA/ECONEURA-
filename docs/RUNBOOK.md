# 📘 ECONEURA-GO Operational Runbook

This runbook consolidates all operational commands and procedures for the ECONEURA-GO monorepo.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- Azure CLI

### Installation
```bash
npm install
```

### Development
```bash
# Start all services (Backend + Frontend)
npm run dev

# Start specific workspace
npm run dev --workspace=@econeura/backend
npm run dev --workspace=@econeura/web
```

## 🧪 Testing

### Run All Tests
```bash
npm test --workspaces
```

### Backend Tests
```bash
npm test --workspace=@econeura/backend
```

### Frontend Tests
```bash
npm test --workspace=@econeura/web
```

## 🏗️ Build & Deployment

### Build Monorepo
```bash
npm run build
```

### Docker Build
```bash
docker-compose build
```

### Azure Deployment
Refer to `README-DEPLOYMENT.md` for detailed Azure deployment steps.

## 🛠️ Troubleshooting

### Reset Backend
If the backend is stuck or port 3000 is in use:
```powershell
# Windows
taskkill /F /IM node.exe
```

### Reset Testing Environment
If tests are hanging:
```bash
npm run test:reset --workspace=@econeura/backend
```

### Manual Upload Test
To test file upload functionality manually:
```bash
# Ensure backend is running
curl -F "file=@./test-file.txt" http://localhost:3000/api/upload
```

---
**Note:** archived command files can be found in `docs/archive/`.
