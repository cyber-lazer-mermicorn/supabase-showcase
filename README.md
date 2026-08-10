# Supabase Commerce Platform
## Built by Cherry Barton | AI Solutions Engineer

A full-stack commerce platform powered by Supabase: Auth, Database, Realtime, and Edge Functions.

**Live:** https://supabase-showcase.lazermermicorn.com

---

## What This Demonstrates

### Supabase Auth
- Email/password authentication
- Social login (Google, GitHub)
- Row Level Security (RLS)
- Session management

### Supabase Database
- PostgreSQL with pgvector
- Real-time subscriptions
- Database functions
- Automatic API generation

### Supabase Edge Functions
- Serverless functions at the edge
- Stripe webhook handling
- AI inference at the edge

### Supabase Storage
- File uploads with CDN
- Image transformations
- Access control

---

## Tech Stack

- **Frontend:** Next.js 14 + Tailwind CSS
- **Backend:** Supabase (Postgres, Auth, Storage, Edge Functions)
- **Payments:** Stripe
- **AI:** OpenAI via Edge Functions
- **Deployment:** Vercel

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
# Add your Supabase keys

# Run development
npm run dev
```

---

## Features

### 1. Authentication
- Email/password signup/login
- Social auth (Google, GitHub)
- Protected routes with RLS

### 2. Product Catalog
- Real-time product updates
- Search with full-text search
- Image optimization

### 3. Shopping Cart
- Persistent cart with Supabase
- Real-time sync across devices
- Guest checkout

### 4. Payments
- Stripe checkout integration
- Subscription management
- Webhook handling

### 5. AI Recommendations
- Product recommendations via AI
- Semantic search with pgvector
- Personalized experiences

---

## Database Schema

```sql
-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  embedding VECTOR(1536), -- pgvector for AI search
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Products are viewable by everyone" ON products FOR SELECT USING (true);
```

---

## Why I Built This

I've built 9 production platforms, many using Supabase. This repo showcases:

- **Auth** for user management
- **Database** for data storage
- **Realtime** for live updates
- **Edge Functions** for serverless logic

---

## Contact

**Cherry Barton** — cherry@lazermermicorn.com

*AI Solutions Engineer | 9 Production Platforms | Supabase Power User*