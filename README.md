# Supabase Showcase

**What this proves:** Supabase integration patterns — typed database access via
Postgres + RLS policies, auth flows, realtime subscriptions, and storage. Every
pattern enforces security boundaries, not just happy-path queries.

**Portfolio:** [cyber-lazer-mermicorn](https://github.com/cyber-lazer-mermicorn) · Cherry Shanaley

---

## Key patterns

| Pattern | What it proves |
|---|---|
| Typed DB client | `supabase-js` with generated types — no `any`, no raw strings |
| Row Level Security | RLS policies enforced — user can only read/write their own rows |
| Auth flows | Email/password + OAuth sign-in, session refresh, protected routes |
| Realtime | Channel subscription with typed payload, explicit unsubscribe |
| Storage | Signed URL uploads with bucket policies, not public URLs |

## Run locally

```bash
npm install
cp .env.example .env   # add SUPABASE_URL + SUPABASE_ANON_KEY
npm run demo
npm test
```

## Evidence

- RLS demo attempts a cross-user read and asserts it is denied
- Auth flow demo logs session token + expiry — refresh path is exercised
- Realtime demo sends a message and receives it back via subscription

## Honest scope

Showcase-grade: patterns are correct and security-aware. No production multi-tenant
schema design, migrations workflow, or edge function deployment included.
