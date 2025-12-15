# ADR 001: Feature-Sliced Design para Frontend

**Status**: Approved  
**Fecha**: 2025-11-25  
**Decisión por**: Equipo Arquitectura

---

## Context

El frontend de ECONEURA tiene múltiples funcionalidades complejas (Login, Cockpit, Chat, CRM) que necesitan ser organizadas de manera escalable y mantenible.

## Decision

Adoptar **Feature-Sliced Design (FSD)** como arquitectura frontend.

### Estructura:

\\\
src/
├── app/          # Setup, providers, routing
├── pages/        # Pages/routes
├── widgets/      # Complex ui blocks
├── features/     # User scenarios
│   ├── auth/     # Login, logout
│   ├── chat/     # Chat con NEURAS
│   ├── cockpit/  # Dashboard principal
│   └── crm/      # CRM module
├── entities/     # Business entities
├── shared/       # Shared code
└── widgets/      # Composite blocks
\\\

## Consequences

### Positivo ✅

- **Modularidad**: Cada feature independiente
- **Escalabilidad**: Fácil agregar nuevas features
- **Mantenibilidad**: Código organizado por dominio
- **Reutilización**: Shared entities y widgets
- **Testabilidad**: Features aisladas testables

### Negativo ⚠️

- Curva de aprendizaje inicial
- Más estructura = más archivos

## Alternatives Considered

1. **Single component folder**: Rechazado por no escalar
2. **Atomic Design**: Rechazado por ser muy granular
3. **Domain-driven folders**: Parcialmente usado en entities

---

**Decisión final**: FSD es óptimo para ECONEURA.
