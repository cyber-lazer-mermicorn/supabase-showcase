/**
 * RAG pipeline — ingest documents and answer queries with retrieved context.
 * Uses: OpenAI text-embedding-3-small → Supabase pgvector → OpenAI gpt-4o
 */
import OpenAI from 'openai';
import { generateEmbedding, searchDocuments, storeEmbedding } from './supabase-ai';
import type { MatchResult } from './supabase-ai';

let openai: OpenAI | undefined;

function getOpenAIClient(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is required.');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface IngestResult {
  id: string;
  content: string;
  chunkIndex: number;
}

export interface RAGResponse {
  answer: string;
  sources: MatchResult[];
  tokensUsed: number;
}

// Naive chunker — replace with a semantic chunker for production.
function chunkText(text: string, maxChunkChars = 800): string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += maxChunkChars) {
    chunks.push(text.slice(i, i + maxChunkChars).trim());
  }
  return chunks.filter(Boolean);
}

/**
 * Ingest a document into the vector store.
 * Splits into chunks, embeds each, and stores with metadata.
 */
export async function ingestDocument(
  content: string,
  metadata: Record<string, unknown> = {}
): Promise<IngestResult[]> {
  const chunks = chunkText(content);
  const results: IngestResult[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const embedding = await generateEmbedding(chunks[i]);
    const stored = await storeEmbedding(chunks[i], embedding, { ...metadata, chunkIndex: i });
    results.push({ id: stored.id, content: chunks[i], chunkIndex: i });
  }

  return results;
}

/**
 * Answer a query using retrieved document context (RAG).
 */
export async function ragQuery(
  query: string,
  options: { limit?: number; threshold?: number } = {}
): Promise<RAGResponse> {
  const { limit = 5, threshold = 0.75 } = options;

  // 1. Embed the query
  const queryEmbedding = await generateEmbedding(query);

  // 2. Retrieve relevant chunks
  const sources = await searchDocuments(queryEmbedding, limit, threshold);

  // 3. Build context string
  const context = sources
    .map((s, i) => `[Source ${i + 1}] (similarity: ${s.similarity.toFixed(3)})\n${s.content}`)
    .join('\n\n');

  // 4. Generate answer with GPT-4o
  const completion = await getOpenAIClient().chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'You are a precise AI assistant. Answer the user\'s question using only the provided context. ' +
          'If the context does not contain enough information, say so clearly. ' +
          'Cite sources by their [Source N] label.',
      },
      {
        role: 'user',
        content: `Context:\n${context}\n\nQuestion: ${query}`,
      },
    ],
    temperature: 0.2,
  });

  const answer = completion.choices[0]?.message?.content ?? 'No answer generated.';
  const tokensUsed = completion.usage?.total_tokens ?? 0;

  return { answer, sources, tokensUsed };
}
