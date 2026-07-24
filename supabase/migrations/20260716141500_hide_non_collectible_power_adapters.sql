update public.lego_sets
set product_type = 'gear',
    atlas_status = 'hidden',
    is_active = false,
    updated_at = now()
where lower(coalesce(name,'')) ~ '\m(usb power adapter|power adapter)\M';

create or replace function public.prevent_non_collectible_atlas_visibility()
returns trigger
language plpgsql
as $$
begin
  if lower(coalesce(new.name,'')) ~ '\m(usb power adapter|power adapter)\M' then
    new.product_type := 'gear';
    new.atlas_status := 'hidden';
    new.is_active := false;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_prevent_non_collectible_atlas_visibility on public.lego_sets;
create trigger trg_prevent_non_collectible_atlas_visibility
before insert or update of name, product_type, atlas_status, is_active
on public.lego_sets
for each row execute function public.prevent_non_collectible_atlas_visibility();
