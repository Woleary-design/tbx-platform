-- Allow authenticated sellers to manage only their own files in Asset-images.
-- Seller uploads use the path: <auth.uid()>/<asset_id>/<filename>.

create policy "asset_images_owner_insert"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'Asset-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "asset_images_owner_select"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'Asset-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "asset_images_owner_update"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'Asset-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
)
with check (
  bucket_id = 'Asset-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);

create policy "asset_images_owner_delete"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'Asset-images'
  and (select auth.uid())::text = (storage.foldername(name))[1]
);
