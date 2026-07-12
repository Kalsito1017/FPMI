# Contributing to FPMI Hub

Thanks for your interest in improving FPMI Hub! This document covers local
development setup, coding conventions, testing, and the pull-request
checklist.

## Local development setup

### 1. Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm** (bundled with Node.js)
- **Docker** and **Docker Compose**

### 2. Clone and start the database

```bash
git clone <repo-url>
cd ФПМИ
docker compose up -d
```

This starts a PostgreSQL 16 container (service name `db`) defined in
[`docker-compose.yml`](docker-compose.yml). The database runs on port
`5432` with user/password/database `fpmi`/`fpmi`/`fpmi`.

### 3. Backend

```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev
```

The API is served at `http://localhost:3000` with Swagger docs at
`http://localhost:3000/api`. See [`docs/api-contract.md`](docs/api-contract.md)
for the full endpoint contract.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` and is allowed by the
backend's CORS policy in development.

## Coding conventions

- **Indentation:** 2 spaces. Enforced by [`.editorconfig`](.editorconfig).
- **Line endings:** LF.
- **Comments:** Do **not** add comments to code unless explicitly requested.
  Let naming and structure document intent.
- **Commits:** Use [Conventional Commits](https://www.conventionalcommits.org/)
  style messages — e.g. `feat(courses): add category filter`,
  `fix(auth): handle expired token`, `docs: update api contract`.
- **Type safety:** No `any` without justification; keep types strict.
- **Shared contract:** Both frontend and backend MUST follow
  [`docs/api-contract.md`](docs/api-contract.md) exactly. If the contract
  changes, update both sides in the same PR.

## Running tests

Tests run without a live database or secrets — unit tests use mocks.

| Side     | Framework | Command      |
|----------|-----------|--------------|
| Backend  | Jest      | `npm test`   |
| Frontend| Vitest    | `npm test`   |

Run them from the respective `backend/` or `frontend/` directory.

## Pull-request checklist

Before opening a PR, ensure all of the following pass locally:

- [ ] `npm run lint` passes (both backend and frontend)
- [ ] `npm run build` passes (both backend and frontend)
- [ ] `npm test` passes (both backend and frontend)
- [ ] No new `any` types or lint suppressions without justification
- [ ] No comments added to code (unless required by the format)
- [ ] Commit messages follow Conventional Commits
- [ ] Docs updated if behaviour changed (e.g. `docs/api-contract.md`)

CI runs the same checks on every push and pull request — see
[`.github/workflows/ci.yml`](.github/workflows/ci.yml).

## Good first issues

New to the codebase? Look for issues labelled
[`good first issue`](https://github.com/FPMI-Hub/fpmi-hub/labels/good%20first%20issue).
These are scoped tasks that are great for getting familiar with the project
structure and contribution workflow.

## Reporting issues

Use the [issue templates](.github/ISSUE_TEMPLATE/) — bug reports and feature
requests each have a structured form. For conduct concerns, see
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
