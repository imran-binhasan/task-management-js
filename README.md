# TaskFlow — Task Management System

Role-based task management with audit logging. Full stack: Next.js frontend, NestJS backend, PostgreSQL (TypeORM). Includes a root Docker Compose to run frontend, backend, and Postgres.

## Quick Start (Docker)

Requirements: Docker & Docker Compose

From repo root:

```bash
docker compose up --build
```

- Backend API: http://localhost:3000/api/v1
- Frontend: http://localhost:3001
- Swagger docs: http://localhost:3000/docs

## Demo credentials

- Admin: `admin@example.com` — Imran Bin Hasan — password: `admin123`
- User:  `user@example.com`  — Sara Rahman    — password: `user123`

> These credentials are for evaluation/demo only. Do not use in production.

## Local development

Backend (NestJS + TypeORM + Yarn):

```bash
cd task-management-backend
# install & build
yarn install
yarn build
# run in dev
yarn start:dev
```

Frontend (Next.js + npm):

```bash
cd task-management-frontend
npm ci
npm run dev
# Or build for production
npm run build
npm start
```

If you run frontend on a different host/port, set NEXT_PUBLIC_API_URL to point at the backend (e.g., `http://localhost:3000/api/v1`).

## Notes about auth & proxy

- JWTs are stored client-side (persisted via zustand). The frontend sends Authorization: Bearer <token> on API requests.
- For server-side route gating we use Next 16 `proxy.ts` (Node runtime). `middleware.ts` was removed as deprecated.
- API endpoints are protected by JWT-based AuthGuard and RolesGuard. Audit logs are recorded transactionally with before/after snapshots.

## Docker composition (high-level)

- Postgres service (postgres:16)
- Backend service (builds from task-management-backend; uses yarn)
- Frontend service (builds from task-management-frontend; uses npm)

Start with `docker compose up --build` and watch the backend logs for seeded user creation if database is empty.

## Running tests

Backend tests (unit & integration with jest):

```bash
cd task-management-backend
# run tests
yarn test
```

Frontend checks:

```bash
cd task-management-frontend
npm run lint
```

## API examples (curl)

Login (obtain token):

```bash
curl -s -X POST http://localhost:3000/api/v1/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}' | jq
```

Create task (authenticated):

```bash
TOKEN="<ACCESS_TOKEN>"
curl -s -X POST http://localhost:3000/api/v1/tasks -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Demo task","description":"Created during demo","assignedToId":2}' | jq
```

Get audit logs (admin only):

```bash
curl -H "Authorization: Bearer $TOKEN" "http://localhost:3000/api/v1/audit-logs?page=1&limit=20" | jq
```

## Deliverables checklist

- Source code: repository contains `task-management-backend/` and `task-management-frontend/` directories
- Docker Compose: `docker-compose.yml` at repo root to run all services
- Demo credentials: listed above
- Swagger documentation: available at `/docs` after backend runs
- Audit logs: accessible via `/api/v1/audit-logs` (admin)

## Demo video guidance

See the separate 5-minute demo script below for a suggested recording plan.
