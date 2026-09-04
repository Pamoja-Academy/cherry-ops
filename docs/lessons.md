# LESSONS

- Never trust "it built once" — run every screen over HTTP; /dashboard 500 and the login MissingSecret crash were invisible to tsc/eslint/build.
- FK references to the wrong table can hide behind autoincrement id coincidence on a fresh DB — always re-seed twice to expose it.
- Never pass component references (icons) as props from Server to Client Components in Next 16 — pass a name and resolve client-side.
- NextAuth v5 secret must be configured in the auth config AND match whatever the proxy/middleware uses to verify the JWT, or auth dies at runtime.
- Seed scripts must delete children before parents, cover every table, and reference returning() ids — never hardcoded ids.
- Dead Tailwind utility classes (unregistered brand tokens) fail silently — register tokens in @theme (v4) and grep for brand class usage.
- Unauthenticated mutation endpoints ship by default when no one checks — audit every route handler for auth + role + idempotency before delivery.
- Branch prefixes with spaces are impossible for git 2.43 — use the hyphenated form and document the deviation.
