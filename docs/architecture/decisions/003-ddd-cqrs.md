# ADR 003: Domain-Driven Design + CQRS Backend

**Status**: Approved  
**Fecha**: 2025-11-25  
**Decisión por**: Equipo Backend

---

## Context

Backend de ECONEURA tiene lógica de negocio compleja (11 NEURAS, CRM, automatizaciones). Necesitamos arquitectura que separe claramente responsabilidades.

## Decision

Adoptar **Domain-Driven Design (DDD)** + **CQRS (Command Query Responsibility Segregation)**.

### Estructura:

\\\
src/
├── domain/              # Domain models
│   ├── entities/        # User, Lead, Conversation
│   ├── value-objects/   # Email, PhoneNumber
│   └── aggregates/      # Complex business objects
├── application/
│   ├── commands/        # Write operations
│   │   ├── CreateLead/
│   │   └── SendMessage/
│   └── queries/         # Read operations
│       ├── GetLeads/
│       └── GetConversations/
├── infrastructure/      # External concerns
│   ├── database/
│   ├── cache/
│   └── ai/             # Gemini integration
└── presentation/        # API routes
\\\

## Consequences

### Positivo ✅

- **Separation of Concerns**: Domain puro, sin dependencias externas
- **Testabilidad**: Domain logic testable sin DB
- **Escalabilidad**: Commands y Queries pueden escalar independientemente
- **Performance**: Queries optimizadas sin afectar writes
- **Claridad**: Intenciones explícitas (CreateX vs GetX)

### Negativo ⚠️

- Más código boilerplate
- Curva de aprendizaje DDD

## Alternatives Considered

1. **MVC simple**: Rechazado (no es escalable para complejidad de 11 NEURAS)
2. **Microservicios**: Rechazado (overkill para MVP)
3. **Event Sourcing + CQRS**: Considerado para V2

---

**Decisión final**: DDD+CQRS perfecto para ECONEURA.
