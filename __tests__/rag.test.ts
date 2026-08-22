/**
 * Unit tests for RAG pipeline
 * Mocks all external dependencies.
 */

import { describe, expect, it, vi } from 'vitest';

// Mock supabase-ai before importing rag
vi.mock('../lib/supabase-ai', () => ({
  generateEmbedding: vi.fn().mockResolvedValue(new Array(1536).fill(0.1)),
  searchDocuments: vi.fn().mockResolvedValue([
    { id: 'doc-1', content: 'Supabase provides pgvector for vector search.', metadata: {}, similarity: 0.92 },
    { id: 'doc-2', content: 'HNSW indexing enables fast approximate nearest-neighbor queries.', metadata: {}, similarity: 0.87 },
  ]),
  storeEmbedding: vi.fn().mockResolvedValue({
    id: 'stored-uuid',
    content: 'test chunk',
    metadata: { chunkIndex: 0 },
    created_at: '',
    updated_at: '',
  }),
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: function OpenAI() { return ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'Supabase supports pgvector via the vector extension.' } }],
          usage: { total_tokens: 312 },
        }),
      },
    },
    embeddings: {
        create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    },
  });
  },
}));

import { ragQuery, ingestDocument } from '../lib/rag';

describe('ragQuery', () => {
  it('returns answer and sources', async () => {
    const result = await ragQuery('What is pgvector?');
    expect(result.answer).toBeTruthy();
    expect(Array.isArray(result.sources)).toBe(true);
    expect(result.sources.length).toBeGreaterThan(0);
    expect(typeof result.tokensUsed).toBe('number');
  });

  it('sources include similarity scores', async () => {
    const result = await ragQuery('HNSW indexing');
    for (const source of result.sources) {
      expect(typeof source.similarity).toBe('number');
      expect(source.similarity).toBeGreaterThan(0);
    }
  });
});

describe('ingestDocument', () => {
  it('chunks and stores a document', async () => {
    const results = await ingestDocument('Short content.');
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]).toHaveProperty('id');
    expect(results[0]).toHaveProperty('chunkIndex');
  });
});
