set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_user()
 RETURNS void
 LANGUAGE sql
 SECURITY DEFINER
AS $function$
  delete from auth.users where id = auth.uid();
$function$
;

CREATE OR REPLACE FUNCTION public.is_current_user_seller()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
AS $function$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid() and ur.role = 'seller'
  );
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

drop policy "Admins can add and remove images ut6a19_0" on "storage"."objects";

drop policy "Admins can add and remove images ut6a19_1" on "storage"."objects";

drop policy "Admins can add and remove images ut6a19_2" on "storage"."objects";

drop policy "Allow estate agents to upload images ut6a19_0" on "storage"."objects";

drop policy "agents can delete images ut6a19_0" on "storage"."objects";

drop policy "agents can delete images ut6a19_1" on "storage"."objects";


  create policy "Sellers can insert, update and delete images ut6a19_0"
  on "storage"."objects"
  as permissive
  for update
  to authenticated
using (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_seller()));



  create policy "Sellers can insert, update and delete images ut6a19_1"
  on "storage"."objects"
  as permissive
  for select
  to authenticated
using (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_seller()));



  create policy "Sellers can insert, update and delete images ut6a19_2"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_seller()));



  create policy "Sellers can insert, update and delete images ut6a19_3"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'lighthouse-bucket'::text) AND public.is_current_user_seller()));



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



