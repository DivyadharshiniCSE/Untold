export async function generateWallpaperUrl(keyword: string): Promise<string> {
  // Using Unsplash Source as a reliable free placeholder for AI generated imagery
  // In a production environment, this would call OpenAI DALL-E or Replicate SD API.
  const query = encodeURIComponent(keyword + ' aesthetic dark cinematic');
  // We add a timestamp or random seed to bypass browser cache
  const seed = Math.floor(Math.random() * 1000000);
  return `https://images.unsplash.com/photo-random?query=${query}&auto=format&fit=crop&q=80&w=1600&h=900&seed=${seed}`;
}
