# FPMI Hub -- Project Plan & Architecture

## Vision

A student-driven, **collaboratively editable** platform for the Faculty of
Applied Mathematics and Informatics (FPMI) at the Technical University of
Sofia -- modeled loosely on `fmi.wikidot.com` (the existing FMI lecture-notes
wiki), but with a modern UI/UX, structured moderation, and a proper app
architecture instead of raw Wikidot markup.

The core idea carried over from the wiki: **course content is a living
document that students write and improve themselves**, not just a folder of
files uploaded by admins. What's new versus a plain wiki: real accounts,
a review/approval step before edits go live, per-course course structure
(catalog, professors, exams) around the wiki pages, and a modern reading
experience.

### Goals

-   Course catalog
-   Wiki-style lecture notes & course pages, freely editable by students
-   Revision history & moderation (edits are reviewed before publishing)
-   Previous exams
-   Assignments
-   Resources
-   Professor profiles
-   Reviews
-   Per-course discussion forums (with per-page "Discuss" threads)
-   Student dashboards
-   Search
-   Announcements
-   Fully open-source codebase (MIT) -- anyone can fork, self-host, or
    contribute code, not just content
-   Support/contact system so students can reach admins & moderators with
    suggestions, feature requests, bug reports, or spam reports

------------------------------------------------------------------------

# Tech Stack

## Frontend

-   React
-   TypeScript
-   Vite
-   React Router
-   TanStack Query
-   Zustand
-   Tailwind CSS
-   shadcn/ui
-   React Hook Form
-   Zod
-   Axios
-   **@uiw/react-md-editor** -- Markdown editor with live preview (page
    editing)
-   **react-markdown** + **remark-gfm** + **rehype-highlight** -- rendering
    published wiki pages (tables, code blocks, syntax highlighting)
-   **diff** (jsdiff) -- computing diffs between revisions for the
    moderator review screen

## Backend

-   NestJS
-   TypeScript
-   Prisma ORM
-   PostgreSQL
-   JWT Authentication
-   bcrypt
-   Swagger
-   **Resend** -- transactional email API (ticket notifications, moderation
    updates)

## Database

-   PostgreSQL
-   Prisma ORM

## Storage

-   Cloudinary or Supabase Storage

## Deployment

-   Frontend: Vercel
-   Backend: Railway or Render
-   Database: Neon PostgreSQL or Supabase PostgreSQL

------------------------------------------------------------------------

# Architecture

``` text
React
   │
TanStack Query
   │
REST API
   │
NestJS  ──  wiki module (pages + revisions)
   │    ──  forum module (categories + threads + posts)
   │
Prisma ORM
   │
PostgreSQL
```

------------------------------------------------------------------------

# Main Pages

## Home

-   Hero
-   Latest announcements
-   Search
-   Popular courses
-   Recent wiki edits (activity feed)

## Courses

-   Programming
-   Mathematics
-   Data Analytics
-   AI
-   Databases
-   Networks
-   Cybersecurity

## Course Page

-   Description
-   Wiki pages (lectures, exercises, topics -- tree/list view)
-   Assignments
-   Resources
-   Previous exams
-   Course discussion forum

## Wiki Page (view)

-   Rendered markdown content
-   "Edit" button (opens Page Editor)
-   Revision history link
-   "Discuss" link → dedicated forum thread for this page

## Page Editor

-   Markdown editor with live preview
-   Edit summary field ("what did you change and why")
-   Submits a **pending revision** (does not publish immediately)

## Revision History / Diff View

-   List of past revisions with author, timestamp, status
-   Side-by-side or inline diff between any two revisions
-   Rollback to a previous approved revision (moderator/admin)

## Professors

-   Profile
-   Office
-   Courses
-   Reviews

## Communities (Forum)

-   Global community forum for all registered users
-   Posts with text and optional image URL
-   Like/unlike posts
-   Nested comments (top-level + replies)
-   Create post (signed-in users only)
-   Browse and read (public, no login required)

## Course Forum

## Student Dashboard

-   Saved courses
-   My submitted edits (pending / approved / rejected)
-   My support tickets (status of submitted suggestions/bugs/reports)
-   Bookmarks
-   Profile

## Contact / Support

-   Form: type (suggestion, feature request, bug report, spam report,
    other), subject, message
-   Inline "Report" action on wiki pages, forum posts, and reviews --
    pre-fills type = spam report with a link to the offending content
-   Registered users only (signed-in identity, no anonymous submissions)
-   "My tickets" view showing status of past submissions

## Admin / Moderator Panel

-   Users
-   Courses
-   Professors
-   Resources
-   Announcements
-   Reviews
-   **Pending revisions queue** (approve / reject with diff view)
-   **Forum moderation** (pin, lock, delete threads/posts)
-   **Support tickets queue** (filter by type/status, assign, resolve,
    reply)

------------------------------------------------------------------------

