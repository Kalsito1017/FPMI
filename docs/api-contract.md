# FPMI Hub — API Contract (Phase 1)

Shared contract between `backend/` and `frontend/`. Both sides MUST implement
exactly these endpoints, request/response shapes, and status codes. The
backend exposes Swagger at `/api` documenting every endpoint below.

## Base URL

- Development: `http://localhost:3000`
- All routes are prefixed with `/` (no global API prefix; Swagger at `/api`)

## Authentication

- Scheme: Bearer JWT (`Authorization: Bearer <token>`)
- Token returned by `register` and `login`; persisted client-side.
- Endpoints marked `[JWT]` require a valid token.
- Endpoints marked `[ADMIN]` or `[MODERATOR]` require the token's user to have
  that role (use `RolesGuard` + `@Roles()`).

## Conventions

- All request/response bodies are JSON (`Content-Type: application/json`).
- Errors: `{ statusCode, message, error }` (NestJS default). `404` for unknown
  resource; `401` for missing/invalid token; `403` for insufficient role;
  `400` for validation failure (Zod/class-validator).
- Slugs: `Course.slug` is unique and used in GET paths; `:id` is the numeric
  DB id for admin mutations.
- Timestamps: ISO 8601 strings.

## Data models

```ts
type Role = "STUDENT" | "MODERATOR" | "ADMIN";

interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar?: string | null;
  createdAt: string; // ISO 8601
}

type CourseCategory =
  | "Programming"
  | "Mathematics"
  | "Data Analytics"
  | "AI"
  | "Databases"
  | "Networks"
  | "Cybersecurity";

interface Course {
  id: number;
  title: string;
  slug: string;            // unique
  description?: string | null;
  semester?: number | null; // 1..8
  credits?: number | null;
  category: CourseCategory;
}

interface Professor {
  id: number;
  name: string;
  email?: string | null;
  office?: string | null;
  bio?: string | null;
  photo?: string | null;
}
```

## Endpoints

### Auth

| Method | Path              | Auth     | Body / Query                      | Response 200                          |
|--------|-------------------|----------|-----------------------------------|----------------------------------------|
| POST   | `/auth/register`  | none     | `{ name, email, password }`       | `{ user: User, token: string }`        |
| POST   | `/auth/login`     | none     | `{ email, password }`             | `{ user: User, token: string }`        |
| GET    | `/auth/me`        | `[JWT]`  | —                                 | `{ user: User }`                       |

- `register`: password min length 8. Returns role `STUDENT`. 409 if email
  already exists.
- `login`: 401 if credentials invalid.

### Users (admin only)

| Method | Path                | Auth      | Body                  | Response 200            |
|--------|---------------------|-----------|-----------------------|--------------------------|
| GET    | `/users`            | `[ADMIN]` | —                     | `User[]`                 |
| PATCH  | `/users/:id/role`   | `[ADMIN]` | `{ role: Role }`      | `User`                   |

### Courses

| Method   | Path            | Auth      | Body / Query                          | Response 200 / 204                  |
|----------|-----------------|-----------|---------------------------------------|--------------------------------------|
| GET      | `/courses`      | none      | `?page=1&limit=20&category=<CourseCategory>` (all opt.) | `{ data: Course[], meta: { total, page, limit, totalPages } }` |
| GET      | `/courses/:slug`| none      | —                                     | `Course` (404 if not found)          |
| POST     | `/courses`      | `[ADMIN]` | `Course` (without `id`)               | `Course` (201)                       |
| PATCH    | `/courses/:id`  | `[ADMIN]` | Partial `Course` (without `id`/`slug`)| `Course`                             |
| DELETE   | `/courses/:id`  | `[ADMIN]` | —                                     | 204 no content                       |

- `POST`/`PATCH` must reject duplicate `slug` (409). `title` required, non-empty.
- `category` must be one of the 7 enum values (400 otherwise).

### Professors

| Method   | Path               | Auth      | Body                              | Response 200 / 204             |
|----------|--------------------|-----------|-----------------------------------|-------------------------------|
| GET      | `/professors`      | none      | —                                 | `Professor[]`                 |
| GET      | `/professors/:id`  | none      | —                                 | `Professor` (404 if not found) |
| POST     | `/professors`      | `[ADMIN]` | `Professor` (without `id`)       | `Professor` (201)             |
| PATCH    | `/professors/:id`  | `[ADMIN]` | Partial `Professor`               | `Professor`                   |
| DELETE   | `/professors/:id`  | `[ADMIN]` | —                                 | 204 no content                |

- `name` required, non-empty. `email` (if provided) should be a valid email.

## Seed data (backend `prisma/seed.ts`)

- 1 admin: `admin@fpmi.bg` / `admin123` (role `ADMIN`)
- 1 student: `student@fpmi.bg` / `student123` (role `STUDENT`)
- 7+ courses spread across the 7 categories with sensible Bulgarian-academic
  titles (e.g. "Увод в програмирането", "Дискретни структури", "Анализ на данни").
- 2 professors.

## CORS

- Backend allows `http://localhost:5173` (Vite dev origin) in development.
