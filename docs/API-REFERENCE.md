## Referencia de API ECONEURA-FULL (backend)

### Convenciones generales

- Todas las respuestas siguen el contrato:

```json
{
  "success": true,
  "data": { ... }
}
```

o, en caso de error:

```json
{
  "success": false,
  "error": "mensaje descriptivo"
}
```

- Los errores de validación de entrada se responden con `400 Bad Request`.
- Los errores internos se responden con `500 Internal Server Error`.

---

### `GET /health`

- **Descripción**: endpoint de healthcheck.
- **Respuesta 200**:

```json
{
  "status": "ok"
}
```

---

### Conversación NEURA

#### `POST /api/conversations`

- **Descripción**: crea una nueva conversación asociada a una NEURA y opcionalmente a un usuario.
- **Body**:

```json
{
  "neuraId": "neura-ceo",
  "tenantId": "tenant-1",
  "userId": "user-123"
}
```

- **Respuesta 201**:

```json
{
  "success": true,
  "conversation": {
    "id": "uuid",
    "neuraId": "neura-ceo",
    "userId": "user-123",
    "createdAt": "2025-11-16T12:00:00.000Z",
    "updatedAt": "2025-11-16T12:00:00.000Z"
  }
}
```

#### `POST /api/conversations/:id/messages`

- **Descripción**: añade un mensaje a una conversación existente.
- **Body**:

```json
{
  "role": "user",
  "content": "mensaje del usuario"
}
```

- **Respuesta 201**:

```json
{
  "success": true,
  "message": {
    "id": "uuid",
    "conversationId": "uuid",
    "role": "user",
    "content": "mensaje del usuario",
    "createdAt": "2025-11-16T12:01:00.000Z"
  }
}
```

#### `GET /api/conversations/:id/messages`

- **Descripción**: devuelve el historial de mensajes de una conversación.
- **Respuesta 200**:

```json
{
  "success": true,
  "messages": [
    {
      "id": "uuid",
      "conversationId": "uuid",
      "role": "user",
      "content": "hola",
      "createdAt": "2025-11-16T12:01:00.000Z"
    }
  ]
}
```

---

### Chat NEURA (LLM)

#### `POST /api/neuras/:neuraId/chat`

- **Descripción**: envía un mensaje a una NEURA y obtiene la respuesta del LLM, creando conversación si no existe.
- **Params**:
  - `neuraId`: `neura-ceo`, `neura-cto`, etc.
- **Body**:

```json
{
  "conversationId": "uuid-opcional",
  "message": "texto del usuario",
  "tenantId": "tenant-1",
  "userId": "user-123",
  "correlationId": "corr-abc"
}
```

- **Respuesta 200**:

```json
{
  "success": true,
  "conversationId": "uuid",
  "userMessage": "texto del usuario",
  "neuraReply": "respuesta generada por el LLM"
}
```

---

### Ejecución de agentes Automation

#### `POST /api/chat/:neuraKey/execute-agent`

- **Descripción**: ejecuta un agente de automatización (Make/n8n) asociado a una NEURA, detectado desde el contexto de chat.
- **Params**:
  - `neuraKey`: clave corta (`ceo`, `cfo`, `cto`, etc.).
- **Body**:

```json
{
  "message": "ejecuta Agenda Consejo",
  "neuraId": "neura-ceo",
  "userId": "user-123",
  "correlationId": "corr-xyz"
}
```

- **Respuesta 200** (ejecución exitosa, mock o real):

```json
{
  "success": true,
  "message": "texto formateado para mostrar en el cockpit"
}
```

- **Respuesta 400/500**:

```json
{
  "success": false,
  "error": "detalle del error"
}
```


