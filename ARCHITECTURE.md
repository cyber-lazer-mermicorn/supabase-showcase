# Architecture

## Overview
Supabase Full-Stack AI Showcase demonstrates auth, realtime, vector search (RAG), and edge functions on a Next.js 15 + Supabase stack.

## Layers

| Layer | Path | Responsibility |
|---|---|---|
| Edge Functions | `supabase/functions/` | Serverless Deno functions — AI, webhooks, cron |
| Migrations | `supabase/migrations/` | Schema-as-code — all DB changes here |
| Library | `lib/` | Typed Supabase client, auth helpers, vector search RPCs |
| Types | `types/supabase.ts` | Generated from `supabase gen types typescript` |
| Tests | `__tests__/` | Unit and integration tests |

## Key patterns

### Auth flow
All auth state is verified server-side using `createServerClient` from `@supabase/ssr`. Client components use `useSession` hook from `lib/auth.ts`.

### Vector RAG
Documents are chunked, embedded via OpenAI, and stored with `pgvector`. Retrieval uses a typed `match_documents` Postgres function. Never call OpenAI embeddings directly from components.

### RLS
Every table containing user data has RLS enabled and at least one `SELECT` policy tied to `auth.uid()`. Migrations include RLS setup.

### Realtime
Realtime subscriptions use typed channel patterns from `lib/realtime.ts`. Unsubscribe on component unmount.
