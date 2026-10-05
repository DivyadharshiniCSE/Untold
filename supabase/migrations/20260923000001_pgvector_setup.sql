-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector
with
  schema extensions;

-- Create a table to store story embeddings for semantic search
create table if not exists public.story_embeddings (
  id uuid primary key default gen_random_uuid(),
  story_id uuid references public.stories on delete cascade not null,
  embedding vector(768) not null, -- Google Gemini text-embedding-004 uses 768 dimensions
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for embeddings (allow public access like stories)
alter table public.story_embeddings enable row level security;
create policy "Enable full access for anon" on public.story_embeddings for all using (true) with check (true);

-- Create a function to search for emotionally similar stories using cosine similarity
create or replace function match_stories (
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  exclude_story_id uuid default null
)
returns table (
  id uuid,
  title text,
  slug text,
  similarity float
)
language sql stable
as $$
  select
    s.id,
    s.title,
    s.slug,
    1 - (se.embedding <=> query_embedding) as similarity
  from public.story_embeddings se
  join public.stories s on s.id = se.story_id
  where 1 - (se.embedding <=> query_embedding) > match_threshold
    and s.published = true
    and (exclude_story_id is null or s.id != exclude_story_id)
  order by se.embedding <=> query_embedding
  limit match_count;
$$;
