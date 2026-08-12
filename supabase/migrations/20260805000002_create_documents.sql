-- Migration: documents table with pgvector embeddings
-- Run order: 2 of 3

create table if not exists documents (
  id          uuid primary key default gen_random_uuid(),
  content     text not null,
  embedding   vector(1536),
  metadata    jsonb default '{}',
  user_id     uuid references auth.users(id) on delete cascade,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- HNSW index — faster than IVFFlat for high-accuracy nearest-neighbor search
create index if not exists documents_embedding_hnsw_idx
  on documents using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

-- Full-text search index for hybrid retrieval
create index if not exists documents_content_fts_idx
  on documents using gin (to_tsvector('english', content));

-- Row Level Security
alter table documents enable row level security;

create policy "Users can read own documents"
  on documents for select
  using (auth.uid() = user_id);

create policy "Users can insert own documents"
  on documents for insert
  with check (auth.uid() = user_id);

create policy "Users can update own documents"
  on documents for update
  using (auth.uid() = user_id);

create policy "Users can delete own documents"
  on documents for delete
  using (auth.uid() = user_id);

-- Service-role bypass (used by Edge Functions with service key)
create policy "Service role full access"
  on documents for all
  using (auth.role() = 'service_role');
