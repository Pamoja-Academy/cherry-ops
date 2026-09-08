# Events Module Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Replace Jobs with an Events module (Activations | Scheduling) in Cherry Ops.

**Architecture:** Evolve Drizzle schema from `jobs`/`job_tasks` to `activations`/`schedule_items`/`event_tasks`; retarget FKs; new `/events` UI with two tabs; redirects from `/jobs`; reseed demo DB.

**Tech Stack:** Next.js 16 (Turbopack), TypeScript, Drizzle ORM, SQLite (`better-sqlite3`), NextAuth v5, Tailwind v4, Lucide, Framer Motion.

## Global Constraints

- Brand: Cherry `#C4122F`; no BICS / other-client cross-contamination.
- Demo emails stay `*@cherry-ops.demo`.
- Stay on Drizzle/SQLite — do not introduce Prisma.
- Writable CRM flows; seed must leave Activations + Scheduling editable.
- Live alias target: `https://cherry-ops-hazel.vercel.app`.

## File map

| Path | Responsibility |
|---|---|
| `src/db/schema.ts` | activations, schedule_items, event_tasks; FK renames |
| `src/db/seed.ts` | Reseed activations + schedule items + tasks |
| `src/lib/queries.ts` | Query helpers rename |
| `src/lib/auth.ts` / login role homes | CD → `/events` |
| `src/lib/autopilot.ts` | Overdue activation rules |
| `src/components/shell/Sidebar.tsx` | Events nav |
| `src/components/shell/TopBarWrapper.tsx` | Titles |
| `src/app/(dashboard)/events/**` | List + detail UI |
| `src/app/(dashboard)/jobs/**` | Redirects |
| `src/app/api/activations/**`, `schedule-items/**`, `event-tasks/**` | APIs |
| `src/app/(dashboard)/{production,studio,media,invoices,clients,dashboard}/**` | Copy + FK joins |
| `README.md` | Walkthrough copy |
| `docs/lessons.md` | One-line lessons if mistakes |

---

## Task 1: Schema + seed

**Files:** `src/db/schema.ts`, `src/db/seed.ts`

- [ ] Replace `jobs` / `job_tasks` with `activations`, `schedule_items`, `event_tasks`
- [ ] Point deliverables, studio_allocs, media_buys, invoices at `activation_id`
- [ ] Reseed: former jobs → activations; add ≥4 schedule_items; wire tasks
- [ ] Run `npm run db:seed`
- [ ] Commit `feat(events): schema activations + scheduling replace jobs`

## Task 2: Queries + APIs + autopilot

**Files:** `src/lib/queries.ts`, `src/lib/autopilot.ts`, `src/app/api/**`

- [ ] Rename getJobs → getActivations; add getScheduleItems; update getJob → getActivation
- [ ] API routes for activations, schedule-items, event-tasks (stage/status updates)
- [ ] Autopilot overdue activation rule
- [ ] Commit `feat(events): queries and APIs for activations/scheduling`

## Task 3: Nav + Events UI

**Files:** Sidebar, TopBar, `src/app/(dashboard)/events/**`, jobs redirects, auth role homes

- [ ] Nav: Events replaces Jobs (Calendar icon or similar)
- [ ] `/events` page with Activations | Scheduling tabs
- [ ] Detail routes `/events/activations/[id]`, `/events/scheduling/[id]`
- [ ] Redirect `/jobs` → `/events`
- [ ] CD/Director home → `/events`
- [ ] Commit `feat(events): Events nav with Activations and Scheduling tabs`

## Task 4: Downstream screens + copy

**Files:** dashboard, clients, production, studio, media, invoices, README

- [ ] Replace “Jobs” labels with “Activations”
- [ ] Joins use activation titles
- [ ] Update README contest walkthrough
- [ ] Commit `fix(events): retarget production/studio/media/invoices to activations`

## Task 5: Verify

- [ ] `npm run db:seed && npm run build`
- [ ] Manual/browser: Events tabs, no Jobs nav, CD lands on Events
- [ ] Push branch + open PR
- [ ] Commit any verify fixes
