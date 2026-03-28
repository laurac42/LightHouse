alter table "public"."properties" add column "latitude" numeric;

alter table "public"."properties" add column "longitude" numeric;

set check_function_bodies = off;

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


