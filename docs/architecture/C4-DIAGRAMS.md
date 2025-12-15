# 🏗️ ECONEURA - C4 Architecture Diagrams

**Fecha**: 2025-11-25  
**Versión**: 1.0

---

## 📊 Context Diagram (Nivel 1)

Sistema en contexto con usuarios y sistemas externos.

\\\mermaid
C4Context
  title Context - ECONEURA SaaS Platform
  
  Person(user, "Usuario Empresarial", "Gestiona CRM y usa 11 NEURAS")
  Person(admin, "Administrador", "Configura plataforma")
  
  System(econeura, "ECONEURA SaaS", "Plataforma multi-tenant con IA")
  
  System_Ext(gemini, "Google Gemini 2.0", "LLM para NEURAS")
  System_Ext(make, "Make.com", "Automatizaciones")
  System_Ext(gcp, "Google Cloud", "Infraestructura")
  
  Rel(user, econeura, "Usa", "HTTPS")
  Rel(admin, econeura, "Administra", "HTTPS")
  Rel(econeura, gemini, "Consulta IA", "API")
  Rel(econeura, make, "Triggers workflows", "Webhooks")
  Rel(econeura, gcp, "Hosted on", "")
\\\

---

## 📦 Container Diagram (Nivel 2)

Componentes principales de la aplicación.

\\\mermaid
C4Container
  title Containers - ECONEURA Architecture
  
  Person(user, "Usuario")
  
  Container(spa, "Frontend SPA", "React 19 + Vite", "Interfaz usuario con 11 NEURAS")
  Container(api, "Backend API", "Node.js 20 + Express", "API REST + WebSockets")
  
  ContainerDb(postgres, "Database", "PostgreSQL 16", "Datos CRM + historial")
  ContainerDb(redis, "Cache", "Redis 7", "Sesiones + caché")
  ContainerDb(storage, "Cloud Storage", "GBS", "Archivos + uploads")
  
  Container(monitoring, "Monitoring", "Cloud Monitoring", "Logs + métricas")
  
  System_Ext(gemini, "Gemini AI")
  
  Rel(user, spa, "Usa", "HTTPS")
  Rel(spa, api, "API calls", "HTTPS/WSS")
  Rel(api, postgres, "Queries", "TCP/5432")
  Rel(api, redis, "Cache", "TCP/6379")
  Rel(api, storage, "Upload/Download", "HTTPS")
  Rel(api, gemini, "LLM requests", "HTTPS")
  Rel(api, monitoring, "Telemetry", "HTTPS")
  Rel(spa, monitoring, "Client logs", "HTTPS")
\\\

---

## ⚙️ Component Diagram (Nivel 3)

Módulos internos del Backend.

\\\mermaid
C4Component
  title Components - Backend API
  
  Container_Boundary(api, "Backend API") {
    Component(auth, "Auth Module", "Autenticación JWT")
    Component(neura, "NEURA Engine", "11 NEURAS especializadas")
    Component(chat, "Chat Service", "WebSocket chat + streaming")
    Component(crm, "CRM Module", "Gestión contactos/leads")
    Component(automation, "Automation", "Make.com integration")
  }
  
  ContainerDb(db, "PostgreSQL")
  ContainerDb(cache, "Redis")
  System_Ext(gemini, "Gemini AI")
  
  Rel(auth, db, "Users + sessions")
  Rel(neura, gemini, "AI calls")
  Rel(chat, cache, "Session state")
  Rel(chat, neura, "Process messages")
  Rel(crm, db, "CRM data")
  Rel(automation, neura, "Trigger NEURAS")
\\\

---

## 📝 Notas

### Principios Arquitecturales

1. **Separation of Concerns**: Frontend SPA separado de Backend API
2. **Stateless API**: Estado en Redis, no en memoria API
3. **Domain-Driven Design**: Backend organizado en módulos de dominio
4. **CQRS**: Commands y Queries separados
5. **Feature-Sliced Design**: Frontend organizado por features (Login, Cockpit, Chat, etc.)

### Tecnologías Clave

- **Frontend**: React 19, Vite 7, Tailwind CSS v4
- **Backend**: Node.js 20, Express, DDD+CQRS
- **Database**: PostgreSQL 16 (High Availability)
- **Cache**: Redis 7 (Premium tier)
- **AI**: Google Gemini 2.0 Flash
- **Infrastructure**: Google Cloud (Terraform)
- **Monitoring**: Application Insights + Log Analytics

### Seguridad

- ✅ Managed Identities (CERO connection strings)
- ✅ Key Vault para secretos
- ✅ Private Endpoints
- ✅ HTTPS only + TLS 1.2+
- ✅ Network Security Groups

---

**Última actualización**: 2025-11-25 16:15:04
