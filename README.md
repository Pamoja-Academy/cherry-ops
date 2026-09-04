# Cherry Ops

**Red Cherry Interactive's Agency Operating System** — a full agency CRM covering clients, jobs & campaigns, production, studio capacity, media buys, invoices, private-sector business development, and a guardrailed AI Autopilot.

Built for Red Cherry Interactive (Red Cherry Media Holdings Pty Ltd) — 30 years, Level 1 BBBEE, female-owned. Tiger Brands · FNB · Old Mutual · African Bank · Tru-Cape.

## Quick start

```bash
npm install
npm run db:push    # create the SQLite schema (drizzle-kit)
npm run db:seed    # load the Red Cherry demo org (idempotent — safe to re-run)
npm run dev        # http://localhost:3000
```

Copy `.env.example` to `.env.local` for local configuration. No external services are required for the demo: the database is a local SQLite file via Drizzle ORM.

## Demo accounts

| Role | Email | Password | Lands on |
|---|---|---|---|
| CEO (Pheladi Mphahlele) | `pheladi@redcherry.demo` | `cherry-ceo-2026` | `/dashboard` |
| Creative Director | `creative@redcherry.demo` | `cherry-cd-2026` | `/jobs` |
| Production Manager | `production@redcherry.demo` | `cherry-prod-2026` | `/production` |
| Media Director | `media@redcherry.demo` | `cherry-media-2026` | `/media` |
| Finance Manager | `finance@redcherry.demo` | `cherry-fin-2026` | `/invoices` |

## What's inside

- **CEO Command Centre** (`/dashboard`) — revenue pulse, active/overdue jobs, outstanding invoices, media pacing health, autopilot approvals, live activity feed, private-sector win funnel.
- **Clients** — 8 accounts with sector tags, private-sector flags, contacts, jobs, invoices, total billed / outstanding.
- **Jobs & Campaigns** — kanban across brief → production → review → delivery → complete, with overdue highlighting; full job detail (tasks, deliverables, studio allocations, invoices).
- **Production Board & Studio Capacity** — task kanban plus per-resource daily load with over-capacity warnings.
- **Media Buys** — budget vs spent pacing bars with under/over alerts.
- **Invoice Pipeline** — draft / sent / overdue / paid with days-overdue tracking.
- **Private-Sector Pipeline** (`/leads`) — cold → warm → proposal → won → lost with win-rate header.
- **Autopilot** (`/autopilot`) — guardrailed AI: safe rules auto-run and log; risky actions (send invoice reminder, mark job complete, …) require CEO/Finance approval and **execute on approval**.

### Autopilot rules

| Rule | Class | Behaviour |
|---|---|---|
| Job task overdue → SLA flag | safe | auto-runs, logs to activity feed |
| Media buy pacing off (>15%) | safe | auto-runs, alert logged |
| Warm lead idle >7 days | safe | auto-runs, nudge logged |
| Invoice overdue reminder | risky | pending approval → queues reminder on approve |
| Mark job complete | risky | pending approval → completes job on approve |

Never: deletes, bulk PII export, role changes.

## Scripts

```bash
npm run dev         # develop
npm run build       # production build
npm run lint        # eslint
npm run typecheck   # tsc --noEmit
npm run verify      # lint + typecheck + build
npm run db:push     # apply schema
npm run db:seed     # seed demo data (idempotent)
npm run db:reset    # wipe + push + seed
```

## Stack & structure

Next.js 16 (App Router, Turbopack) · TypeScript strict · NextAuth v5 (credentials, JWT) · Drizzle ORM + SQLite (better-sqlite3) · Tailwind CSS v4 · framer-motion · lucide-react.

- `src/db/schema.ts` — domain model (users, clients, contacts, jobs, tasks, deliverables, studio, media buys, invoices, payments, leads, activity, autopilot)
- `src/lib/auth.ts` — NextAuth config + role-home redirects
- `src/lib/autopilot.ts` — guardrailed rule engine
- `src/lib/queries.ts` — data access for every screen
- `src/proxy.ts` — auth gate (Next 16 proxy convention; session secret must match `src/lib/auth.ts`)
- `src/app/api/autopilot/run` — cron endpoint (`*/15 * * * *` via `vercel.json`; protect with `CRON_SECRET` in production)
- `src/app/api/autopilot/resolve` — approve/reject endpoint (CEO/Finance only, idempotent, executes effects on approval)

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Set env vars: `AUTH_SECRET` (random 32-byte string), `CRON_SECRET`.
3. Deploy — the autopilot cron is registered automatically from `vercel.json`.
4. Run `npm run db:push && npm run db:seed` against the target database. (Demo uses a local SQLite file; for a persistent production datastore move `DATABASE_URL` to Postgres/Supabase — the Drizzle schema is the single migration point.)
