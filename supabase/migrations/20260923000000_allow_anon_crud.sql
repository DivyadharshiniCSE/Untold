-- Allow full CRUD for anonymous users (since we use a custom passcode auth)

-- Stories
DROP POLICY IF EXISTS "Enable read access for all users" ON stories;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON stories;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON stories;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON stories;
CREATE POLICY "Enable full access for anon" ON stories FOR ALL USING (true) WITH CHECK (true);

-- Categories
DROP POLICY IF EXISTS "Enable read access for all users" ON categories;
CREATE POLICY "Enable full access for anon" ON categories FOR ALL USING (true) WITH CHECK (true);

-- Story Themes
DROP POLICY IF EXISTS "Enable read access for all users" ON story_themes;
CREATE POLICY "Enable full access for anon" ON story_themes FOR ALL USING (true) WITH CHECK (true);

-- Story Chapters
DROP POLICY IF EXISTS "Enable read access for all users" ON story_chapters;
CREATE POLICY "Enable full access for anon" ON story_chapters FOR ALL USING (true) WITH CHECK (true);

-- Story Music
DROP POLICY IF EXISTS "Enable read access for all users" ON story_music;
CREATE POLICY "Enable full access for anon" ON story_music FOR ALL USING (true) WITH CHECK (true);

-- Story Quotes
DROP POLICY IF EXISTS "Enable read access for all users" ON story_quotes;
CREATE POLICY "Enable full access for anon" ON story_quotes FOR ALL USING (true) WITH CHECK (true);

-- Story Media
DROP POLICY IF EXISTS "Enable read access for all users" ON story_media;
CREATE POLICY "Enable full access for anon" ON story_media FOR ALL USING (true) WITH CHECK (true);
