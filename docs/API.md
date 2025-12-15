# ECONEURA SYSTEM API

**Base URL**: `https://api.econeura.com/api` (Production) | `http://localhost:3000/api` (Local)

## Authentication
All endpoints require `Authorization: Bearer <token>` header, except:
- `/auth/*`
- `/health/*`

## Standard Response Format
```json
{
  "success": true, // or false
  "data": { ... }, // if success
  "error": "Error Message", // if failure
  "code": "ERROR_CODE" // optional
}
```

## Modules

### Chat (Event Driven)
- `POST /chat/:neuraKey/execute-agent`
  - Body: `{ message: string }`
  - Response: `202 Accepted` (Processed asynchronously)

### CRM
- `GET /crm/leads` - List leads
- `GET /crm/stats` - Dashboard stats

### Automation
- `GET /agents` - List active agents

## Errors
- `401 Unauthorized`: Invalid Token
- `429 Too Many Requests`: Rate Limit Exceeded
- `400 Bad Request`: Validation Failed