# Moderation Workflow (edit approval)

1.  Student opens a wiki page, hits **Edit**, writes in the Markdown editor,
    submits with an edit summary.
2.  This creates a `PageRevision` with `status = pending`. The live
    `WikiPage.content` is untouched.
3.  A moderator sees it in the **pending revisions queue**, reviews a diff
    against the current live version.
4.  **Approve** → `WikiPage.content` is updated to the new revision's
    content, revision `status = approved`, student notified.
    **Reject** → revision `status = rejected`, optional reason, student
    notified.
5.  New pages (not just edits) follow the same flow: the page exists in a
    `draft`/unpublished state until its first revision is approved.

This keeps the "anyone can contribute" spirit of a wiki while avoiding
unreviewed content going live directly, which was the main tradeoff to
solve versus plain Wikidot.

------------------------------------------------------------------------

# Support Ticket Workflow

1.  A signed-in student submits a ticket from the **Contact / Support**
    page, or hits **Report** on a specific wiki page / forum post / review
    (which pre-fills `type = spam_report` and `targetType`/`targetId`).
2.  Backend creates a `SupportTicket` (`status = open`) and sends an email
    via **Resend** to the admin/moderator notification address with the
    ticket type, subject, and a link into the admin panel.
3.  A moderator or admin triages it in the **support tickets queue**:
    reassign, change `status` (`in_progress` / `resolved` / `closed`),
    and optionally reply.
4.  On `resolved`/`closed`, the submitting student gets a notification
    (in-app, and optionally an email reply) so they know it was seen.
5.  Only registered users can submit tickets -- this keeps the
    `userId` on every ticket for accountability and avoids needing a
    CAPTCHA for anonymous submissions.

------------------------------------------------------------------------

# Database Schema

## User

-   id
-   name
-   email
-   passwordHash
-   role (`GUEST` \| `STUDENT` \| `TEACHER` \| `MODERATOR` \| `ADMIN`)
-   avatar
-   createdAt

## Course

-   id
-   title
-   slug
-   description
-   semester
-   credits

## Professor

-   id
-   name
-   email
-   office
-   bio
-   photo

## WikiPage

-   id
-   courseId
-   slug
-   title
-   content *(markdown, currently live/approved version)*
-   status (`draft` \| `published`)
-   createdById
-   createdAt
-   updatedAt

## PageRevision

-   id
-   pageId
-   authorId
-   content *(markdown snapshot)*
-   summary *(edit description)*
-   status (`pending` \| `approved` \| `rejected`)
-   reviewedById
-   reviewedAt
-   reviewNote
-   createdAt

## ForumCategory

-   id
-   courseId
-   name
-   slug

## ForumThread

-   id
-   categoryId
-   pageId *(nullable -- set when auto-created from a wiki page's "Discuss"
    link)*
-   title
-   authorId
-   createdAt

## ForumPost

-   id
-   threadId
-   authorId
-   body
-   createdAt

## Resource

-   id
-   title
-   type
-   url
-   courseId

## Exam

-   id
-   courseId
-   year
-   difficulty
-   pdfUrl

## Review

-   id
-   rating
-   comment
-   userId
-   professorId

## CommunityPost

-   id
-   title
-   content
-   imageUrl *(nullable)*
-   authorId
-   createdAt
-   updatedAt

## CommunityComment

-   id
-   content
-   postId *(FK -> CommunityPost.id, cascade delete)*
-   parentCommentId *(nullable, self-ref for replies)*
-   authorId
-   createdAt
-   updatedAt

## CommunityLike

-   id
-   postId *(FK -> CommunityPost.id, cascade delete)*
-   userId
-   createdAt
-   *unique(postId, userId)*

## Announcement

-   id
-   title
-   body
-   createdAt

## SupportTicket

-   id
-   userId *(required -- registered users only)*
-   type (`suggestion` \| `feature_request` \| `bug_report` \|
    `spam_report` \| `other`)
-   subject
-   message
-   targetType *(nullable -- e.g. `WikiPage`, `ForumPost`, `Review`, set
    when reported via an inline "Report" button)*
-   targetId *(nullable)*
-   status (`open` \| `in_progress` \| `resolved` \| `closed`)
-   assignedToId *(nullable, moderator/admin)*
-   createdAt
-   resolvedAt

------------------------------------------------------------------------

# Folder Structure

``` text
/                     (repo root)
├── .github/
│   ├── workflows/    # CI: lint, typecheck, test, build
│   ├── ISSUE_TEMPLATE/
│   └── PULL_REQUEST_TEMPLATE.md
├── frontend/
├── backend/
├── docs/
├── docker-compose.yml   # local Postgres for contributors
├── LICENSE              # MIT
├── README.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

``` text
frontend/
└── src/
    ├── api/
    ├── assets/
    ├── components/
    │   ├── MarkdownEditor/
    │   └── DiffViewer/
    ├── features/
    │   ├── wiki/
    │   ├── forum/
    │   └── support/
    ├── hooks/
    ├── layouts/
    ├── pages/
    ├── routes/
    ├── store/
    ├── types/
    └── utils/

