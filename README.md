# Etemad Rana operations platform

Etemad Rana is an open-source, Persian right-to-left operations system for inventory movement, production, management reporting, and security-controlled dispatch. Three role-specific React applications use one versioned Express API and one PostgreSQL source of truth.

## Features

- Management analytics and PostgreSQL-backed inventory, production, and request reports.
- QR-based warehouse entry, exit, relocation, gathering, and production workflows.
- Security gate review, dispatch verification, and transport/driver registration.
- Role-based JSON Web Token (JWT) authentication for administrators, operators, and security staff.
- Transactional inventory movement history, validated request bodies, structured logs, readiness checks, and rate-limited login.
- Shared RTL design tokens, Persian typography, animated Base UI menus/selects, and deduplicated Sonner notifications.
- Idempotent migrations and a high-volume development dataset for realistic dashboards and tables.

## Architecture

```text
apps/admin ────────┐
apps/handheld ─────┼── HTTPS /api/v1 ── services/api ── PostgreSQL
apps/security ─────┘                         │
                                            └── inventory movement audit log
```

The API is stateless: every protected request carries a signed JWT. This allows multiple API instances to run behind a load balancer. PostgreSQL is the transaction boundary, so related inventory, order, transport, and audit writes commit together or roll back together.

## Repository layout

| Path | Responsibility |
| --- | --- |
| `apps/admin` | Management dashboard, requests, and reports |
| `apps/handheld` | Touch-oriented warehouse and production workflows |
| `apps/security` | Gate requests, dispatch, and QR verification |
| `services/api` | Express API, authentication, validation, and business transactions |
| `services/api/migrations` | PostgreSQL schema and idempotent development seeds |
| `packages/design-system` | Shared theme, Persian web fonts, and brand assets |
| `docs` | API, database, and deployment references |

The npm workspace uses one root `package-lock.json`; install and run commands from the repository root. Deployable applications remain independent, while shared visual assets have one owner.

## Requirements

- Node.js 20 or newer and npm 10 or newer.
- PostgreSQL 15 or newer, or Docker with Docker Compose.
- HTTPS in non-local environments that use device cameras.

## Quick start with an existing PostgreSQL database

1. Install every workspace from the locked dependency graph:

   ```bash
   npm ci
   ```

2. Copy `services/api/.env.example` to `services/api/.env`. For a local database named `Rana`, set a connection URL in this form and substitute your own password:

   ```dotenv
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/Rana
   JWT_SECRET=replace-with-a-random-secret-of-at-least-32-characters
   ```

3. Apply the schema and load development data:

   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. Start the API and each client in separate terminals:

   ```bash
   npm run dev:api
   npm run dev:admin
   npm run dev:handheld
   npm run dev:security
   ```

The default local addresses are API `http://localhost:5000`, management `http://localhost:5173`, handheld `http://localhost:5175`, and security `http://localhost:5176`. Each client reads `VITE_API_URL` from its own optional `.env` file and defaults to `http://localhost:5000/api/v1`.

`npm ci` is preferable to `npm install` in CI because it fails when the manifest and lockfile disagree. Migrations are recorded in `schema_migrations`; never edit an applied migration—add the next numbered file instead. The seed command is blocked when `NODE_ENV=production`.

## Development accounts

The development seed creates these accounts with the temporary password `ChangeMe123!`:

| Username | Role | Application |
| --- | --- | --- |
| `admin` | Administrator | Management |
| `operator` | Warehouse operator | Handheld |
| `security` | Security operator | Security |

These credentials are intentionally public development fixtures. Never run the seed in production, and create production users with unique passwords through an approved administrative workflow.

## Docker alternative

For an isolated local PostgreSQL instance and API:

```bash
cp .env.example .env
docker compose up --build
docker compose exec api npm run migrate
docker compose exec api npm run seed
```

Set a strong `POSTGRES_PASSWORD` and `JWT_SECRET` in the root `.env` first. `docker compose down` preserves the named database volume; `docker compose down -v` permanently removes it.

## Root commands

