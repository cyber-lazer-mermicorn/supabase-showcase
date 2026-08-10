# Supabase AI Platform
## Built by Cherry Shanaley (Chan) | AI Solutions Engineer

Full-stack AI with Supabase: pgvector, Edge Functions, Realtime, and RLS.

**Live:** https://supabase-showcase.lazermermicorn.com

---

## What This Demonstrates

### pgvector (Latest)
- Vector embeddings in PostgreSQL
- HNSW indexing for fast search
- Semantic similarity search
- RAG pipelines

### Edge Functions
- Serverless AI at the edge
- Webhook handling
- Real-time processing

### Realtime
- Live AI responses
- Agent state streaming
- Multi-user collaboration

### Row-Level Security
- Multi-tenant AI
- Data isolation
- Permission control

---

## Tech Stack

- **Frontend:** Next.js 15 + React 19
- **Backend:** Supabase (Postgres + pgvector + Auth + Storage)
- **AI:** OpenAI for embeddings
- **Deployment:** Vercel + Supabase Cloud

---

## Getting Started

```bash
# Install dependencies
npm install

# Set up Supabase
npx supabase init
npx supabase start

# Set up environment
cp .env.example .env.local

# Run development
npm run dev
```

---

## Features

### 1. Semantic Search
Vector-based search with pgvector.

### 2. RAG Pipeline
Retrieval-Augmented Generation with Supabase.

### 3. Real-time AI
Live streaming of AI responses.

### 4. Multi-tenant RLS
Isolated data per user with RLS policies.

### 5. AI Agent State
Stream agent progress in real-time.

---

## Database Schema

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents with embeddings
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- HNSW index for fast search
CREATE INDEX ON documents USING hnsw (embedding vector_cosine_ops);

-- RLS policy
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own documents" ON documents
  FOR ALL USING (auth.uid() = user_id);
```

---

## Why I Built This

I use Supabase across my platforms for backend. This repo showcases:

- **pgvector** for semantic search
- **Edge Functions** for serverless AI
- **Realtime** for live updates
- **RLS** for multi-tenant security

---

## Contact

**Cherry Shanaley (Chan)** — cyber.lazer.mermicorn@gmail.com

*AI Solutions Engineer | 9 Production Platforms | Supabase AI Expert*