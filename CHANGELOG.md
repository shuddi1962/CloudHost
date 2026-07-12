# Changelog

## Phase 0 — Auth & Security Hardening

- **Auth consolidation**: Removed the dual Supabase + bcrypt/JWT auth system. The API server (`apps/api`) is now the single source of truth for authentication using bcrypt + JWT + Drizzle. Supabase auth routes in `apps/dashboard/app/api/auth/` proxy to the real API.
- **Cookie-based tokens**: Auth tokens are now set as httpOnly, SameSite=Lax cookies by the API server's `/api/auth/login` and `/api/auth/register` endpoints. The dashboard API middleware reads tokens from cookies or Authorization header. Pages no longer need to manage tokens via `localStorage` (though legacy `localStorage` reads still work for backward compatibility).
- **JWT_SECRET enforcement**: The API server now refuses to start if `JWT_SECRET` is not set (removed the fallback).
- **Credential encryption**: All sensitive credential data (`packages/db/schema/credentials.ts`) is now encrypted at rest using AES-256-GCM. `ENCRYPTION_KEY` (64 hex chars) is required. Decryption only happens for authorized owners on explicit GET by ID.
- **Required new env vars**: `ENCRYPTION_KEY`, `ANTHROPIC_API_KEY`. Removed `SUPABASE_JWT_SECRET` (no longer needed).

## Phase 1 — Workflow Engine (n8n Clone)

- All node handlers in `services/workflow/src/index.ts` are now real implementations:
  - `http-request`: Uses `fetch()` with configurable method, headers, and body
  - `email`: Sends real email via Nodemailer using `SMTP_HOST`/`SMTP_PORT`/`SMTP_USER`/`SMTP_PASS`
  - `database`: Executes queries via Drizzle ORM on the main database
  - `slack`/`discord`/`telegram`: Real webhook POST to configured URLs/tokens
  - `code`: Runs user JavaScript in Node.js `vm` sandbox with timeout
  - `condition`/`loop`/`wait`/`transform`: Real control-flow logic operating on workflow data
  - `ai`: Calls Anthropic API (`ANT HROPIC_API_KEY`) for LLM responses
- Webhook activation now registers real HTTP endpoints on the workflow service (port 4001) that trigger workflow execution on inbound requests
- Schedule triggers use `node-cron` for real cron-based scheduling
- **Required new env vars**: `WORKFLOW_PORT` (default 4001)
- **New dependencies**: `hono`, `@hono/node-server`, `nodemailer`, `node-cron`

## Phase 2 — Real Compute Provisioning

- **DigitalOcean integration**: `provisionInstance` in `apps/dashboard/lib/provisioning-engine.ts` creates real DO Droplets via the API, polls for status and IP, and stores provider-managed state in the database.
- **Database provisioning**: `provisionDatabase` now supports Neon API (`NEON_API_KEY`) for creating real Postgres databases in addition to the simulated fallback.
- **Docker deployments**: The `/api/docker/deploy` endpoint in `apps/api/src/routes/docker-deployments.ts` now creates a real DO Droplet with Docker pre-installed via cloud-init, pulls the container image, and registers DNS via Cloudflare API.
- **Required new env vars**: `DIGITALOCEAN_API_TOKEN`, `NEON_API_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`, `CLOUDFLARE_ACCOUNT_ID`

## Phase 2.5 — Deploy from Upload

- The `/api/deployments/upload` endpoint now processes uploaded `.zip` files: saves to temp directory, extracts with `extract-zip`, runs `BuildRunner.detectFramework()` against extracted files, and auto-provisions a database if it detects WordPress (`wp-config.php`), Laravel (`.env`), or PHP config files.
- Database credentials are auto-injected into `wp-config.php` (DB_NAME/DB_USER/DB_PASSWORD/DB_HOST), Laravel `.env` (DB_* variables), and generic PHP config files (`$db_*` conventions).
- **New dependencies**: `extract-zip` (in `services/deployment`)

## Phase 3 — Cloudflare Integration

- Cloudflare Workers routes now call the real CF Workers for Platforms API (`/accounts/:id/workers/scripts/:name`) on deploy, in addition to writing to the local mirror DB.
- Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to be set.

## Phase 4 — AWS / GCP

- No route handler changes needed. The existing AWS/GCP UI pages in the dashboard are illustrative-only placeholders for future implementation.
