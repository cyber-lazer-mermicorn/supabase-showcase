/**
 * Unit tests for supabase-ai.ts
 * These tests use mocks — no live Supabase or OpenAI connection required.
 */
import { generateEmbedding } from '../lib/supabase-ai';

// Mock OpenAI
jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    embeddings: {
      create: jest.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    },
  }));
});

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { id: 'test-uuid', content: 'test', metadata: {}, created_at: '', updated_at: '' },
        error: null,
      }),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
      update: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [], error: null }),
    }),
    rpc: jest.fn().mockResolvedValue({ data: [], error: null }),
  }),
}));

describe('generateEmbedding', () => {
  it('returns a 1536-dimension vector', async () => {
    const embedding = await generateEmbedding('hello world');
    expect(embedding).toHaveLength(1536);
    expect(typeof embedding[0]).toBe('number');
  });

  it('returns consistent dimension for long input', async () => {
    const embedding = await generateEmbedding('x'.repeat(5000));
    expect(embedding).toHaveLength(1536);
  });
});
