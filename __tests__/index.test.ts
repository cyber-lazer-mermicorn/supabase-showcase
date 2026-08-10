import { storeEmbedding } from '../lib/supabase-ai';

describe('storeEmbedding', () => {
  it('should be defined', () => {
    expect(storeEmbedding).toBeDefined();
  });

  it('should be a function', () => {
    expect(typeof storeEmbedding).toBe('function');
  });
});
