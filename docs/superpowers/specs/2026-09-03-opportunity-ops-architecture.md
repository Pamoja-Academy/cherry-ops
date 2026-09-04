# Opportunity Ops Architecture

**Date:** 2026-09-03  
**Platform:** Cherry Ops (Next.js 16 + SQLite + Drizzle)  
**Module:** Opportunity Ops — media tender/brief ingest inside Red Cherry CRM

## Overview

Opportunity Ops is a platform-within-platform for Red Cherry Interactive. It ingests media tenders and briefs, scores fit against a media agency profile, supports pitch/pass triage, schedules deadline reminders (72/48/24h), and generates a branded credentials PDF pack.

This module is **separate** from the private-sector Leads CRM pipeline.

## Adaptation checklist (reuse vs reject from bic-tender-ops)

| Area | Reuse | Reject |
|------|-------|--------|
| Score bands (≥70 pursue, 40–69 review, <40 discard) | ✅ | |
| Base + keyword + capability + issuer + province + exclude + value formula | ✅ | |
| Relevance gate (no keyword+cap hits → cap at 28) | ✅ | |
| Triage pending → approved/discarded | ✅ | |
| 72/48/24h reminders on approved only | ✅ | |
| PDF credentials pack | ✅ (hand-rolled PDF) | BICS vault PDFs |
| LAB_ANCHORS / WEAK_WITHOUT_LAB / gc chromatography gates | | ❌ |
| Lab/industrial lexicon | | ❌ |
| BICS/Bashumi branding or copy | | ❌ |

## Media lexicon (Red Cherry profile)

Seeded in `src/lib/opportunity/profile.ts`:

- **Keywords:** panel of service providers, marketing and communications, advertising agency, media buying, creative agency, brand campaign, PR, digital marketing, social media, events, activations, AV, video production, GCIS, communications panel, agency of record
- **Capabilities:** IMC, creative design, brand strategy, media planning/buying, PR, digital, social, events, activations, AV/video production, content marketing, stakeholder engagement
- **Exclude:** laboratory, lab chemicals, glassware, reagent, calibration, hplc, construction, civil engineering, cidb, toner, fire extinguisher, security guarding, medical supplies
- **Issuers:** GCIS, SETA, W&RSETA, Services SETA, GEPF, SABC, SA Tourism, National Treasury, City of Johannesburg, Gauteng
- **Value range:** R50,000 – R50,000,000

## Scoring thresholds

| Band | Score | UI label |
|------|-------|----------|
| Pursue | ≥ 70 | Pitch |
| Review | 40 – 69 | Review |
| Discard | < 40 | Hidden (unless `?show=all`) |

## Data model

### `opportunities`

External briefs with `external_id` (unique), fit score, JSON breakdown, triage state, closing/briefing dates.

### `opportunity_reminders`

Rows for 72h, 48h, 24h before `closing_at`. Created on approve; cancelled on pass.

## API surface

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| PATCH | `/api/opportunities/[id]` | Session | Triage approve/discard; schedule/cancel reminders |
| POST | `/api/opportunities/ingest` | Session | Re-seed demo media briefs |
| GET/POST | `/api/opportunities/reminders` | CRON_SECRET (if set) | Dispatch due reminders → activity_events |
| GET/POST | `/api/opportunities/[id]/pack` | Session | Download credentials PDF |

## UI routes

| Route | Purpose |
|-------|---------|
| `/opportunities` | Inbox with stats; Pitch it / Pass; hide score < 40 by default |
| `/opportunities/[id]` | Detail, breakdown, triage, pack download |
| `/pitches` | Approved briefs + reminder status |

## Cron

`vercel.json`: `/api/opportunities/reminders` daily at 07:00 UTC.

## Company identity (pack)

Red Cherry Media Holdings (Pty) Ltd t/a Red Cherry Interactive · Rivonia/Sandton · Level 1 BEE · +27 11 807 2531

## Test plan

- [ ] Run `npm run db:seed` — 5 demo briefs inserted; lab chemicals row scores < 40
- [ ] Visit `/opportunities` — 4 visible by default (discard hidden); `?show=all` shows 5
- [ ] Pitch a ≥70 brief — appears on `/pitches` with 3 pending reminders
- [ ] Pass a brief — triage_status discarded; reminders cancelled
- [ ] Download pack from detail — PDF with company identity + breakdown
- [ ] POST `/api/opportunities/ingest` (authenticated) — refreshes demo data
- [ ] GET `/api/opportunities/reminders` with CRON_SECRET — dispatches due reminders to activity feed
- [ ] `npm run build` passes

## Demo seed briefs

1. GCIS panel — marketing & communications (high)
2. W&RSETA communications / creative (high-mid)
3. GEPF brand campaign (high)
4. SA Tourism AV / video production (high)
5. Lab chemicals RFQ (discard via exclude)

Closing dates: 10–40 days out for reminder scheduling.
