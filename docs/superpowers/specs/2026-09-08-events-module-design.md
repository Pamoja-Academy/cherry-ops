# Cherry Ops — Events Module Design
**Date:** 2026-09-08  
**Client:** Red Cherry Interactive  
**Live:** https://cherry-ops-hazel.vercel.app  
**Repo:** `Pamoja-Academy/cherry-ops`

---

## 1. Problem

Cherry Ops nav today: Dashboard · Clients · **Jobs** · Production · Studio · Media · Invoices · Leads · Opportunities · Pitches · Autopilot · Settings.

Red Cherry’s service line includes **Activations & Events**, but there is no Events module. **Jobs** never matched how the agency talks about work (client activations + internal planning). Founder decision: **Jobs goes away**; **Events** carries that load.

---

## 2. Locked decisions (brainstorming)

| Decision | Choice |
|---|---|
| Module | One nav item: **Events** |
| Tabs | **Activations** \| **Scheduling** |
| Scheduling meaning | Internal event planning / project management (not a plain calendar grid label) |
| Jobs | **Removed** from nav and product language; work records migrate into Activations (client) or Scheduling (internal) |
| Stack | Stay on existing **Next.js 16 + Turbopack + Drizzle + SQLite** (Prisma MCP/plugin is available in Cursor but is **out of scope** — cherry-ops is not a Prisma app) |

---

## 3. Approaches considered

### A — Replace Jobs with Events (recommended)
New domain: `activations` + `schedule_items` + shared `event_tasks`. Retarget Production / Studio / Media / Invoices FKs to activations. Seed migrates former jobs into the right bucket. Nav drops Jobs.

- Pros: Matches founder language; kills confusing concept; contest demo tells a clear story.
- Cons: Touches many files (queries, autopilot, role homes, seed).

### B — Thin rename Jobs → Activations + add Scheduling
Rename table/routes only; keep “job” internals.

- Pros: Smaller diff.
- Cons: Ghost Jobs semantics remain in APIs/code; half-measure.

### C — Events beside Jobs
Add Events; leave Jobs.

- Pros: Least churn.
- Cons: Explicitly rejected — Jobs unnecessary once Events exists.

**Recommendation: A.**

---

## 4. Product design

### 4.1 Nav & IA
- Replace `{ href: "/jobs", label: "Jobs" }` with `{ href: "/events", label: "Events" }`.
- `/events` default tab: **Activations**.
- Query: `/events?tab=activations` | `/events?tab=scheduling`.
- Legacy `/jobs` and `/jobs/[id]` → redirect to `/events` / matching activation detail.
- CD / Director role home: `/events` (was `/jobs`).
- Dashboard metric “Active Jobs” → **Active Activations**.

### 4.2 Activations (client work)
First-class client experiential / campaign / production work formerly called Jobs.

**Fields:** title, client_id, type (`activation` | `campaign` | `production` | `digital` | `pr`), stage (`brief` | `production` | `review` | `delivery` | `complete`), status, brief, venue (optional), start_date, event_date, due_date, value, owner_id, notes.

**Screens:**
- List + stage kanban (reuse Jobs UI patterns).
- Detail: brief, tasks, deliverables, media buys, invoices, studio links.

### 4.3 Scheduling (internal PM)
Internal planning items that are **not** client activations: shoot days, pitch prep, crew call sheets, deadline checkpoints, studio blocks as planned work.

**Fields:** title, kind (`shoot` | `pitch_prep` | `deadline` | `crew` | `studio_block` | `other`), status (`planned` | `in_progress` | `done` | `cancelled`), owner_id, start_at, end_at, related_activation_id (optional), notes.

**Screens:**
- List grouped by status / upcoming.
- Detail with tasks; optional link into an Activation.

### 4.4 Shared tasks
`event_tasks` replace `job_tasks`: assignee, status, due_date, optional `activation_id` **or** `schedule_item_id` (exactly one). Production board reads these tasks.

### 4.5 Downstream modules
| Module | Change |
|---|---|
| Production | Board fed by activation-linked tasks (and optionally schedule tasks) |
| Studio | `studio_allocs.activation_id` (was `job_id`) |
| Media | `media_buys.activation_id` |
| Invoices | `invoices.activation_id` |
| Deliverables | `deliverables.activation_id` |
| Autopilot | Overdue rules target activations / schedule items |
| Clients detail | “Active activations” not “active jobs” |

### 4.6 Seed story (demo)
- Migrate former client jobs → activations (keep FNB TVC, Massmart BF, African Bank Loyalty Launch Event, etc.).
- Add 4–6 Scheduling items (e.g. “Pitch war room — Capitec”, “Green screen block — FNB S3”, “Crew call — Loyalty launch”).
- Keep Opportunities / Pitches / Leads unchanged.

---

## 5. Data model (Drizzle / SQLite)

```
activations       id, client_id, title, type, status, stage, brief, venue,
                  start_date, event_date, due_date, value, owner_id, notes, created_at
schedule_items    id, title, kind, status, owner_id, start_at, end_at,
                  related_activation_id?, notes, created_at
event_tasks       id, activation_id?, schedule_item_id?, title, assignee_id,
                  status, due_date, studio_resource_id?, completed_at
deliverables      … activation_id (was job_id)
studio_allocs     … activation_id
media_buys        … activation_id
invoices          … activation_id?
```

Drop tables: `jobs`, `job_tasks` (after migration/reseed). Demo DB is seed-owned — full reseed is acceptable.

---

## 6. Error handling & auth
- Same NextAuth roles; no new roles.
- Activations require `client_id`; Scheduling does not.
- Creating an event_task without activation or schedule parent → 400.
- Redirect unauthenticated users to `/login` (existing layout).

---

## 7. Testing
- `npm run db:seed` then `npm run build` (Turbopack/Next 16 production build).
- Manual: login as CEO → Events → Activations list; switch Scheduling; open detail; confirm Jobs gone from sidebar.
- Manual: CD login lands on `/events`.
- Smoke: Production / Studio / Media / Invoices still render with activation titles.
- Live deploy check on hazel after merge/promote.

---

## 8. Out of scope
- Prisma migration
- Full calendar UI widget (Scheduling is PM list/detail first; date fields only)
- Email/SMS for event reminders
- Public guest event pages
- Removing Opportunities/Pitches

---

## 9. Success criteria
1. Sidebar shows **Events**, not Jobs.
2. Events has **Activations** and **Scheduling** tabs.
3. Demo seed has client activations + internal schedule items.
4. Production/Studio/Media/Invoices still work against activations.
5. Contest walkthrough copy no longer says “Jobs”.
