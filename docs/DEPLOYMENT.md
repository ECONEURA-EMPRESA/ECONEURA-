# 🚀 GUÍA DE DEPLOYMENT - ECONEURA-FULL

**NO FALLAR - ÚLTIMA OPORTUNIDAD**

---

## ⚡ INICIO RÁPIDO (5 MINUTOS)

### 1. Validar Localmente

```powershell
.\scripts\validate-all.ps1 -Environment staging
```

**Si hay errores, corregirlos antes de continuar.**

**Required in GitHub Secrets** (for Google Cloud):
- `GCP_SA_KEY`: Service Account JSON Key for deployment.


### 3. Deploy

**Ejecutar workflows desde GitHub Actions:**
1. `infra-deploy.yml` (si es primera vez)
2. `app-deploy.yml`

### 4. Verificar

```powershell
.\scripts\health-check-complete.ps1 -BackendUrl "https://app-econeura-full-staging-backend.azurewebsites.net"
```

---

## 📚 DOCUMENTACIÓN COMPLETA

- **Checklist Pre-Deploy:** `docs/CHECKLIST-PRE-DEPLOY-FINAL.md`
- **Lista de Fallos:** `docs/LISTA-FALLOS-GITHUB-AZURE.md`
- **Troubleshooting:** `docs/TROUBLESHOOTING-GUIA-COMPLETA.md`
- **Soluciones Preventivas:** `docs/SOLUCIONES-PREVENTIVAS-COMPLETAS.md`

---

## 🔧 SCRIPTS DISPONIBLES

- `scripts/validate-all.ps1` - Validación completa
- `scripts/validate-pre-deploy.ps1` - Validación local
- `scripts/validate-azure-resources.ps1` - Validación Azure
- `scripts/health-check-complete.ps1` - Health check post-deploy
- `scripts/fix-common-issues.ps1` - Corrección automática

---

## 🚨 SI ALGO FALLA

1. **Ver logs:** `az webapp log tail --name APP_NAME --resource-group RG`
2. **Corregir:** `.\scripts\fix-common-issues.ps1 -FixAll`
3. **Consultar:** `docs/TROUBLESHOOTING-GUIA-COMPLETA.md`

---

**NO FALLARÁS si sigues estos pasos.**

