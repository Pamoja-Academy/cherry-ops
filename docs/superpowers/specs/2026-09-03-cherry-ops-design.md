# Cherry Ops — Design Spec
**Date:** 2026-09-03  
**Client:** Red Cherry Interactive (Red Cherry Media Holdings Pty Ltd)  
**For:** Pheladi Mphahlele (CEO) + Creative Director  
**Contest:** Custom Media Company CRM — max effort, deployable URL

---

## 1. Context & Business Need

Red Cherry Interactive is a 30-year-old Level 1 BBBEE female-owned full-service agency:
- Services: Strategy · Creative · Media buying/planning · Production (TV/Radio/Video) · PR · Digital/Social · Activations & Events · Studio (green screen, VO, edit suites)
- Proof: Tiger Brands, FNB, Old Mutual, African Bank, Tru-Cape — measurable results (97% consumer comprehension, 81% conversion lift, 256% social growth)
- **Key strategic intent:** Grow private-sector client base — they have strong government/SOE history and want more FMCG, financial services, retail, property

**CRM must serve two goals:**
1. Run day-to-day agency ops (clients, jobs, production, media, invoices)
2. Power private-sector new-business development (leads, outreach, pipeline — Phase 2 via BD module)

---

## 2. Product: Cherry Ops

**Tag:** Red Cherry Interactive's Agency Operating System  
**Phase 1 scope:** Full agency ops + private-sector BD intelligence woven into every client record

### Visual Identity
- Brand: Cherry `#C4122F`, ink `#1A1214`, warm wash `#FBF6F2`, accent soft `#FCE8EC`, mark `#7A0B22`
- Typography: Playfair Display (display/hero) + Inter (UI) — expressive, editorial, media-house
- Backgrounds: atmospheric grain/gradient wash, never flat white; full-bleed login hero
- No card grids in hero viewports; brand hero first; one job per section

---

## 3. Architecture

**Stack:**
- Next.js 16 (App Router, Turbopack default)
- TypeScript strict
- Postgres via Supabase (new cherry-ops project)
- Drizzle ORM + migrations
- NextAuth.js v5 — email/password, 5 demo role accounts
- Vercel AI SDK — server actions + `/api/autopilot/run` cron
- Vercel deploy (Hobby, same pattern as bic-tender-ops: `cherry-ops.vercel.app`)
- Tailwind CSS v4 + shadcn/ui base + custom Cherry tokens
- Lucide icons

**Auth roles (demo):**
- `pheladi@redcherry.demo` / `cherry-ceo-2026` → CEO
- `creative@redcherry.demo` / `cherry-cd-2026` → Creative Director  
- `production@redcherry.demo` / `cherry-prod-2026` → Production Manager
- `media@redcherry.demo` / `cherry-media-2026` → Media Director
- `finance@redcherry.demo` / `cherry-fin-2026` → Finance Manager

---

## 4. Domain Model (Postgres / Drizzle)

```
users             id, email, name, role, avatar_url
clients           id, name, sector, industry, contact_name, contact_email, contact_phone, 
                  address, is_private_sector, account_manager_id, status, notes, created_at
client_contacts   id, client_id, name, role, email, phone, is_primary
jobs              id, client_id, title, type, status, stage, brief, start_date, due_date,
                  value, owner_id, created_at
job_tasks         id, job_id, title, assignee_id, stage, due_date, studio_resource_id, completed_at
deliverables      id, job_id, title, type, status, due_date, notes
studio_resources  id, name, type (suite/vo/green_screen/edit), capacity_per_day
studio_allocs     id, resource_id, job_id, task_id, date, hours, notes
media_buys        id, job_id, title, channel, placement, budget, spent, start_date, end_date,
                  status, pacing_alert
invoices          id, job_id, client_id, number, amount, status, issued_date, due_date, paid_date
payments          id, invoice_id, amount, method, date, notes
leads             id, company, sector, contact_name, contact_email, source, status, 
                  assigned_to, notes, created_at  [private-sector BD — Phase 1 lite]
activity_events   id, entity_type, entity_id, type, payload, actor_id, created_at
autopilot_actions id, type, classification (safe/risky), status (proposed/auto_ran/pending/approved/rejected),
                  entity_type, entity_id, payload, proposed_at, resolved_at, resolved_by
```

