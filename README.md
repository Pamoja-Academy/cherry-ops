# Cherry Ops

**Red Cherry Interactive's Agency Operating System** — contest-ready CRM for full agency ops + private-sector growth.

Built for Pheladi Mphahlele (CEO) and the Creative Director. Deploys on Vercel as `cherry-ops.vercel.app`.

## Quick start (local — recommended for live demo)

```powershell
cd cherry-ops
npm install
npm run db:seed
npm run dev
```

Open **http://localhost:3000** → click **CEO — Pheladi Mphahlele** on the login page.

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
4. **Jobs** → FNB Smart Rewards Season 3 TVC (production), Massmart Black Friday (brief)
5. **Autopilot** → Approve/reject pending actions (invoice send, job complete)
6. **Sign out → Creative Director** → Jobs kanban + production view

## What's included

- CEO Command Centre with live metrics + autopilot feed
- Clients (private-sector tagged) · Jobs/Campaigns kanban · Production board
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
| `NEXTAUTH_URL` | `https://cherry-ops.vercel.app` |

4. Deploy → URL: **https://cherry-ops.vercel.app**

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
