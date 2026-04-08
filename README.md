# Task Management System

## Overview

- Role-based access control (Admin/User)
- Task assignment and management
- Audit logging with before/after snapshots
- Modular, clean codebase (NestJS backend, Next.js frontend)
- One-command deployment with Docker Compose

## Total Time Taken

**Estimated total time:** 3.5 to 4 hours

- Backend & frontend initialization: ~20 min
- Schema design & code review: ~30 min
- AI-assisted CRUD, audit log, API docs, test files: ~1.2 hours
- Frontend layout, UI, API integration: ~1.3 hour
- Dockerization & optimization: ~10 min
- Manual testing & review: ~30 min

If fully AI-generated, could be done in 30–40 min, but 30% of the code was written/reviewed manually for quality.

## Tech Stack

### Backend
- **NestJS** (TypeScript, modular architecture)
- **TypeORM** (PostgreSQL)
- **Swagger** (API documentation)
- **Jest** (unit & integration testing)
- **Docker** (containerization)

### Frontend
- **Next.js 16** (React framework)
- **TanStack Query** (data fetching)
- **Zustand** (state management)
- **Tailwind CSS** (styling)

## Features

- **Role-based access control** (Admin/User)
- **Server-side route protection** (Next.js proxy)
- **Audit logging** (with before/after snapshots, ACID transaction)
- **Swagger API docs** (`/docs` endpoint)
- **Test files** (Jest)
- **Modular, clean code structure**
- **Quick-fill demo buttons** for easy testing
- **Docker Compose** for one-command setup

## Out-of-Scope/Extra

- Full audit log with before/after state
- Transactional audit logging for reliability
- Server-side route gating (not just client-side)
- Clean modular code for easy extension

## Demo Credentials

Use these credentials to log in as Admin or User:

**Admin:**
- Name: Imran Bin Hasan
- Email: admin@example.com
- Password: admin123

**User:**
- Name: Sara Rahman
- Email: user@example.com
- Password: user123

## Major AI Prompts Used

AI was used to accelerate development for basic, repetitive tasks:

- **CRUD generation:**
	- Prompt: "NestJS CRUD endpoints and services for Task and AuditLog entities with ACID support."
	- Reason: CRUD logic is boilerplate and well-suited for AI generation.
- **Test scripts:**
	- Prompt: "Generate Jest test files for the Task and AuditLog modules."
	- Reason: To quickly scaffold tests for coverage.
- **API documentation:**
	- Prompt: "Add Swagger decorators to all controllers and DTOs."
	- Reason: To ensure comprehensive API docs with minimal manual effort.

All AI-generated code was reviewed and ~30% was written or refactored manually for quality, reliability, and alignment with requirements.

## Running the Project

1. Clone the repository
2. Run:
	 ```sh
	 docker compose up --build
	 ```
3. Access the frontend at http://localhost:3001 and backend API docs at http://localhost:3000/docs

## Summary

- Role-based access enforced at both API and UI layers
- Full audit logging with before/after snapshots in a single transaction
- Clean modular NestJS backend, Next.js frontend with server-side route gating
- One-command Docker Compose setup

