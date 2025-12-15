# 🏠 Guía de Desarrollo Local (ECONEURA)

Esta guía te ayudará a levantar el entorno local de ECONEURA con las **5 mejoras** implementadas.

## 🚀 Inicio Rápido (Automatizado)

Hemos creado un script que hace todo por ti (instalar dependencias, levantar Docker, migrar BD, sembrar datos).

```powershell
./scripts/setup-local.ps1
```

Una vez termine, inicia la aplicación:

```powershell
npm run dev
```

*   **Frontend**: [http://localhost:5173](http://localhost:5173) (Verás el badge "⚡ LOCAL DEV MODE")
*   **Backend**: [http://localhost:3000](http://localhost:3000)

## 🛠️ Mejoras Implementadas

1.  **Script de Setup Automático**: `scripts/setup-local.ps1`
2.  **Seed de Datos**: `packages/backend/scripts/seed-local.ts` (Crea usuario admin y agentes)
3.  **Indicador Visual**: Badge "LOCAL DEV MODE" en el Frontend.
4.  **Corrección de Dependencias**: Se instaló `pg` (driver de Postgres) que faltaba.
5.  **Documentación Local**: Este archivo.

## 🔧 Configuración Manual (Si falla el script)

1.  **Docker**: Asegúrate de que Docker Desktop esté corriendo.
    ```bash
    docker compose up -d
    ```
2.  **Base de Datos**:
    ```bash
    npx turbo run db:migrate
    npx tsx packages/backend/scripts/seed-local.ts
    ```
3.  **Variables de Entorno**:
    Asegúrate de tener `.env` en `packages/backend` y `packages/frontend`.

## 🐛 Troubleshooting

*   **Error "Cannot find module 'pg'"**: Ejecuta `npm install pg` en `packages/backend`.
*   **Error de Puertos**: Asegúrate de que los puertos 5432 (Postgres) y 6379 (Redis) estén libres.
