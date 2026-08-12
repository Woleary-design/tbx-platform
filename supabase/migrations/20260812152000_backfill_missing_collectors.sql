-- Repair authenticated accounts created before the collector provisioning trigger existed.
insert into public.collectors (
  id,
  username,
  display_name,
  avatar_url
)
select
  user_record.id,
  concat(
    coalesce(
      nullif(trim(user_record.raw_user_meta_data ->> 'username'), ''),
      nullif(split_part(user_record.email, '@', 1), ''),
      'collector'
    ),
    '-',
    left(replace(user_record.id::text, '-', ''), 8)
  ),
  coalesce(
    nullif(trim(user_record.raw_user_meta_data ->> 'display_name'), ''),
    nullif(trim(user_record.raw_user_meta_data ->> 'full_name'), ''),
    nullif(split_part(user_record.email, '@', 1), ''),
    'TBX Collector'
  ),
  user_record.raw_user_meta_data ->> 'avatar_url'
from auth.users as user_record
where not exists (
  select 1
  from public.collectors as collector
  where collector.id = user_record.id
)
on conflict (id) do nothing;
