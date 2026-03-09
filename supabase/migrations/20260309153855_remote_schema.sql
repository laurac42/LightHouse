alter table "public"."properties" drop column "schedule_url";

alter table "public"."properties" alter column "agency_location_id" drop not null;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.getagencylocationdetails(p_id uuid)
 RETURNS TABLE(phone_number text, email text, logo_url text)
 LANGUAGE plpgsql
AS $function$
begin
  return query

  select el.phone_number, el.email_address, ea.logo_url

  from estate_agency_location el

  join estate_agencies ea on ea.id = p_id

  where el.estate_agency_id = p_id

  limit 1;
end;
$function$
;


  create policy "Enable read access for all users"
  on "public"."properties"
  as permissive
  for select
  to public
using (true);



  create policy "allow all users to view all image ut6a19_0"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'lighthouse-bucket'::text));



