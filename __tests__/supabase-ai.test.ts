/**
 * Unit tests for supabase-ai.ts
 * These tests use mocks — no live Supabase or OpenAI connection required.
 */
import { describe, expect, it, vi } from 'vitest';

import { generateEmbedding } from '../lib/supabase-ai';

// Mock OpenAI
vi.mock('openai', () => ({
  default: function OpenAI() { return ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: new Array(1536).fill(0.1) }],
      }),
    },
  });
  },
}));

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn().mockReturnValue({
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: 'test-uuid', content: 'test', metadata: {}, created_at: '', updated_at: '' },
        error: null,
      }),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    }),
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
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
