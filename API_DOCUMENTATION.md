# THEWAY API Documentation

All JSON responses use:

```json
{ "ok": true, "data": {}, "requestId": "uuid" }
```

Errors use:

```json
{ "ok": false, "error": { "code": "error_code", "message": "Message" }, "requestId": "uuid" }
```

## Core Routes

| Method | Path | Purpose | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register and create session | Public |
| `POST` | `/api/auth/login` | Login and create session | Public |
| `POST` | `/api/auth/logout` | Destroy session | Session |
| `GET` | `/api/auth/session` | Current user and CSRF token | Public |
| `POST` | `/api/auth/password-reset/request` | Send reset email | Public, rate-limited |
| `POST` | `/api/auth/password-reset/confirm` | Complete reset | Public, rate-limited |
| `GET` | `/api/auth/oauth/:provider/start` | Start Google/LinkedIn OIDC | Public |
| `GET` | `/api/opportunities` | Search opportunities | Public |
| `POST` | `/api/opportunities/:id/bookmark` | Save opportunity | Owner |
| `POST` | `/api/opportunities/:id/applications` | Apply to opportunity | Owner |
| `POST` | `/api/cv` | Upload CV | Owner |
| `POST` | `/api/cv/:id/analyse` | LLM CV analysis | Owner, rate-limited |
| `POST` | `/api/matching/run` | LLM matching run | Owner, idempotency key |
| `GET` | `/api/admin/roles` | Role/permission inventory | Admin |
| `GET` | `/api/docs/openapi.json` | OpenAPI summary | Public |

## CSRF

Fetch `/api/auth/session`, then send the returned `csrfToken` as `X-CSRF-Token` on authenticated `POST`, `PUT`, and `DELETE` requests.
