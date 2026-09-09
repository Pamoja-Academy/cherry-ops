# Cherry Ops

**Red Cherry Interactive's Agency Operating System** — contest-ready CRM for full agency ops + private-sector growth.

Built for Pheladi Mphahlele (CEO) and the Creative Director. Live: **https://cherry-ops-hazel.vercel.app** (not `cherry-ops.vercel.app` — that host is a different, password-walled project).

## Quick start (local — recommended for live demo)

**Windows + Node 24:** `better-sqlite3` needs a C++ toolchain. Use Docker (fastest) or install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) then `npm install`.

```powershell
cd cherry-ops
# Option A — Docker (recommended on this machine)
.\scripts\local-dev-docker.ps1

# Option B — native (Node 20 LTS + build tools)
npm install
npm run db:seed
npm run dev
```

Open **http://localhost:3000/login** → click **Pheladi Mphahlele (CEO)** on the demo strip.

## Demo logins

| Role | Email | Password |
|------|-------|----------|
| CEO | `ceo@cherry-ops.demo` | `cherry-ceo-2026` |
| Creative Director | `cd@cherry-ops.demo` | `cherry-cd-2026` |
| Production | `production@cherry-ops.demo` | `cherry-prod-2026` |
| Media | `media@cherry-ops.demo` | `cherry-media-2026` |
| Finance | `finance@cherry-ops.demo` | `cherry-fin-2026` |

## 90-second contest walkthrough

1. **Login as CEO** → Command Centre: revenue, overdue invoices, private-sector leads
2. **Leads** → Pick n Pay, Discovery, Capitec, MTN pipeline (private-sector growth focus)
3. **Clients** → African Bank, Tiger Brands, FNB, Massmart (new target)
4. **Events → Activations** → FNB Smart Rewards Season 3 TVC (production), Massmart Black Friday (brief)
5. **Events → Scheduling** → Internal shoots, deadlines, studio blocks linked to activations
6. **Autopilot** → Approve/reject pending actions (invoice send, activation complete)
7. **Sign out → Creative Director** → Events kanban + production view

## What's included

- CEO Command Centre with live metrics + autopilot feed
- Clients (private-sector tagged) · **Events** (Activations kanban + Scheduling) · Production board
- Studio capacity · Media buy pacing · Invoice pipeline
- **Private-Sector Pipeline** (leads) — supports Red Cherry's push for more FMCG, finance, retail clients
- Guardrailed autopilot (safe auto-nudges; risky actions need approval)

## Deploy to Vercel

Repo: **https://github.com/Pamoja-Academy/cherry-ops**

1. [Vercel Dashboard](https://vercel.com/new) → Import `Pamoja-Academy/cherry-ops`
2. Framework: **Next.js** (auto-detected)
3. Environment variables:

| Variable | Value |
|----------|-------|
| `NEXTAUTH_SECRET` | `cherry-ops-secret-2026-contest` (change for prod) |
| `AUTH_SECRET` | same |
| `NEXTAUTH_URL` / `AUTH_URL` | `https://cherry-ops-hazel.vercel.app` |

4. Deploy → production alias: **https://cherry-ops-hazel.vercel.app**

Demo DB is bundled in `data/cherry-ops.db` and copied to `/tmp` on Vercel cold starts.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run db:seed` | Reset + seed demo data |
| `npm run db:push` | Push Drizzle schema |

## Spec

Design doc: `docs/superpowers/specs/2026-09-03-cherry-ops-design.md`
