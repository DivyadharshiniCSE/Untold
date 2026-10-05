import { supabase } from './supabase';
import type { Story, StoryTheme, StoryChapter, StoryMusic, StoryQuote, Category } from './supabase';

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function fetchPublishedStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*),
      theme:story_themes(*)
    `)
    .eq('published', true)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Story[];
}

export async function fetchFeaturedStory(): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*),
      theme:story_themes(*)
    `)
    .eq('published', true)
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data as Story | null;
}

export async function fetchStoryBySlug(slug: string): Promise<Story | null> {
  const { data: storyData, error: storyError } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*),
      theme:story_themes(*)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle();

  if (storyError) throw storyError;
  if (!storyData) return null;

  const story = storyData as Story;

  const [chapters, music, quotes] = await Promise.all([
    supabase.from('story_chapters').select('*').eq('story_id', story.id).order('chapter_number', { ascending: true }),
    supabase.from('story_music').select('*').eq('story_id', story.id).limit(1).maybeSingle(),
    supabase.from('story_quotes').select('*').eq('story_id', story.id).order('display_order', { ascending: true }),
  ]);

  story.chapters = (chapters.data || []) as StoryChapter[];
  story.music = (music.data || null) as StoryMusic | null;
  story.quotes = (quotes.data || []) as StoryQuote[];

  // Increment view count (fire and forget)
  supabase.from('story_views').insert({ story_id: story.id }).then(() => {});

  return story;
}

export async function fetchStoriesByCategory(categorySlug: string): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*),
      theme:story_themes(*)
    `)
    .eq('published', true)
    .eq('category.slug', categorySlug)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Story[];
}

export async function fetchRelatedStories(storyId: string, categoryId: string | null, limit = 3): Promise<Story[]> {
  let query = supabase
    .from('stories')
    .select(`
      *,
      category:categories(*),
      theme:story_themes(*)
    `)
    .eq('published', true)
    .neq('id', storyId)
    .limit(limit);

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as Story[];
}

// Admin functions
export async function fetchAllStories(): Promise<Story[]> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*),
      theme:story_themes(*)
    `)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data || []) as Story[];
}

export async function fetchAdminStoryBySlug(slug: string): Promise<Story | null> {
  const { data, error } = await supabase
    .from('stories')
    .select(`
      *,
      category:categories(*),
      theme:story_themes(*)
    `)
    .eq('slug', slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const story = data as Story;
  const [chapters, music, quotes] = await Promise.all([
    supabase.from('story_chapters').select('*').eq('story_id', story.id).order('chapter_number', { ascending: true }),
    supabase.from('story_music').select('*').eq('story_id', story.id).limit(1).maybeSingle(),
    supabase.from('story_quotes').select('*').eq('story_id', story.id).order('display_order', { ascending: true }),
  ]);

  story.chapters = (chapters.data || []) as StoryChapter[];
  story.music = (music.data || null) as StoryMusic | null;
  story.quotes = (quotes.data || []) as StoryQuote[];

  return story;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function estimateReadingTime(content: string): number {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}
