# THEWAY

THEWAY is an intelligent skills matching platform. This repository now runs as a production-style static frontend served by a Node.js/Express API with raw MySQL persistence, HttpOnly session authentication, role-based authorisation, CV upload, LLM-backed CV/matching workflows, manual admin billing, tests, Docker, and CI.

## Stack

| Area | Technology |
|---|---|
| Frontend | Static HTML/CSS/JavaScript in `view/` and `assets/js/` |
| Backend | Express CommonJS in `API/` |
| Database | MySQL via `mysql2/promise` |
| Auth | DB-backed `express-session`, Argon2id passwords, CSRF |
| Uploads | Local development storage or S3-compatible production storage |
| AI | OpenAI-compatible LLM provider configured by environment |
| Tests | Jest, Supertest, Playwright |

## Local Setup

```bash
npm install
cd API
npm install
cp .env.example .env
```

Start MySQL, then run:

```bash
npm run migrate
npm run seed
npm start
```

Open:

```text
http://localhost:3001
```

Local seed creates `admin@theway.local` with password `ChangeMe12345!` only when `NODE_ENV` is not `production` and no bootstrap admin env vars are provided.

## Docker

```bash
docker compose up --build
```

The compose stack starts MySQL, runs migrations and seeds, then serves the app on `http://localhost:3001`.

## Important Environment Variables

See `API/.env.example` for the complete list.

| Variable | Purpose | Client Safe |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | MySQL connection | No |
| `COOKIE_SECRET`, `CSRF_SECRET` | Session and CSRF secrets | No |
| `CORS_ORIGIN`, `APP_BASE_URL`, `CLIENT_BASE_URL` | Browser/API URLs | Origins only |
| `AI_PROVIDER`, `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL` | LLM CV and matching provider | No |
| `SMTP_HOST`, `SMTP_USER`, `SMTP_PASSWORD`, `MAIL_FROM` | Transactional email | No |
| `STORAGE_DRIVER`, `S3_*`, `LOCAL_UPLOAD_DIR` | Upload storage | No |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | Trace export | No |

## Useful Commands

```bash
npm run migrate
npm run seed
npm run lint
npm run typecheck
npm test
npm run build
```

## Health Checks

```text
/health/live
/health/ready
```

`/health/ready` verifies MySQL connectivity.

## Documentation

- Architecture: `ARCHITECTURE.md`
- API: `API_DOCUMENTATION.md`
- OpenAPI summary: `/api/docs/openapi.json`
