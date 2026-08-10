import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// pgvector — Store embeddings in PostgreSQL
export async function storeEmbedding(content: string, metadata: any = {}) {
  // Generate embedding with OpenAI
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: content,
  });

  const embedding = embeddingResponse.data[0].embedding;

  // Store in Supabase with pgvector
  const { data, error } = await supabase
    .from('documents')
    .insert({
      content,
      embedding,
      metadata,
      user_id: metadata.user_id,
    })
    .select();

  if (error) throw error;
  return data[0];
}

// Semantic search — Find similar documents
export async function semanticSearch(query: string, limit = 5) {
  // Generate query embedding
  const embeddingResponse = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  });

  const queryEmbedding = embeddingResponse.data[0].embedding;

  // Search with pgvector
  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_threshold: 0.7,
    match_count: limit,
  });

  if (error) throw error;
  return data;
}

// RAG Pipeline — Retrieval-Augmented Generation
export async function ragQuery(query: string) {
  // Step 1: Retrieve relevant documents
  const documents = await semanticSearch(query, 3);
  
  // Step 2: Build context
  const context = documents
    .map((doc: any) => doc.content)
    .join('\n\n');

  // Step 3: Generate answer with context
  const response = await openai.chat.completions.create({
    model: 'gpt-5.6-luna',
    messages: [
      {
        role: 'system',
        content: `You are a helpful AI assistant. Use the following context to answer the user's question:\n\n${context}`,
      },
      {
        role: 'user',
        content: query,
      },
    ],
    stream: true,
  });

  return response;
}

// Real-time — Stream AI responses
export function subscribeToAgentEvents(callback: (event: any) => void) {
  const channel = supabase
    .channel('agent-events')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'agent_events' },
      (payload) => callback(payload.new)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

// RLS — Multi-tenant data isolation
export async function getUserDocuments(userId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}