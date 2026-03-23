drop function if exists "public"."fetch_agents_by_location_id"(p_agency_id text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_agents_by_location_id(p_agency_id uuid)
 RETURNS TABLE(first_name text, last_name text, id uuid)
 LANGUAGE plpgsql
AS $function$
begin
  return query

  select ur.first_name, ur.last_name, ep.id

  from estate_agent_profiles ep

  join users ur on ep.id = ur.id

  where ep.estate_agency_location_id = p_agency_id

  limit 1;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.is_seller_by_email(p_email text)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
begin
return exists (

  select 1 

  from users u 

  join user_roles ur on u.id = ur.user_id

  where p_email = u.email and ur.role = 'seller'

  limit 1
);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  if new.raw_user_meta_data ? 'role' then
  insert into public.user_roles(user_id, role, granted_by)
  values (new.id, new.raw_user_meta_data->>'role', (new.raw_user_meta_data->>'granted_by')::uuid);

  if new.raw_user_meta_data->>'role' = 'agent' then
  insert into public.estate_agent_profiles(id, estate_agency_location_id)
  values (new.id, (new.raw_user_meta_data->>'location_id')::uuid);
  end if;
  end if;
  return new;
end;
$function$
;


