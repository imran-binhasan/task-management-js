 Task Management Backend (NestJS + PostgreSQL)

Backend for a role-based Task Management System with audit logging.

## Features

- JWT authentication (no registration flow)
- Predefined users auto-seeded at startup
- Role-based access control
  - `ADMIN`: create, update, delete, assign tasks, view audit logs
  - `USER`: view assigned tasks, update task status
- Task management with required fields and timestamps
- Audit log entries for important task actions
  - Task creation, update, deletion
  - Status changes
  - Assignment changes
- Swagger API documentation
- Dockerized setup with PostgreSQL

## Tech Stack

- NestJS 11
- TypeORM 0.3
- PostgreSQL
- class-validator / class-transformer
- Swagger (`@nestjs/swagger`)

## Architecture

- `AuthModule`
  - login and current user (`/auth/login`, `/auth/me`)
- `UserModule`
  - user listing for assignment workflows (`/users`)
- `TaskModule`
  - task CRUD and role-aware update behavior (`/tasks`)
- `AuditModule`
  - admin audit log viewing with filters (`/audit-logs`)
- `DatabaseSeedModule`
  - ensures predefined `ADMIN` and `USER` accounts exist on startup

## Data Model

### `users`
- `id`, `name`, `email (unique)`, `password (hashed)`, `role`, timestamps, soft delete
- Index: `role`

### `tasks`
- `id`, `title`, `description`, `status (PENDING | PROCESSING | DONE)`
- `assigned_to_id`, `created_by_id`, timestamps, soft delete
- Indexes:
  - `assigned_to_id`
  - `status`
  - `created_at`
  - composite: `assigned_to_id + status + created_at`

### `audit_logs`
- `id`, `actor_id`, `actor_name`, `action`, `task_id`, `before (jsonb)`, `after (jsonb)`, `summary`, `created_at`
- Indexes:
  - `task_id + created_at`
  - `actor_id + created_at`
  - `action + created_at`

## Audit Logging Behavior

Task write operations use a transaction so task changes and audit entries are committed together.

- `TASK_CREATED`
- `TASK_UPDATED` (task content changes)
- `TASK_DELETED`
- `STATUS_CHANGED`
- `TASK_ASSIGNED` (assignment changed, including unassign)

Each entry includes:
- actor (`actorId`, `actorName`)
- action type (`action`)
- target entity (`taskId`)
- relevant data (`before`, `after`, `summary`)

## API Base URL

- Base: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/docs`

## Main Endpoints

- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`
- `GET /api/v1/users` (admin)
- `GET /api/v1/users/:id` (admin)
- `GET /api/v1/tasks`
- `GET /api/v1/tasks/:id`
- `POST /api/v1/tasks` (admin)
- `PATCH /api/v1/tasks/:id`
- `DELETE /api/v1/tasks/:id` (admin)
- `GET /api/v1/audit-logs` (admin)

Audit log filters on `GET /api/v1/audit-logs`:
- `taskId`
- `actorId`
- `action`
- `page`
- `limit`

## Local Run

### 1) Install

```bash
npm install
```

### 2) Configure environment

```bash
cp .env.example .env
```

### 3) Start

```bash
npm run start:dev
```

The app auto-seeds default users at startup if they do not exist.

## Docker Run

From this backend directory:

```bash
docker compose up --build
```

Services:
- API: `http://localhost:3000`
- PostgreSQL: `localhost:5432`

## Demo Credentials

- Bootstrap users are created automatically (if missing):
  - `admin@example.com` (`ADMIN`)
  - `user@example.com` (`USER`)
- Passwords are generated randomly on first creation and written to application logs once.
- User identity fields are not read from environment variables.

## Validation and Build

```bash
npm run build
npm run lint
```

## AI Usage Notes

Major AI assistance areas in this backend:
- Reviewing architecture against explicit requirements and evaluation criteria
- Improving module boundaries and RBAC wiring
- Hardening audit logging semantics and transaction integrity
- Upgrading Swagger and runtime validation clarity
- Preparing Docker and README deliverables

Why AI was used:
- To speed up structured gap analysis and implementation sequencing while preserving clean, explainable architecture decisions.
