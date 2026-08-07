alter table public.assets
add column if not exists lego_minifigure_id uuid references public.lego_minifigures(id) on delete set null;

create index if not exists assets_lego_minifigure_id_idx
on public.assets(lego_minifigure_id);
