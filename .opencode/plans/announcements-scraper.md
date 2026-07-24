# Plan: Announcements + Scraper

## 1. Prisma — Add Announcement model

```prisma
model Announcement {
  id          Int      @id @default(autoincrement())
  title       String
  content     String?
  source      String
  sourceUrl   String?
  publishedAt DateTime
  createdAt   DateTime @default(now())
}
```

## 2. Backend — AnnouncementsModule (CRUD)

- `src/announcements/announcements.module.ts`
- `src/announcements/announcements.controller.ts`
- `src/announcements/announcements.service.ts`
- `src/announcements/dto/create-announcement.dto.ts`
- `src/announcements/dto/update-announcement.dto.ts`

Endpoints:
- `GET /announcements?limit=10` — public
- `GET /announcements/:id` — public
- `POST /announcements` — ADMIN
- `PATCH /announcements/:id` — ADMIN
- `DELETE /announcements/:id` — ADMIN
- `POST /announcements/scrape` — ADMIN

Register in `app.module.ts`.

## 3. ScraperService + cron

- Install `@nestjs/schedule`, `cheerio`, `axios`
- `src/announcements/scraper.service.ts`
- Cron: every 6 hours (`0 */6 * * *`)
- Sources from env vars: `SCRAPE_UNIVERSITY_URL`, etc.
- Dedup by `sourceUrl`

## 4. Frontend — API + Hooks

- `src/api/announcements.ts`
- `src/hooks/use-announcements.ts`

## 5. Frontend — Announcements page

- `src/pages/Announcements.tsx`
- Route: `/announcements` under `RootLayout`

## 6. Home.tsx — Latest 3 announcements

- Replace placeholder with real data from API
- "View all" button → `/announcements`

## 7. Navbar — Add "Announcements" link

- Between Courses and Community

## 8. Admin — AdminAnnouncements.tsx

- CRUD table + "Scrape now" button
- Add to AdminLayout sidebar

## 9. i18n — Add keys for both bg and en

- `announcements.title`, `announcements.loading`, `announcements.empty`, `announcements.source`, `announcements.viewAll`, `announcements.publishedAt`
- Admin keys for announcements CRUD
