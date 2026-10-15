-- Preserve ranked catalogue search while enforcing curation at the RPC boundary.
-- No private catalogue records should be returned by this public read endpoint.
do $guard$
declare definition text;
begin
 definition := pg_get_functiondef('public.atlas_search(text,integer)'::regprocedure);
 if position('where s.is_active = true' in definition) = 0 then
  raise exception 'Atlas search definition changed; review before applying visibility guard';
 end if;
 if position('s.atlas_visibility' in definition) = 0 then
  execute replace(definition, 'where s.is_active = true', 'where s.is_active = true and s.atlas_visibility = ''public''');
 end if;
end;
$guard$;
