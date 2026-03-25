set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_users_favourite_properties()
 RETURNS SETOF public.properties
 LANGUAGE plpgsql
AS $function$
begin

  select p.*

  from buyer_favourites bf

  join properties p on p.id = bf.property_id

  where bf.buyer_id = auth.uid();

end;
$function$
;


  create policy "Enable users to do anything with their own data only"
  on "public"."buyer_favourites"
  as permissive
  for all
  to authenticated
using ((( SELECT auth.uid() AS uid) = buyer_id));



