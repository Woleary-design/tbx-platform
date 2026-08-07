create or replace function public.atlas_prepare_catalogue_refresh(refresh_time timestamptz)
returns void
language plpgsql
security definer
set search_path = public
set statement_timeout = '0'
as $$
begin
  update public.lego_sets
  set is_active = false, updated_at = refresh_time
  where external_source = 'rebrickable' and is_active = true;

  update public.lego_minifigures
  set is_active = false, updated_at = refresh_time
  where source = 'rebrickable' and is_active = true;
end;
$$;

revoke all on function public.atlas_prepare_catalogue_refresh(timestamptz) from public, anon, authenticated;
grant execute on function public.atlas_prepare_catalogue_refresh(timestamptz) to service_role;
