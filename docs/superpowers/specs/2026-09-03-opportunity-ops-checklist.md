# Opportunity Ops — architecture revision checklist

Source map: bic-tender-ops Opportunity Ops loop (ingest → score → inbox → triage → 72/48/24 → pack). Cherry Ops hosts this as a CRM module, not a white-label of Ten-X-der.

## Product mapping (done in cherry-ops)

| Bic Ten-X-der | Cherry Ops |
|---------------|------------|
| `/inbox` | `/opportunities` |
| `/pipeline` | `/pitches` |
| `/tenders/[id]` | `/opportunities/[id]` |
| `POST /api/ingest` | `POST /api/opportunities/ingest` |
| `GET/POST /api/reminders` | `/api/opportunities/reminders` |
| `POST /api/pdf/[id]` | `/api/opportunities/[id]/pack` |
| pursue / review / discard | Pitch it / Worth a look / Pass (≥70 / 40–69 / &lt;40) |

## Must reuse

- [x] Score bands 70 / 40
- [x] Media lexicon from Red Cherry pack (keywords, capabilities, exclude, issuers) — `src/lib/opportunity/profile.ts`
- [x] Triage approve/discard + reminder schedule on approve
- [x] Credential pack PDF download
- [x] Demo briefs including lab noise row (exclude path)

## Must NOT copy from BICS

- [x] No `LAB_ANCHORS` / HPLC / Agilent gates in scorer
- [x] No Bashumi / BICS vault returnables or method-statement lab copy
- [x] No `ops@bicengineering` / BICS digest recipients
- [x] No `/p/red-cherry` tenant URL — CRM session is enough

## Gaps to close before contest demo

- [ ] Seed opportunities into SQLite on first run / Vercel `/tmp` copy
- [ ] Cron: ingest + reminders (mirror bic `0 6` / `0 7` UTC) under opportunity API paths
- [ ] Manual “Scan briefs” control on Opportunities page
- [ ] Verify pack PDF + triage + pitches end-to-end locally and on Vercel
- [ ] Deploy `cherry-ops.vercel.app` (same `*.vercel.app` pattern as `bic-tender-ops`)
- [ ] Bugbot review on Opportunity Ops + CRM shell changes

## Scoring formula (media profile)

Base 15 + keywords + capabilities + issuer/province/value when relevant − excludes − relevance gate (no keyword/cap hits → max 28). No lab-weak-token special cases.
