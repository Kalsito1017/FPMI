# FPMI Hub — API Contract (Phase 2)

Shared contract between `backend/` and `frontend/`. Both sides MUST implement
exactly these endpoints, request/response shapes, and status codes. The
backend exposes Swagger at `/api` documenting every endpoint below.

Phase 2 adds: wiki pages (create/view, published only), previous exams,
resources, and multi-type search. The professors feature has been removed.

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

### Wiki pages

Course-scoped. Students create pages; they are published immediately (no
moderation queue yet — that is Phase 3). Edit/delete is allowed for the author
or a `MODERATOR`/`ADMIN` (403 otherwise).

```ts
type WikiPageStatus = "DRAFT" | "PUBLISHED";

interface WikiPageListItem {
  id: number;
  slug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  createdBy: { id: number; name: string; avatar?: string | null };
}

interface WikiPage extends WikiPageListItem {
  courseId: number;
  content: string; // markdown
  status: WikiPageStatus;
  course: { id: number; slug: string; title: string };
}
```

| Method   | Path                                | Auth     | Body                                   | Response                          |
|----------|-------------------------------------|----------|----------------------------------------|-----------------------------------|
| GET      | `/courses/:courseSlug/wiki`         | none     | —                                      | `WikiPageListItem[]` (published only, ordered by title) |
| GET      | `/courses/:courseSlug/wiki/:pageSlug` | none   | —                                      | `WikiPage` (404 if missing or not published) |
| POST     | `/courses/:courseSlug/wiki`         | `[JWT]`  | `{ title, content, slug? }`            | `WikiPage` (201; 409 on duplicate slug; slug auto-generated from title when omitted) |
| PATCH    | `/wiki/:id`                         | author/`[MODERATOR]`/`[ADMIN]` | `{ title?, content? }` | `WikiPage`                        |
| DELETE   | `/wiki/:id`                         | author/`[MODERATOR]`/`[ADMIN]` | —                  | 204 no content                    |

- `slug`: lowercase letters, numbers, hyphens (`/^[a-z0-9-]+$/`). Unique per course.
- `title` 1..200 chars; `content` 1..100000 chars (markdown).

### Resources

```ts
type ResourceType = "LINK" | "VIDEO" | "DOCUMENT" | "BOOK" | "OTHER";

interface Resource {
  id: number;
  courseId: number;
  title: string;
  type: ResourceType;
  url: string;
  createdById: number;
  createdBy: { id: number; name: string; avatar?: string | null };
  createdAt: string;
}
```

| Method   | Path                            | Auth     | Body                              | Response              |
|----------|---------------------------------|----------|-----------------------------------|-----------------------|
| GET      | `/courses/:courseSlug/resources`| none     | —                                 | `Resource[]` (newest first) |
| POST     | `/courses/:courseSlug/resources`| `[JWT]`  | `{ title, url, type? }`           | `Resource` (201; type defaults to `LINK`) |
| PATCH    | `/resources/:id`                | author/`[MODERATOR]`/`[ADMIN]` | `{ title?, type?, url? }` | `Resource` |
| DELETE   | `/resources/:id`                | author/`[MODERATOR]`/`[ADMIN]` | —                | 204 no content        |

- `url` must be a valid http(s) URL. `title` 1..200 chars.

### Previous exams

```ts
interface Exam {
  id: number;
  courseId: number;
  title: string;
  year: number;
  semester?: number | null; // 1 | 2
  pdfUrl: string;
  createdById: number;
  createdBy: { id: number; name: string; avatar?: string | null };
  createdAt: string;
}
```

| Method   | Path                        | Auth     | Body                                       | Response        |
|----------|-----------------------------|----------|--------------------------------------------|-----------------|
| GET      | `/courses/:courseSlug/exams`| none     | —                                          | `Exam[]` (year desc) |
| POST     | `/courses/:courseSlug/exams`| `[JWT]`  | `{ title, year, pdfUrl, semester? }`       | `Exam` (201)    |
| PATCH    | `/exams/:id`                | author/`[MODERATOR]`/`[ADMIN]` | `{ title?, year?, semester?, pdfUrl? }` | `Exam` |
| DELETE   | `/exams/:id`                | author/`[MODERATOR]`/`[ADMIN]` | —                         | 204 no content  |

- `year` 1990..currentYear+1. `semester` optional, 1 or 2. `pdfUrl` valid http(s) URL.

### Search

| Method | Path       | Auth | Query                     | Response         |
|--------|------------|------|---------------------------|------------------|
| GET    | `/search`  | none | `q` (required, ≤100), `limit` (opt, 1..20, default 5) | `SearchResponse` |

```ts
interface SearchResponse {
  query: string;
  results: {
    courses: { id: number; title: string; slug: string; category: string; description?: string | null }[];
    wikiPages: { id: number; title: string; slug: string; course: { slug: string; title: string } }[];
    resources: { id: number; title: string; type: ResourceType; url: string; course: { slug: string; title: string } }[];
    exams: { id: number; title: string; year: number; pdfUrl: string; course: { slug: string; title: string } }[];
  };
}
```

- Case-insensitive substring match (courses: title/description/category;
  wiki pages: title, published only; resources: title; exams: title).
- Blank/whitespace `q` returns empty groups without querying.

## Seed data (backend `prisma/seed.ts`)

- 1 admin: `admin@fpmi.bg` / `admin123` (role `ADMIN`)
- 1 student: `student@fpmi.bg` / `student123` (role `STUDENT`)
- 7+ courses spread across the 7 categories with sensible Bulgarian-academic
  titles (e.g. "Увод в програмирането", "Дискретни структури", "Анализ на данни").
- Sample wiki pages, resources and exams attached to a few courses
  (Информатика I, Математически анализ I, ООП).

## CORS

- Backend allows `http://localhost:5173` (Vite dev origin) in development.
