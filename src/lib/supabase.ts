import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  detectSessionInUrl: true,
  storageKey: 'unsaid-auth',
  storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  flowType: 'implicit',
  debug: false,
  },
});

export type Story = {
  id: string;
  title: string;
  slug: string;
  subtitle: string | null;
  content: string;
  category_id: string | null;
  tags: string[];
  cover_image: string | null;
  featured: boolean;
  published: boolean;
  status: string;
  reading_time_min: number | null;
  created_at: string;
  updated_at: string;
  category?: Category | null;
  theme?: StoryTheme | null;
  chapters?: StoryChapter[];
  music?: StoryMusic | null;
  quotes?: StoryQuote[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
};

export type StoryTheme = {
  id: string;
  story_id: string;
  mood: string | null;
  secondary_mood: string | null;
  emotions: string[];
  intensity: number;
  visual_style: string | null;
  palette: Record<string, string>;
  typography: Record<string, string>;
  background_type: string;
  background_url: string | null;
  background_opacity: number;
  background_blur: number;
  animation_style: string;
  particle_style: string;
  music_mood: string;
  reading_width: string;
  text_animation: string;
  transition_style: string;
  accent_color: string | null;
  theme_config: Record<string, unknown>;
  ai_generated: boolean;
};

export type StoryChapter = {
  id: string;
  story_id: string;
  chapter_number: number;
  title: string | null;
  content: string;
  mood: string | null;
  image_url: string | null;
};

export type StoryMusic = {
  id: string;
  story_id: string;
  title: string | null;
  url: string | null;
  mood: string | null;
};

export type StoryQuote = {
  id: string;
  story_id: string;
  quote_text: string;
  display_order: number;
};

export type StoryMedia = {
  id: string;
  story_id: string;
  type: string;
  url: string;
  metadata: Record<string, unknown>;
};
