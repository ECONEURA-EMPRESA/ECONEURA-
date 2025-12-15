# 🚀 GUÍA RÁPIDA: APLICAR MEJORAS WORKFLOWS A 10/10

## ⚡ COMANDO RÁPIDO

```powershell
# Ejecutar script (modo normal)
.\scripts\apply-workflows-10-10.ps1

# Modo dry-run (solo simula, no hace cambios)
.\scripts\apply-workflows-10-10.ps1 -DryRun

# Saltar validaciones (solo si estás seguro)
.\scripts\apply-workflows-10-10.ps1 -SkipValidation -SkipTesting
```

## 📋 QUÉ HACE EL SCRIPT

1. ✅ **Valida prerequisitos** (git, node, npm, workflows)
2. ✅ **Hace backup** de workflows existentes
3. ✅ **Aplica TODAS las mejoras** automáticamente:
   - Backend CI: lint requerido, coverage requerido, artifacts
   - Frontend CI: lint requerido, tests requeridos, bundle size limits
   - App Deploy: environments, rollback, notificaciones
   - Infra Deploy: what-if, validación Bicep, outputs
   - Release: actualizar action, validación versión
4. ✅ **Valida sintaxis YAML** de todos los workflows
5. ✅ **Genera reporte** de cambios

## ⚠️ ANTES DE EJECUTAR

1. **Asegúrate de estar en el directorio raíz del proyecto**
2. **Haz commit de cambios pendientes** (el script no hace commit automático)
3. **Verifica que tienes permisos** para modificar `.github/workflows/`

## 🔄 DESPUÉS DE EJECUTAR

1. **Revisa los cambios:**
   ```powershell
   git diff .github/workflows/
   ```

2. **Si todo está bien, haz commit:**
   ```powershell
   git add .github/workflows/
   git commit -m "feat: improve workflows to 10/10"
   git push
   ```

3. **Si algo salió mal, restaura backup:**
   ```powershell
   Copy-Item .github/workflows.backup/* .github/workflows/ -Force
   ```

## 📊 LOGS

El script genera un log en: `workflows-improvements.log`

## ❓ TROUBLESHOOTING

**Error: "No se encontró package.json"**
- Asegúrate de estar en el directorio raíz del proyecto

**Error: "Git no está disponible"**
- Instala Git o agrega a PATH

**Error: "Workflows con errores"**
- Revisa el log para ver qué workflow tiene problemas
- Restaura backup si es necesario

## 🎯 RESULTADO ESPERADO

Después de ejecutar el script:
- ✅ Todos los workflows mejorados
- ✅ Backup en `.github/workflows.backup/`
- ✅ Log en `workflows-improvements.log`
- ✅ Workflows validados y listos para commit

---

**Tiempo estimado:** 2-3 minutos  
**Riesgo:** Bajo (hay backup automático)

