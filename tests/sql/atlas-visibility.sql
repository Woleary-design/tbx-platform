begin;
do $$
declare target_id uuid;
begin
 select id into strict target_id from public.lego_sets where set_number='42110' and atlas_visibility='public' limit 1;
 if not exists(select 1 from public.atlas_search('42110',40) where id=target_id) then raise exception 'FAIL: public exact search missing'; end if;
 update public.lego_sets set atlas_visibility='hidden' where id=target_id;
 if exists(select 1 from public.atlas_search('42110',100) where id=target_id) then raise exception 'FAIL: hidden catalogue result exposed'; end if;
end $$;
rollback;
select 'PASS: public exact search retained, hidden record excluded; changes rolled back' as result;
