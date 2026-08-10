import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Store embedding
export async function storeEmbedding(document: string, embedding: number[]) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({ content: document, embedding })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(`Store embedding error: ${error?.message || 'Unknown error'}`);
  }
}

// Search similar documents
export async function searchDocuments(queryEmbedding: number[], limit = 5) {
  try {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_count: limit,
    });

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(`Search error: ${error?.message || 'Unknown error'}`);
  }
}

// Delete document
export async function deleteDocument(id: string) {
  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    throw new Error(`Delete error: ${error?.message || 'Unknown error'}`);
  }
}

// Get all documents
export async function getDocuments() {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*');

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(`Get documents error: ${error?.message || 'Unknown error'}`);
  }
}

// Update document
export async function updateDocument(id: string, content: string) {
  try {
    const { data, error } = await supabase
      .from('documents')
      .update({ content })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error: any) {
    throw new Error(`Update error: ${error?.message || 'Unknown error'}`);
  }
}
