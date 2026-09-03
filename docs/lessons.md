# LESSONS

- Never pass Lucide/React component functions as props from Server Components to Client Components — pass a serializable icon name string and resolve inside the client.
- Cherry Ops demo logins must be product-domain role emails (ceo@cherry-ops.demo), not personal names or redcherry.demo / BICS-style addresses.
- Never cross-contaminate client brands: Red Cherry / Cherry Ops must not reference BICS, bic-tender-ops, or other clients' emails, URLs, or copy.
- Login forms on shared localhost ports must disable browser autofill (unique name + autocomplete=off) — browsers often inject saved credentials from other apps.
- Joe Public (or any agency site) is a design-quality bar for Cherry Ops CRM UI — not a brief to build a marketing landing page; guests go to login, signed-in users to role home.
- A static PNG hero cannot limb-animate; sell presence with Ken Burns, breath, glow, and light sweep — or ship video/Lottie if true character motion is required.
- On Vercel HTTPS, Auth.js sets `__Secure-authjs.session-token`; proxy/middleware `getToken` must use `secureCookie: true` (and `trustHost`) or login succeeds then every page 307s back to `/login`.
- Production `AUTH_URL` / `NEXTAUTH_URL` must match the live host (e.g. `https://cherry-ops-hazel.vercel.app`), not a wrong `*.vercel.app` alias.
- Opportunity Ops inside Cherry Ops must use media lexicon only — no BICS lab scorer gates, lab anchors, or industrial exclude patterns from other clients.