---

## 5. Screens & Role Homes

| Route | Screen | Primary role |
|---|---|---|
| `/login` | Brand-first, role demo cards | Public |
| `/` | Redirect → role home | Auth |
| `/dashboard` | CEO Command Center | CEO |
| `/clients` | Client list + sector filter | All |
| `/clients/[id]` | Client detail + jobs + invoices + contacts | All |
| `/jobs` | Jobs/campaigns list + kanban | CD, Prod |
| `/jobs/[id]` | Job detail + tasks + deliverables + media + invoices | All |
| `/production` | Production board (kanban by stage) | Prod, CD |
| `/studio` | Studio capacity — resources + today's allocations | Prod |
| `/media` | Media buys table + pacing bars | Media, CEO |
| `/invoices` | Invoice pipeline + actions | Finance, CEO |
| `/leads` | Private-sector lead tracker | CEO, Sales |
| `/autopilot` | Action inbox — auto-ran + pending approval | CEO, Finance |
| `/settings` | Team, roles, resource config | CEO |

**Role home redirects:**
- CEO → `/dashboard`
- Creative Director → `/jobs`
- Production → `/production`
- Media → `/media`
- Finance → `/invoices`

---

## 6. CEO Command Center (Dashboard)

Metrics pulse (not a dashboard of junk — one screen, one job):
- Revenue this month vs target
- Active jobs count + overdue count
- Outstanding invoices value + overdue
- Media buys pacing health (% under/over)
- Autopilot pending approval count (badge + card)
- Live autopilot activity feed (last 10 events)
- Private-sector pipeline: leads by stage (lite)

---

## 7. Private-Sector BD (Built into v1)

Woven into client records and leads:
- `clients.is_private_sector` flag + sector tag (FMCG, Finance, Retail, Property, Pharma, Tech)
- Lead tracker: `/leads` — company, sector, contact, source, status (cold/warm/proposal/won/lost)
- Autopilot: SLA nudge on warm leads idle >7 days (safe auto-flag)
- CEO dashboard: private-sector win rate tile
- Client detail: BD history notes + last touchpoint date

---

## 8. Autopilot (Guardrailed)

**Safe (auto-run + log):**
- Job task overdue → flag + in-app notify
- Media buy under-pacing by >15% → alert card
- Invoice overdue >7 days → send reminder draft to finance queue
- Warm lead idle >7 days → nudge to account manager
- Studio over-allocated → warning on production board

**Risky (pending approval):**
- Mark job stage complete
- Send invoice to client
- Change media buy budget
- Mark invoice paid
- Move lead to Proposal

**Never:**
- Delete any record
- Bulk PII export
- Change user roles

---

## 9. Seed Data (Demo org)

**Clients (8):**
- African Bank — Financial Services, private sector ✓
- Tiger Brands — FMCG, private sector ✓
- FNB Smart Rewards — Financial Services, private sector ✓
- Old Mutual — Financial Services, private sector ✓
- Tru-Cape — FMCG/Agriculture, private sector ✓
- SA Tourism — Government
- GCIS — Government
- Massmart (Walmart SA) — Retail, private sector ✓ (new target)

**Jobs (12):** Across stages (brief, production, media, delivery, done)  
**Media buys (10):** Mixed pacing  
**Invoices (15):** Mixed status including 3 overdue  
**Leads (6):** Private sector targets (Pick n Pay, Discovery Health, Capitec, Multichoice, Shoprite, MTN)  
**Autopilot queue:** 3 pre-seeded pending approvals, 8 auto-ran events

---

## 10. Deploy

- Vercel (hobby) — same team as bic-tender-ops
- URL: `cherry-ops.vercel.app`
- Supabase: new project `cherry-ops` (eu-west-1)
- Cron: `/api/autopilot/run` every 15 min via vercel.json
- Env: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

---

## 11. Phase 2 (Parked)

- Full new-business pipeline: brief intake → pitch deck → won → job
- Email/SMS integration (Resend)
- Real media buy API feeds
- Multi-tenant (other agencies on Cherry Ops)
