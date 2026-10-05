-- Setup storage bucket for story cover images
insert into storage.buckets (id, name, public) values ('story_media', 'story_media', true)
on conflict (id) do nothing;

-- Set up security policies for the bucket
drop policy if exists "Public Access" on storage.objects;
create policy "Public Access" on storage.objects for select using ( bucket_id = 'story_media' );

drop policy if exists "Anon Upload" on storage.objects;
create policy "Anon Upload" on storage.objects for insert with check ( bucket_id = 'story_media' );
