# Students-preparation — frontend

The web application for Students-preparation, an interview and placement
preparation platform for the Indian market. Students practise MCQs by topic,
take timed mock tests, and get scored results with weak-area analysis.

This repository holds **both** the student-facing product and the admin panel.
Admin is a protected route group at `/admin`, not a separate application.

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Vitest · Playwright

> **Status: scaffold.** Session 1 built the project shell, the design tokens and
> one placeholder page. No features yet.

## This is one of three repositories

| Repo        | What it is                                            |
| ----------- | ----------------------------------------------------- |
| workspace   | `CLAUDE.md` and `docs/` — the project's documentation  |
| `frontend/` | **this repository**                                   |
| `backend/`  | NestJS API, Prisma, PostgreSQL                        |

**The documentation lives in the workspace repository, in `docs/`.** Read
`docs/SCOPE.md`, `docs/ARCHITECTURE.md` and `docs/DESIGN_SYSTEM.md` before
changing anything here. Full setup instructions are in `docs/SETUP.md`.

## Quick start

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000.

The app runs without the backend; anything that needs data will not work until
the API is up on port 4000.

## Scripts

| Command                    | What it does                              |
| -------------------------- | ----------------------------------------- |
| `npm run dev`              | Dev server on :3000                       |
| `npm run build`            | Production build                          |
| `npm start`                | Serve the production build                |
| `npm run lint`             | ESLint                                    |
| `npm run typecheck`        | `tsc --noEmit`                            |
| `npm test`                 | Vitest unit tests                         |
| `npm run test:watch`       | Vitest in watch mode                      |
| `npm run test:e2e`         | Playwright — starts the dev server itself |
| `npm run test:e2e:install` | One-time Chromium download for Playwright |

## Layout

```
src/
├── app/             App Router. Folders are URLs.
│   ├── globals.css  Design tokens (@theme) — the Tailwind config lives here
│   ├── layout.tsx   Root layout: font, body
│   └── page.tsx     Placeholder page
└── lib/
    └── env.ts       Public config and the apiUrl() builder
e2e/                 Playwright specs
```

## Design tokens

Tailwind v4 is CSS-first — there is **no `tailwind.config.js`**. Tokens are
declared in `@theme` blocks in `src/app/globals.css` and Tailwind generates the
utilities from them.

Two brand colours, deep blue `#123A5E` and saffron `#FF9933`, plus neutrals.
Green and red are reserved for correct and incorrect answers. Never put a hex
value in a component — add a token instead, and document it in
`docs/DESIGN_SYSTEM.md`.

## Talking to the backend

Build every API URL with `apiUrl()` from `src/lib/env.ts`. It reads
`NEXT_PUBLIC_API_BASE_URL` and prefixes `/api/v1/`. The conventions — status
codes, pagination, the error shape — are in `docs/API_CONTRACT.md`.

## Content

All student-facing content on this platform is original and human-reviewed
before publication. Read `docs/CONTENT_POLICY.md` before adding any question,
explanation or copy.
