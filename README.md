# ФМИ Хъб

Платформа за курсове и учебни материали за Факултета по математика и информатика (ФМИ)
към Пловдивски университет. ФМИ Хъб позволява на студентите да разглеждат курсове и
преподаватели, докато служители и модератори поддържат каталога чрез прост
административен интерфейс.

## Технологичен стек

| Слой      | Технология                          |
|-----------|-------------------------------------|
| Frontend  | React + TypeScript + Vite           |
| Backend   | NestJS + Prisma ORM                 |
| База данни| PostgreSQL 16                       |
| Тестване  | Vitest (frontend) / Jest (backend)  |
| Инструменти| npm, Docker Compose, GitHub Actions|

Споделеният API договор между frontend и backend се намира в
[`docs/api-contract.md`](docs/api-contract.md).

## Изисквания

- **Node.js 20+** (препоръчва се LTS)
- **npm** (вграден в Node.js)
- **Docker** и **Docker Compose** (за локална PostgreSQL база данни)

## Бърза локална настройка

```bash
# 1. Клонирайте хранилището
git clone <repo-url>
cd ФПМИ

# 2. Стартирайте PostgreSQL базата данни
docker compose up -d

# 3. Стартирайте backend (http://localhost:3000)
cd backend
npm install
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# 4. Стартирайте frontend (http://localhost:5173) в нов терминал
cd frontend
npm install
npm run dev
```

Тестови акаунти (от `backend/prisma/seed.ts`):

- Администратор: `admin@fpmi.bg` / `admin123`
- Студент: `student@fpmi.bg` / `student123`

## Допринасяне

Добре дошли сте да допринасяте. Моля, прочетете [CONTRIBUTING.md](CONTRIBUTING.md) за
локална настройка, конвенции за код и списък за проверка на pull request-и,
и [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) за очакванията към общността.

## Лиценз

Разпространява се под [MIT License](LICENSE) — Copyright (c) 2026 ФМИ Хъб Contributors
