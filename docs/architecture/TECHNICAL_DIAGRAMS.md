# 🔧 ECONEURA - Technical Diagrams

**Fecha**: 2025-11-25

---

## 🔐 Authentication Flow

Flujo completo de autenticación con JWT.

\\\mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend SPA
    participant A as Backend API
    participant D as PostgreSQL
    participant R as Redis
    
    U->>F: Ingresa email/password
    F->>A: POST /api/auth/login
    A->>D: Valida credenciales
    D-->>A: User encontrado
    A->>A: Genera JWT (access + refresh)
    A->>R: Guarda refresh token
    A-->>F: {accessToken, refreshToken, user}
    F->>F: Almacena en localStorage
    F-->>U: Redirect a /cockpit
    
    Note over F,A: Requests subsecuentes
    F->>A: GET /api/... (Header: Bearer token)
    A->>A: Valida JWT
    A-->>F: Datos
\\\

---

## 💬 Chat Flow (NEURA Streaming)

Flujo de chat con IA usando WebSockets y streaming.

\\\mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant N as NEURA Engine
    participant G as Gemini AI
    
    U->>F: Escribe mensaje
    F->>B: WebSocket: send message
    B->>N: Process(message)
    N->>G: streamGenerateContent()
    
    loop Streaming chunks
        G-->>N: Chunk de respuesta
        N-->>B: Process chunk
        B-->>F: WebSocket: chunk
        F-->>U: Muestra chunk en UI
    end
    
    G-->>N: Stream completo
    N->>B: Save to DB
    B->>B: PostgreSQL: INSERT INTO conversations
    B-->>F: WebSocket: complete
    F-->>U: Mensaje final mostrado
\\\

---

## 🚀 Deployment Pipeline (CI/CD)

Pipeline completo de GitHub Actions a Google Cloud.

\\\mermaid
graph TB
    A[Git Push main] --> B{GitHub Actions}
    
    B --> C[Job: Validate]
    C --> C1[npm ci]
    C1 --> C2[type-check]
    C2 --> C3[lint]
    C3 --> C4[build]
    C4 --> C5[audit]
    
    C5 --> D{All passed?}
    D -->| No| Z[❌ Fail]
    D -->|Yes| E[Job: Deploy Infra]
    
    E --> E1[Google Auth]
    E1 --> E2[Deploy Bicep]
    E2 --> E3[Wait for resources]
    
    E3 --> F[Job: Deploy Frontend]
    E3 --> G[Job: Deploy Backend]
    
    F --> F1[Build React]
    F1 --> F2[Deploy to Static Web App]
    
    G --> G1[Build Node.js]
    G1 --> G2[Deploy to App Service]
    
    F2 --> H[Health Checks]
    G2 --> H
    
    H --> I{Healthy?}
    I -->|Yes| J[✅ Success]
    I -->| No| K[❌ Rollback]
\\\

---

## 🗄️ Data Flow (Write Operation)

Ejemplo: Crear un nuevo Lead en CRM.

\\\mermaid
sequenceDiagram
    participant F as Frontend
    participant A as API
    participant C as Command Handler
    participant D as Domain
    participant DB as PostgreSQL
    participant R as Redis
    
    F->>A: POST /api/leads
    A->>C: CreateLeadCommand
    C->>D: Lead.create(data)
    D->>D: Validate business rules
    D->>DB: INSERT INTO leads
    DB-->>D: Lead saved
    D-->>C: Lead entity
    C->>R: Invalidate cache
    C-->>A: {leadId, ...}
    A-->>F: 201 Created
\\\

---

## 🔄 Google Cloud Infrastructure
The infrastructure uses Cloud Run, Cloud SQL, and Firebase Hosting.


Orden de despliegue de recursos Bicep.

\\\mermaid
graph TD
    A[main.bicep] --> B[1. Managed Identity]
    B --> C[2. Virtual Network]
    B --> D[3. Key Vault]
    
    C --> E[4. PostgreSQL]
    C --> F[5. Redis]
    
    B --> G[6. Storage Account]
    
    H[7. Monitoring]
    
    E --> I[8. App Service]
    F --> I
    D --> I
    G --> I
    H --> I
    
    style B fill:#90EE90
    style I fill:#FFB6C1
\\\

---

## 📊 Monitoring & Observability

Stack de monitoreo.

\\\mermaid
graph LR
    A[Frontend] -->|Client logs| M[App Insights]
    B[Backend] -->|Server logs| M
    B -->|Metrics| M
    B -->|Traces| M
    
    C[PostgreSQL] -->|Query stats| M
    D[Redis] -->|Performance| M
    
    M -->|Aggregation| L[Log Analytics]
    L -->|Dashboards| P[Google Cloud Console]
    L -->|Alerts| N[Notifications]
\\\

---

## 📝 Notas Técnicas

### Tecnologías de Streaming

- **Frontend**: Server-Sent Events (SSE) o WebSockets
- **Backend**: Stream de Gemini AI → transformación → cliente
- **Protocolo**: WebSocket bidireccional para chat en tiempo real

### Performance

- **Cache Strategy**: Redis para sesiones + resultados NEURA recientes
- **DB Connection Pooling**: pg-pool con max 20 conexiones
- **Static Assets**: CDN via Static Web App
- **API Rate Limiting**: 100 req/min por usuario

### Seguridad

- **Authentication**: JWT con refresh tokens
- **Authorization**: RBAC (Role-Based Access Control)
- **Input Validation**: Joi schemas en todos los endpoints
- **Output Sanitization**: XSS prevention

---

**Última actualización**: 2025-11-25 16:16:06
