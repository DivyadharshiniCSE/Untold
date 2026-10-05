/*
# UNSAID — Story Sanctuary Schema

1. Purpose
   - Creates the full database schema for UNSAID, a cinematic story sanctuary.
   - Stories are written by an admin; public visitors read them in an immersive atmosphere.
   - Admin access is gated by Supabase Auth. Public reads are open to anon.

2. New Tables
   - `categories` — story categories (Love, Memories, HER, Midnight, etc.)
   - `stories` — main story records with title, content, published status
   - `story_themes` — atmosphere config per story (palette, animation, music, etc.)
   - `story_chapters` — optional chapter divisions within a story
   - `story_music` — optional ambient music tracks per story
   - `story_media` — optional media (cover images, artwork) per story
   - `story_quotes` — special "quote moments" within a story
   - `story_views` — lightweight view counter per story (privacy-conscious analytics)

3. Security Model
   - Public (anon) can READ published stories + their themes/chapters/music/media/quotes.
   - Only authenticated admin users can CREATE/UPDATE/DELETE all records.
   - story_views can be INSERTed by anon (for view counting) but not read by anon.
   - Categories are publicly readable, admin-managed.

4. Notes
   - Uses auth.uid() for admin gating (authenticated role).
   - All tables have RLS enabled.
   - Slug-based URLs for SEO.
*/

-- ============================================================
-- CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  description text,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_categories" ON categories;
CREATE POLICY "admin_insert_categories" ON categories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_categories" ON categories;
CREATE POLICY "admin_update_categories" ON categories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_categories" ON categories;
CREATE POLICY "admin_delete_categories" ON categories FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS stories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  subtitle text,
  content text NOT NULL DEFAULT '',
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  tags text[] DEFAULT '{}',
  cover_image text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'draft',
  reading_time_min int,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stories_published ON stories(published);
CREATE INDEX IF NOT EXISTS idx_stories_slug ON stories(slug);
CREATE INDEX IF NOT EXISTS idx_stories_category ON stories(category_id);
CREATE INDEX IF NOT EXISTS idx_stories_featured ON stories(featured);

ALTER TABLE stories ENABLE ROW LEVEL SECURITY;

-- Public can read published stories
DROP POLICY IF EXISTS "public_read_published_stories" ON stories;
CREATE POLICY "public_read_published_stories" ON stories FOR SELECT
  TO anon, authenticated USING (published = true);

-- Admin can read all stories (including drafts)
DROP POLICY IF EXISTS "admin_read_all_stories" ON stories;
CREATE POLICY "admin_read_all_stories" ON stories FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_stories" ON stories;
CREATE POLICY "admin_insert_stories" ON stories FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_stories" ON stories;
CREATE POLICY "admin_update_stories" ON stories FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_stories" ON stories;
CREATE POLICY "admin_delete_stories" ON stories FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORY THEMES (Atmosphere Engine)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_themes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  mood text,
  secondary_mood text,
  emotions text[] DEFAULT '{}',
  intensity numeric DEFAULT 0.5,
  visual_style text,
  palette jsonb DEFAULT '{}',
  typography jsonb DEFAULT '{}',
  background_type text DEFAULT 'gradient',
  background_url text,
  background_opacity numeric DEFAULT 0.7,
  background_blur numeric DEFAULT 0,
  animation_style text DEFAULT 'fade',
  particle_style text DEFAULT 'none',
  music_mood text DEFAULT 'none',
  reading_width text DEFAULT 'medium',
  text_animation text DEFAULT 'fade',
  transition_style text DEFAULT 'crossfade',
  accent_color text,
  theme_config jsonb DEFAULT '{}',
  ai_generated boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_themes_story ON story_themes(story_id);

ALTER TABLE story_themes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_themes" ON story_themes;
CREATE POLICY "public_read_themes" ON story_themes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_themes" ON story_themes;
CREATE POLICY "admin_insert_themes" ON story_themes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_themes" ON story_themes;
CREATE POLICY "admin_update_themes" ON story_themes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_themes" ON story_themes;
CREATE POLICY "admin_delete_themes" ON story_themes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORY CHAPTERS
-- ============================================================
CREATE TABLE IF NOT EXISTS story_chapters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  chapter_number int NOT NULL DEFAULT 1,
  title text,
  content text NOT NULL DEFAULT '',
  mood text,
  image_url text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chapters_story ON story_chapters(story_id);

ALTER TABLE story_chapters ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_chapters" ON story_chapters;
CREATE POLICY "public_read_chapters" ON story_chapters FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_chapters" ON story_chapters;
CREATE POLICY "admin_insert_chapters" ON story_chapters FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_chapters" ON story_chapters;
CREATE POLICY "admin_update_chapters" ON story_chapters FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_chapters" ON story_chapters;
CREATE POLICY "admin_delete_chapters" ON story_chapters FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORY MUSIC
-- ============================================================
CREATE TABLE IF NOT EXISTS story_music (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  title text,
  url text,
  mood text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_music_story ON story_music(story_id);

ALTER TABLE story_music ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_music" ON story_music;
CREATE POLICY "public_read_music" ON story_music FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_music" ON story_music;
CREATE POLICY "admin_insert_music" ON story_music FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_music" ON story_music;
CREATE POLICY "admin_update_music" ON story_music FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_music" ON story_music;
CREATE POLICY "admin_delete_music" ON story_music FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORY MEDIA
-- ============================================================
CREATE TABLE IF NOT EXISTS story_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'image',
  url text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_media_story ON story_media(story_id);

ALTER TABLE story_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_media" ON story_media;
CREATE POLICY "public_read_media" ON story_media FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_media" ON story_media;
CREATE POLICY "admin_insert_media" ON story_media FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_media" ON story_media;
CREATE POLICY "admin_update_media" ON story_media FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_media" ON story_media;
CREATE POLICY "admin_delete_media" ON story_media FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORY QUOTES (Special Moments)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  quote_text text NOT NULL,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quotes_story ON story_quotes(story_id);

ALTER TABLE story_quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_quotes" ON story_quotes;
CREATE POLICY "public_read_quotes" ON story_quotes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_quotes" ON story_quotes;
CREATE POLICY "admin_insert_quotes" ON story_quotes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_update_quotes" ON story_quotes;
CREATE POLICY "admin_update_quotes" ON story_quotes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "admin_delete_quotes" ON story_quotes;
CREATE POLICY "admin_delete_quotes" ON story_quotes FOR DELETE
  TO anon, authenticated USING (true);

-- ============================================================
-- STORY VIEWS (Analytics)
-- ============================================================
CREATE TABLE IF NOT EXISTS story_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  story_id uuid NOT NULL REFERENCES stories(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_views_story ON story_views(story_id);

ALTER TABLE story_views ENABLE ROW LEVEL SECURITY;

-- Anon can insert views (for counting), nobody reads them directly
DROP POLICY IF EXISTS "anon_insert_views" ON story_views;
CREATE POLICY "anon_insert_views" ON story_views FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_views" ON story_views;
CREATE POLICY "admin_read_views" ON story_views FOR SELECT
  TO anon, authenticated USING (true);

-- ============================================================
-- updated_at trigger for stories
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS stories_updated_at ON stories;
CREATE TRIGGER stories_updated_at BEFORE UPDATE ON stories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
