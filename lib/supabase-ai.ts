import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface Document {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

export interface MatchResult {
  id: string;
  content: string;
  metadata: Record<string, unknown>;
  similarity: number;
}

// ─── Resilience ───────────────────────────────────────────────────────────────

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 500): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, baseDelay * Math.pow(2, attempt)));
      }
    }
  }
  throw lastError ?? new Error('retryWithBackoff: all attempts exhausted');
}

// ─── Embeddings ─────────────────────────────────────────────────────────────

export async function generateEmbedding(text: string): Promise<number[]> {
  return retryWithBackoff(async () => {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  });
}

// ─── CRUD ────────────────────────────────────────────────────────────────────

export async function storeEmbedding(
  content: string,
  embedding: number[],
  metadata: Record<string, unknown> = {}
): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert({ content, embedding, metadata })
    .select()
    .single();
  if (error) throw new Error(`storeEmbedding: ${error.message}`);
  return data as Document;
}

export async function searchDocuments(
  queryEmbedding: number[],
  limit = 5,
  threshold = 0.75
): Promise<MatchResult[]> {
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: limit,
    match_threshold: threshold,
  });
  if (error) throw new Error(`searchDocuments: ${error.message}`);
  return (data ?? []) as MatchResult[];
}

export async function getDocuments(): Promise<Document[]> {
  const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
  if (error) throw new Error(`getDocuments: ${error.message}`);
  return (data ?? []) as Document[];
}

export async function deleteDocument(id: string): Promise<{ success: boolean }> {
  const { error } = await supabase.from('documents').delete().eq('id', id);
  if (error) throw new Error(`deleteDocument: ${error.message}`);
  return { success: true };
}

export async function updateDocument(id: string, content: string): Promise<Document> {
  const embedding = await generateEmbedding(content);
  const { data, error } = await supabase
    .from('documents')
    .update({ content, embedding, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`updateDocument: ${error.message}`);
  return data as Document;
}
