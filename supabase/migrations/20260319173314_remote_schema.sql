set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_agents_by_location_id(p_agency_id text)
 RETURNS TABLE(first_name text, last_name text, id text)
 LANGUAGE plpgsql
AS $function$
begin
  return query

  select ep.id

  from estate_agent_profiles ep

  join users ur on ep.id = ur.id

  where ep.estate_agency_location_id = p_agency_id

  limit 1;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.fetchagentdetailsbyagencyid(p_agency_id text)
 RETURNS TABLE(first_name text, last_name text, id text)
 LANGUAGE plpgsql
AS $function$
begin
  return query

  select ep.id

  from estate_agent_profiles ep

  join users ur on ep.id = ur.id

  where ep.estate_agency_location_id = p_agency_id

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
  insert into public.estate_agent_profiles(id, estate_agency_location_id)
  values (new.id, (new.raw_user_meta_data->>'location_id')::uuid);
  end if;
  end if;
  return new;
end;
$function$
;


  create policy "Admins can do anything"
  on "public"."properties"
  as permissive
  for all
  to authenticated
using (public.is_current_user_admin());



  create policy "Agents can add properties"
  on "public"."properties"
  as permissive
  for insert
  to authenticated
with check ((public.is_current_user_agent() AND (agent_id = auth.uid())));



  create policy "Estate agents can update their properties"
  on "public"."properties"
  as permissive
  for update
  to public
using ((public.is_current_user_agent() AND (agent_id = auth.uid())))
with check ((public.is_current_user_agent() AND (agent_id = auth.uid())));



  create policy "Admins can add and remove images ut6a19_0"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_admin()));



  create policy "Admins can add and remove images ut6a19_1"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_admin()));



  create policy "Admins can add and remove images ut6a19_2"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_admin()));



  create policy "Allow estate agents to upload images ut6a19_0"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_agent()));



  create policy "agents can delete images ut6a19_0"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_agent()));



  create policy "agents can delete images ut6a19_1"
  on "storage"."objects"
  as permissive
  for select
  to public
using (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_agent()));



