alter table "public"."estate_agent_profiles" drop constraint "estate_agent_profiles_estate_agency_id_fkey";

drop function if exists "public"."upgrade_user_to_agent"(p_user_id uuid, p_agency_id uuid, p_admin_id uuid);

alter table "public"."estate_agent_profiles" drop column "estate_agency_id";

alter table "public"."estate_agent_profiles" add column "estate_agency_location_id" uuid;

alter table "public"."properties" add column "agent_id" uuid;

alter table "public"."properties" add column "last_updated_at" timestamp with time zone;

alter table "public"."properties" add column "status" text not null default 'active'::text;

alter table "public"."estate_agent_profiles" add constraint "estate_agent_profiles_estate_agency_location_id_fkey" FOREIGN KEY (estate_agency_location_id) REFERENCES public.estate_agency_location(location_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."estate_agent_profiles" validate constraint "estate_agent_profiles_estate_agency_location_id_fkey";

alter table "public"."properties" add constraint "properties_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.estate_agent_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."properties" validate constraint "properties_agent_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.upgrade_user_to_agent(p_user_id uuid, p_location_id uuid, p_admin_id uuid)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO user_roles (user_id, role, granted_by)
  VALUES (p_user_id, 'agent', p_admin_id);

  INSERT INTO estate_agent_profiles (id, estate_agency_location_id)
  VALUES (p_user_id, p_location_id);
END;
$function$
;

CREATE OR REPLACE FUNCTION public.getagencylocationdetails(p_id uuid)
 RETURNS TABLE(name text, phone_number text, email text, logo_url text, address_line_1 text, address_line_2 text, city text, post_code text)
 LANGUAGE plpgsql
AS $function$
begin
  return query

  select ea.name, el.phone_number, el.email_address, ea.logo_url, el.address_line_1, el.address_line_2, el.city, el.post_code

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

  if new.user_metadata ? 'role' then
  insert into user_roles(user_id, role, granted_by)
  values (new.id, new.user_metadata->>'role', new.user_metadata->>'granted_by');

  if new.user_metadata->'role' = 'agent' then
  insert into estate_agent_profiles(id, estate_agency_location_id)
  values (new.id, new.user_metadata->>'location_id');
  end if;
  end if;
  return new;
end;
$function$
;

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


