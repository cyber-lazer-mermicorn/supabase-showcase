# Supabase Full-Stack AI Showcase — Agent Doctrine

## What this repo is
Production-grade Supabase integration showcase: Auth, Realtime, Edge Functions, pgvector RAG, Row Level Security.
By Cherry Shanaley (Chan), AI Solutions Engineer.

## Tech stack
- **Framework:** Next.js 15 (App Router)
- **Backend:** Supabase (Postgres, Auth, Realtime, Edge Functions)
- **AI/Vector:** pgvector, OpenAI embeddings
- **Deployment:** Vercel
- **Language:** TypeScript (strict)

## Coding rules
- TypeScript strict — no `any`, all Supabase responses typed via generated types
- RLS must be enabled on every table that stores user data — no exceptions
- Use `supabase.auth.getSession()` server-side; never trust client-side session alone
- Edge Functions in `supabase/functions/` — Deno runtime, explicit imports
- Vector similarity search uses `match_documents` RPC pattern — do not write raw pgvector SQL in components
- All DB schema changes go through migrations in `supabase/migrations/`

## Project structure
```
supabase/functions/   # Edge Functions (Deno)
supabase/migrations/  # DB migrations
lib/                  # Supabase client, typed helpers
__tests__/            # Test suite
```

## Commands
```bash
npm install
npm run dev
supabase start        # local Supabase stack
supabase db push      # apply migrations
npm run test
```

## Do not
- Disable RLS on user-data tables
- Store Supabase service role key client-side
- Write raw SQL outside of migrations or typed RPCs
- Use `supabase.from().select('*')` without column selection in production code
