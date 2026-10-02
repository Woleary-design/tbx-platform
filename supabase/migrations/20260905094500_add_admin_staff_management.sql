create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id),
  target_id uuid references auth.users(id),
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.admin_audit_log enable row level security;

create policy "Owners can read admin audit log"
on public.admin_audit_log for select to authenticated
using (
  exists (
    select 1 from public.admin_users au
    where au.id = auth.uid() and au.role = 'super_admin'
  )
);

create or replace function public.list_admin_staff()
returns table (
  id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $function$
begin
  if not exists (
    select 1 from public.admin_users au
    where au.id = auth.uid() and au.role = 'super_admin'
  ) then
    raise exception 'Owner access required';
  end if;

  return query
  select au.id, u.email::text, c.display_name, au.role, au.created_at, u.last_sign_in_at
  from public.admin_users au
  join auth.users u on u.id = au.id
  left join public.collectors c on c.id = au.id
  order by case when au.role = 'super_admin' then 0 else 1 end, au.created_at;
end;
$function$;

create or replace function public.manage_admin_staff(target_email text, target_role text, remove_access boolean default false)
returns uuid
language plpgsql
security definer
set search_path = ''
as $function$
declare
  target_user_id uuid;
  normalised_email text := lower(trim(target_email));
  normalised_role text := lower(trim(target_role));
begin
  if not exists (
    select 1 from public.admin_users au
    where au.id = auth.uid() and au.role = 'super_admin'
  ) then
    raise exception 'Owner access required';
  end if;

  select u.id into target_user_id from auth.users u where lower(u.email) = normalised_email limit 1;
  if target_user_id is null then raise exception 'TBX account not found'; end if;

  if remove_access then
    if target_user_id = auth.uid() then raise exception 'You cannot remove your own Owner access'; end if;
    delete from public.admin_users where id = target_user_id and role <> 'super_admin';
    insert into public.admin_audit_log(actor_id, target_id, action, details)
    values(auth.uid(), target_user_id, 'staff.access_removed', jsonb_build_object('email', normalised_email));
  else
    if normalised_role not in ('operations', 'technical', 'support', 'finance') then raise exception 'Invalid staff role'; end if;
    if exists (select 1 from public.admin_users where id = target_user_id and role = 'super_admin') then raise exception 'Owner role cannot be changed here'; end if;
    insert into public.admin_users(id, role) values(target_user_id, normalised_role)
    on conflict (id) do update set role = excluded.role;
    insert into public.admin_audit_log(actor_id, target_id, action, details)
    values(auth.uid(), target_user_id, 'staff.role_updated', jsonb_build_object('email', normalised_email, 'role', normalised_role));
  end if;

  return target_user_id;
end;
$function$;

revoke all on function public.list_admin_staff() from public, anon;
revoke all on function public.manage_admin_staff(text, text, boolean) from public, anon;
grant execute on function public.list_admin_staff() to authenticated;
grant execute on function public.manage_admin_staff(text, text, boolean) to authenticated;