backend/
└── src/
    ├── auth/
    ├── users/
    ├── courses/
    ├── professors/
    ├── wiki/            # WikiPage + PageRevision, approval workflow
    ├── forum/           # ForumCategory + ForumThread + ForumPost
    ├── support/         # SupportTicket + Resend email notifications
    ├── exams/
    ├── resources/
    ├── reviews/
    ├── announcements/
    └── prisma/
```

------------------------------------------------------------------------

# User Roles

## Guest

-   Browse content
-   Read wiki pages, forum threads, and community posts

## Student

-   All Guest permissions
-   Create new wiki pages (pending approval)
-   Edit existing wiki pages (pending approval)
-   Post in course/page forums
-   Post in Communities forum
-   Like and comment on community posts
-   Bookmark resources
-   Review professors
-   Submit support tickets (suggestions, feature requests, bug reports,
    spam reports)

## Teacher

-   All Student permissions
-   (Future: create and manage course content directly)

## Moderator

-   All Teacher permissions
-   Approve / reject page revisions
-   Roll back pages to a previous revision
-   Moderate forum threads/posts
-   Moderate community posts/comments
-   Moderate reviews
-   Triage & resolve support tickets

## Administrator

-   Full system access
-   Manage courses, professors, users, roles
-   Manage support-ticket assignment & email notification settings

------------------------------------------------------------------------

# Open Source & Contribution Model

**License:** MIT, root `LICENSE` file. Anyone can fork, self-host, or
build on the code, commercially or not, with attribution.

There are **two separate contribution surfaces**, for two different
audiences:

| | Who | Where | Flow |
|---|---|---|---|
| **Code contributions** | Developers | GitHub (fork → branch → PR) | PR → CI (lint/typecheck/test/build) → code review → merge |
| **Content contributions** | Any student | In-app (Page Editor) | Edit → pending `PageRevision` → moderator approval (see Moderation Workflow above) |

Content edits are **not** GitHub PRs -- a student writing lecture notes
shouldn't need to know Git. Code changes stay on GitHub where the usual
open-source review process applies.

## Repo essentials

-   `README.md` -- what the project is, screenshots, quick local setup
-   `CONTRIBUTING.md` -- local dev setup (incl. `docker-compose.yml` for a
    local Postgres), coding conventions, how to run tests, PR checklist,
    "good first issue" pointer
-   `CODE_OF_CONDUCT.md`
-   `.github/ISSUE_TEMPLATE/` -- separate templates for bug reports vs
    feature requests (mirrors the in-app ticket types)
-   `.github/workflows/` -- CI on every PR: ESLint, `tsc --noEmit`, tests
    (Jest for backend, Vitest for frontend), build
-   `.env.example` in both `frontend/` and `backend/` so contributors can
    get running without guessing required variables

## A note on content licensing

MIT covers the *code*. It's worth separately deciding a license for the
*user-submitted wiki content* (lecture notes, course pages) -- these are
different kinds of works. A common choice for community wikis is
**CC BY-SA** (which is what the original `fmi.wikidot.com` uses, shown at
the bottom of its pages), so contributed notes stay freely reusable and
attributed even if someone forks just the content. This doesn't have to
be decided now, but is worth stating explicitly in the Terms/README
before the first outside contributor shows up, so nobody submits notes
under an assumption you didn't intend.

------------------------------------------------------------------------

# MVP Roadmap

## Phase 1

-   Authentication
-   Course catalog
-   Course pages
-   Admin CRUD
-   PostgreSQL integration
-   Open-source repo scaffolding: MIT `LICENSE`, `CONTRIBUTING.md`, issue
    templates, CI (lint/typecheck/test/build)

## Phase 2

-   Wiki pages: create/view (published only, no editing yet)
-   Previous exams
-   Resources
-   Search
-   Professor profiles
-   **Communities forum** — posts, likes, nested comments with text and image URLs

## Phase 3

-   Markdown editor with live preview + page editing
-   Revision history, diffing, moderator approval queue
-   Course & per-page discussion forums
-   Reviews
-   Bookmarks
-   Notifications (edit approved/rejected, new forum reply, ticket
    resolved)
-   Dashboard (incl. "my submitted edits", "my support tickets")
-   Support/contact ticket system + Resend email notifications to
    admins/moderators

## Phase 4

-   AI study assistant
-   OCR
-   Quiz generation
-   Analytics dashboard (most-edited pages, most active contributors)

## Phase 5 (Future)

-   Communities: file/image upload support (replace URL-paste with native upload)
-   Community post moderation (report/flag inappropriate content)
-   Rich text editor for community posts