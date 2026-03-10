drop function if exists "public"."getagencylocationdetails"(p_id uuid);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.getagencylocationdetails(p_id uuid)
 RETURNS TABLE(name text, phone_number text, email text, logo_url text, address_line_1 text, address_line_2 text, city text, post_code text)
 LANGUAGE plpgsql
AS $function$
begin
  return query

  select el.phone_number, el.email_address, ea.logo_url, ea.name, el.address_line_1, el.address_line_2, el.city, el.post_code

  from estate_agency_location el

  join estate_agencies ea on ea.id = el.estate_agency_id

  where el.location_id = p_id

  limit 1;
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
  insert into public.estate_agent_profiles(id, estate_agency_id)
  values (new.id, (new.raw_user_meta_data->>'agency_id')::uuid);
  end if;
  end if;
  return new;
end;
$function$
;


  create policy "Enable read access for all users"
  on "public"."estate_agency_location"
  as permissive
  for select
  to public
using (true);



