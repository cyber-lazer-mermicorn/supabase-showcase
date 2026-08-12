-- Migration: match_documents RPC for vector similarity search
-- Run order: 3 of 3
-- Called by: lib/supabase-ai.ts searchDocuments()

create or replace function match_documents (
  query_embedding  vector(1536),
  match_count      int     default 5,
  match_threshold  float   default 0.75
)
returns table (
  id          uuid,
  content     text,
  metadata    jsonb,
  similarity  float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where 1 - (embedding <=> query_embedding) > match_threshold
  order by embedding <=> query_embedding
  limit match_count;
$$;
