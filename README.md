# FPMI Hub

A student-editable course and wiki platform for the Faculty of Applied
Mathematics and Informatics (FPMI) at the Technical University of Sofia.
FPMI Hub lets students browse courses and professors, while staff and
moderators curate the catalogue through a simple admin interface.

## Tech stack

| Layer    | Technology                          |
|----------|------------------------------------|
| Frontend | React + TypeScript + Vite          |
| Backend  | NestJS + Prisma ORM                 |
| Database | PostgreSQL 16                       |
| Testing  | Vitest (frontend) / Jest (backend)  |
| Tooling  | npm, Docker Compose, GitHub Actions |

The shared API contract between frontend and backend lives in
[`docs/api-contract.md`](docs/api-contract.md).

## Prerequisites

- **Node.js 20+** (LTS recommended)
- **npm** (bundled with Node.js)
- **Docker** and **Docker Compose** (for the local PostgreSQL database)

## Quick local setup

```bash
# 1. Clone the repository
git clone <repo-url>
cd ФПМИ

# 2. Start the PostgreSQL database
docker compose up -d

# 3. Start the backend (http://localhost:3000)
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# 4. Start the frontend (http://localhost:5173) in a new terminal
cd frontend
npm install
npm run dev
```

Seed accounts (from `backend/prisma/seed.ts`):

- Admin: `admin@fpmi.bg` / `admin123`
- Student: `student@fpmi.bg` / `student123`

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) for
local development setup, coding conventions, and the pull-request checklist,
and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community expectations.

## License

Released under the [MIT License](LICENSE) — Copyright (c) 2026 FPMI Hub
Contributors.
