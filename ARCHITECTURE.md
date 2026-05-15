# THEWAY Architecture

THEWAY is now a static HTML/CSS/JavaScript front end served by a production Express API. The backend keeps raw MySQL because the existing schema and Python scraper depend on it.

## Runtime

| Layer | Choice |
|---|---|
| Frontend | Static pages under `view/`, shared browser modules under `assets/js/` |
| API | Node.js, Express CommonJS |
| Database | MySQL with raw `mysql2/promise` queries |
| Auth | Database-backed `express-session` in secure HttpOnly cookies |
| Uploads | Local storage in development, S3-compatible storage in staging/production |
| AI | OpenAI-compatible chat completions adapter, fail-closed when not configured |
| Email | SMTP via Nodemailer with persisted outbound email records |
| Observability | Pino logs, request IDs, health endpoints, optional OpenTelemetry OTLP |

## Main Data Areas

| Area | Tables |
|---|---|
| Auth/session | `utilisateur`, `auth_sessions`, `auth_accounts`, `password_reset_tokens` |
| Roles | `roles`, `permissions`, `role_permissions`, `user_roles` |
| Domain | `competence`, `user_skill`, `objectif`, `opportunities`, `offre`, `saved_opportunity`, `application` |
| CV/AI | `file_asset`, `cv`, `cv_analysis`, `matching_run`, `matching_result` |
| Billing | `plan_catalogue`, `billing_subscription`, `billing_invoice`, `billing_payment`, `upgrade_request` |
| Operations | `outbound_email`, `webhook_event`, `rate_limit_bucket`, `audit_log`, `import_job` |

## Security Model

All authenticated browser mutations use a session cookie plus `X-CSRF-Token`. Admin access is enforced server-side through `user_roles` and permissions. Legacy JWT browser storage is no longer required by the UI.

## Deployment Flow

1. Build the image with `docker build -t theway-api .`.
2. Provide production environment variables from `API/.env.example`.
3. Run `npm run migrate`.
4. Run `npm run seed` for roles, permissions, plans, and optional bootstrap admin.
5. Start `npm start`.
6. Check `/health/live` and `/health/ready`.