| Command | Purpose |
| --- | --- |
| `npm run dev:api` | Start the API with automatic restart |
| `npm run dev:admin` | Start management on port 5173 |
| `npm run dev:handheld` | Start handheld operations on port 5175 |
| `npm run dev:security` | Start security operations on port 5176 |
| `npm run db:migrate` | Apply pending PostgreSQL migrations once |
| `npm run db:seed` | Load idempotent development identities and mock data |
| `npm test` | Run workspace tests where present |
| `npm run lint` | Run frontend static analysis |
| `npm run build` | Build all deployable frontend workspaces |
| `npm run check` | Run API syntax, tests, lint, and all production builds |

## API and data model

Application routes use `/api/v1`. Protected routes accept `Authorization: Bearer <token>`. Successful responses use `{ "success": true, "data": ... }`; client-safe failures use `{ "success": false, "error": "..." }` with an appropriate HTTP status.

The schema normalizes users, workplaces, material inventory, production plans, orders, requests, transports, and immutable inventory movements. Compatibility aliases preserve established client response fields while PostgreSQL uses consistent internal names. See the [API reference](docs/api.md) and [database design](docs/database.md).

The service also exposes `GET /health` for process liveness and `GET /ready` for database-backed readiness. Load balancers should use `/ready` so traffic is not sent to an API instance that cannot reach PostgreSQL.

## Configuration

| Variable | Required in production | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection URL used only by the API |
| `DATABASE_SSL` | Usually | Enables verified TLS for managed PostgreSQL |
| `JWT_SECRET` | Yes | At least 32 random characters for signing tokens |
| `JWT_EXPIRES_IN` | No | Token lifetime; defaults to `8h` |
| `CORS_ORIGINS` | Yes | Comma-separated trusted browser origins |
| `PORT` | No | API port; defaults to `5000` |
| `LOG_LEVEL` | No | Structured server logging level |
| `VITE_API_URL` | Client build | Public API base URL ending in `/api/v1` |

Browsers must never receive database credentials. Give the API a least-privilege PostgreSQL role and inject secrets through the deployment platform rather than committing them.

## Security and operations

- Terminate TLS at a reverse proxy, ingress, or cloud load balancer. The API image does not contain certificate files.
- A private key existed in the repository history before this release. Deleting the working-tree file is insufficient; rotate/revoke it and purge it from history with a reviewed history-rewrite procedure.
- Passwords use adaptive bcrypt hashing. CORS is allow-listed, request bodies are bounded, login is rate-limited, and logs redact authorization/password fields.
- Role authorization is enforced by the API; hiding a client navigation item is not a security boundary.
- Browser tokens currently remain in `localStorage` for compatibility. A stronger future design is a `Secure`, `HttpOnly`, `SameSite` cookie with CSRF protection.
- Apply migrations through one controlled release job. Multiple API replicas should not race to alter the schema.

See the [deployment runbook](docs/deployment.md) and [security policy](SECURITY.md) before operating the project outside development.

## Testing and release checks

Run the complete local gate:

```bash
npm run check
npm audit --omit=dev --audit-level=high
```

API tests are deterministic and mock external boundaries. Frontend compilation and linting currently provide the primary UI gates; contributors should add route-level tests when changing scanner, authorization, or transactional workflows. Define load targets before production and validate them with k6 or Locust against staging data.

## Contributing

Issues and focused pull requests are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) for setup, commit, migration, and review expectations. Please report vulnerabilities privately according to [SECURITY.md](SECURITY.md), not through public issues.

## License

The original source code is licensed under the [GNU Affero General Public License v3.0 or later](LICENSE). If you distribute a modified version—or let users interact with a modified version over a network—the AGPL generally requires offering the corresponding source under the same license. The license does not require publication of a purely private fork that is neither conveyed nor provided as a modified network service.

Copyright (C) 2026 Etemad Rana contributors. Bundled fonts and other third-party assets remain subject to their own included notices; see [NOTICE.md](NOTICE.md). This summary is informational, not legal advice.

## Learning notes

- The workspace split follows a common monorepo pattern: `apps` are deployable clients, `services` are independently operated backends, and `packages` contain shared implementation.
- PostgreSQL's write-ahead log (WAL) records changes before data pages are updated. Backups plus WAL archiving enable point-in-time recovery.
- Server-Sent Events (SSE) suit one-way live feeds; WebSockets suit frequent two-way messaging. The current request/response workflows need neither, which keeps deployment and failure handling simpler.
- Mature systems keep services stateless behind load balancers, use backward-compatible expand/migrate/contract schema changes, and ship immutable artifacts with a tested rollback path.
