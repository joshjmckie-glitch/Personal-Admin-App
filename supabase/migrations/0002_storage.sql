-- Storage bucket for recipe photos.
insert into storage.buckets (id, name, public)
values ('recipe-photos', 'recipe-photos', true)
on conflict (id) do nothing;

-- Owners can manage files inside their own folder: recipe-photos/{user_id}/...
create policy "recipe_photos_select_own"
on storage.objects for select
using (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "recipe_photos_insert_own"
on storage.objects for insert
with check (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "recipe_photos_update_own"
on storage.objects for update
using (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "recipe_photos_delete_own"
on storage.objects for delete
using (bucket_id = 'recipe-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- Bucket is public for read (simplest for an <img> src on a single-user app);
-- write access is still restricted to the owner's own folder above.
