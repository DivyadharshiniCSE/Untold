import { supabase } from '../supabase';

export async function generateAndSaveEmbedding(storyId: string, title: string, content: string): Promise<void> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return;

  const textToEmbed = `Title: ${title}\n\nContent: ${content}`.substring(0, 5000);

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: textToEmbed }] }
      })
    });

    if (!response.ok) throw new Error('Failed to generate embedding');
    const data = await response.json();
    const embedding = data.embedding.values;

    // Save to Supabase pgvector table
    const { error } = await supabase.from('story_embeddings').insert({
      story_id: storyId,
      embedding: embedding
    });
    if (error) console.error("Error saving embedding to Supabase:", error);
  } catch (e) {
    console.error("Embedding generation failed", e);
  }
}
