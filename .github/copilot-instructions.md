# GitHub Copilot Instructions — Supabase Full-Stack AI Showcase

You are working on a Supabase integration showcase by Cherry Shanaley (AI Solutions Engineer).

## Always
- Use TypeScript strict — generate and use Supabase DB types
- Enable and respect Row Level Security on every user-data table
- Use server-side session verification — never trust client session alone
- Edge Functions use Deno runtime — use URL imports, not npm
- pgvector queries go through typed RPC functions, not raw SQL

## Never
- Expose service role key to the browser
- Disable RLS for convenience
- Use `select('*')` without explicit column list in production paths
- Write migration SQL inline in application code

## Pattern: RLS policy
```sql
create policy "users can only see their own data"
  on public.documents
  for select using (auth.uid() = user_id);
```

## Pattern: typed Supabase client
```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';
const supabase = createClient<Database>(url, key);
```
