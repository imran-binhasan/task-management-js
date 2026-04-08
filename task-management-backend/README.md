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

## Frontend Integration Guide

This section describes the request/response shapes the frontend should expect.

### Auth

- Obtain a token by calling `POST /api/v1/auth/login`.
- Send the token on every protected request:

```http
Authorization: Bearer <accessToken>
```

### Standard Success Envelope

Every successful response is wrapped by the global response interceptor:

```json
{
  "data": {},
  "status": "success",
  "meta": {
    "timestamp": "2026-04-08T10:20:30.000Z",
    "requestId": "k8z3q1xv"
  }
}
```

### Pagination Envelope

List endpoints return `data` as an array and include pagination meta:

```json
{
  "data": [],
  "status": "success",
  "meta": {
    "timestamp": "2026-04-08T10:20:30.000Z",
    "requestId": "k8z3q1xv",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8
    }
  }
}
```

### Error Envelope

All errors are normalized by the global exception filter:

```json
{
  "data": null,
  "status": "error",
  "message": "Validation failed",
  "errorCode": "BAD_REQUEST",
  "errors": {
    "title": ["must be longer than or equal to 3 characters"]
  },
  "meta": {
    "timestamp": "2026-04-08T10:20:30.000Z",
    "path": "/api/v1/tasks",
    "method": "POST"
  }
}
```

### Roles and Enums

- Roles: `ADMIN`, `USER`
- Task status: `PENDING`, `PROCESSING`, `DONE`
- Audit actions: `TASK_CREATED`, `TASK_UPDATED`, `TASK_DELETED`, `STATUS_CHANGED`, `TASK_ASSIGNED`

### Resource Shapes

User (password never returned):

```json
{
  "id": 1,
  "name": "Admin User",
  "email": "admin@example.com",
  "role": "ADMIN",
  "createdAt": "2026-04-08T10:20:30.000Z",
  "updatedAt": "2026-04-08T10:20:30.000Z",
  "deletedAt": null
}
```

Task (includes relations when fetched):

```json
{
  "id": 10,
  "title": "Prepare monthly report",
  "description": "Compile sales numbers and draft executive summary.",
  "status": "PENDING",
  "assignedToId": 2,
  "createdById": 1,
  "assignedTo": { "id": 2, "name": "User", "email": "user@example.com", "role": "USER", "createdAt": "...", "updatedAt": "...", "deletedAt": null },
  "createdBy": { "id": 1, "name": "Admin", "email": "admin@example.com", "role": "ADMIN", "createdAt": "...", "updatedAt": "...", "deletedAt": null },
  "createdAt": "2026-04-08T10:20:30.000Z",
  "updatedAt": "2026-04-08T10:20:30.000Z",
  "deletedAt": null
}
```

Audit log:

```json
{
  "id": 99,
  "actorId": 1,
  "actorName": "Admin User",
  "action": "TASK_UPDATED",
  "taskId": 10,
  "before": { "status": "PENDING" },
  "after": { "status": "PROCESSING" },
  "summary": "Status changed: PENDING -> PROCESSING",
  "actor": { "id": 1, "name": "Admin User", "email": "admin@example.com", "role": "ADMIN", "createdAt": "...", "updatedAt": "...", "deletedAt": null },
  "createdAt": "2026-04-08T10:20:30.000Z"
}
```

### Endpoints

#### Auth

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

Response `data`:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "ADMIN"
  }
}
```

`GET /api/v1/auth/me` (auth required)

Response `data`: user object

#### Users (admin only)

`GET /api/v1/users?page=1&limit=20`

Response `data`: array of users (paginated)

`GET /api/v1/users/:id`

Response `data`: user object

#### Tasks

`GET /api/v1/tasks?page=1&limit=20`

- Admin: all tasks
- User: only tasks assigned to the user

Response `data`: array of tasks (paginated)

`GET /api/v1/tasks/:id`

- Admin: any task
- User: only if assigned

Response `data`: task object

`POST /api/v1/tasks` (admin only)

Request:

```json
{
  "title": "Prepare monthly report",
  "description": "Compile sales numbers and draft executive summary.",
  "assignedToId": 2
}
```

Notes:
- `assignedToId` must be a USER id or omitted/null.

Response `data`: created task

`PATCH /api/v1/tasks/:id`

- Admin: can update `title`, `description`, `status`, `assignedToId`
- User: can update only `status` on their assigned tasks

Example (user updating status):

```json
{
  "status": "PROCESSING"
}
```

Response `data`: updated task

`DELETE /api/v1/tasks/:id` (admin only)

- Soft delete; returns HTTP 204 No Content.

#### Audit Logs (admin only)

`GET /api/v1/audit-logs?taskId=1&actorId=2&action=STATUS_CHANGED&page=1&limit=20`

Response `data`: array of audit logs (paginated)

### CORS Notes

Allowed origins include localhost dev ports and `FRONTEND_URL` if provided in env.

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
  - `admin@example.com` (`ADMIN`) — Imran Bin Hasan — password: `admin123`
  - `user@example.com` (`USER`) — Sara Rahman — password: `user123`
- These demo credentials are fixed for the evaluation; do not use in production.

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
