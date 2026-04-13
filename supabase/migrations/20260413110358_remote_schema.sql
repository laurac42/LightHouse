drop policy "admins can create profiles" on "public"."estate_agent_profiles";

drop policy "admins can do anything" on "public"."estate_agent_profiles";

drop policy "Admins can do anything" on "public"."properties";

drop policy "Agents can add properties" on "public"."properties";

drop policy "Estate agents can update their properties" on "public"."properties";

drop policy "Sellers can edit and add to their own properties" on "public"."property_seller_info";

drop policy "admins can insert estate agents" on "public"."user_roles";

drop policy "admins can select all data" on "public"."user_roles";

drop policy "agents can insert sellers" on "public"."user_roles";

drop policy "agents can select all sellers" on "public"."user_roles";

drop policy "admins can select all data" on "public"."users";

drop policy "agents can select users they added" on "public"."users";

alter table "public"."buyer_favourites" drop constraint "buyer_favourites_buyer_id_fkey";

alter table "public"."buyer_favourites" drop constraint "buyer_favourites_property_id_fkey";

alter table "public"."buyer_profiles" drop constraint "buyers_id_fkey";

alter table "public"."estate_agency_location" drop constraint "estate_agency_location_estate_agency_id_fkey";

alter table "public"."estate_agent_profiles" drop constraint "estate_agent_profiles_estate_agency_location_id_fkey";

alter table "public"."estate_agent_profiles" drop constraint "estate_agent_profiles_id_fkey";

alter table "public"."properties" drop constraint "properties_agency_location_id_fkey";

alter table "public"."properties" drop constraint "properties_agent_id_fkey";

alter table "public"."properties" drop constraint "properties_seller_id_fkey";

alter table "public"."property_seller_info" drop constraint "property_seller_info_id_fkey";

alter table "public"."property_tags" drop constraint "property_tags_property_id_fkey";

alter table "public"."property_tags" drop constraint "property_tags_tag_id_fkey";

alter table "public"."property_tags" drop constraint "property_tags_user_id_fkey";

alter table "public"."user_locations" drop constraint "user_locations_user_id_fkey";

alter table "public"."user_roles" drop constraint "user_roles_user_id_fkey";

alter table "public"."user_locations" add column "latitude" numeric not null;

alter table "public"."user_locations" add column "longitude" numeric not null;

alter table "public"."buyer_favourites" add constraint "buyer_favourites_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES public.users(id) not valid;

alter table "public"."buyer_favourites" validate constraint "buyer_favourites_buyer_id_fkey";

alter table "public"."buyer_favourites" add constraint "buyer_favourites_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."buyer_favourites" validate constraint "buyer_favourites_property_id_fkey";

alter table "public"."buyer_profiles" add constraint "buyers_id_fkey" FOREIGN KEY (id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."buyer_profiles" validate constraint "buyers_id_fkey";

alter table "public"."estate_agency_location" add constraint "estate_agency_location_estate_agency_id_fkey" FOREIGN KEY (estate_agency_id) REFERENCES public.estate_agencies(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."estate_agency_location" validate constraint "estate_agency_location_estate_agency_id_fkey";

alter table "public"."estate_agent_profiles" add constraint "estate_agent_profiles_estate_agency_location_id_fkey" FOREIGN KEY (estate_agency_location_id) REFERENCES public.estate_agency_location(location_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."estate_agent_profiles" validate constraint "estate_agent_profiles_estate_agency_location_id_fkey";

alter table "public"."estate_agent_profiles" add constraint "estate_agent_profiles_id_fkey" FOREIGN KEY (id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."estate_agent_profiles" validate constraint "estate_agent_profiles_id_fkey";

alter table "public"."properties" add constraint "properties_agency_location_id_fkey" FOREIGN KEY (agency_location_id) REFERENCES public.estate_agency_location(location_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_agency_location_id_fkey";

alter table "public"."properties" add constraint "properties_agent_id_fkey" FOREIGN KEY (agent_id) REFERENCES public.estate_agent_profiles(id) ON DELETE SET NULL not valid;

alter table "public"."properties" validate constraint "properties_agent_id_fkey";

alter table "public"."properties" add constraint "properties_seller_id_fkey" FOREIGN KEY (seller_id) REFERENCES public.user_roles(user_id) not valid;

alter table "public"."properties" validate constraint "properties_seller_id_fkey";

alter table "public"."property_seller_info" add constraint "property_seller_info_id_fkey" FOREIGN KEY (id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."property_seller_info" validate constraint "property_seller_info_id_fkey";

alter table "public"."property_tags" add constraint "property_tags_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."property_tags" validate constraint "property_tags_property_id_fkey";

alter table "public"."property_tags" add constraint "property_tags_tag_id_fkey" FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."property_tags" validate constraint "property_tags_tag_id_fkey";

alter table "public"."property_tags" add constraint "property_tags_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL not valid;

alter table "public"."property_tags" validate constraint "property_tags_user_id_fkey";

alter table "public"."user_locations" add constraint "user_locations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_locations" validate constraint "user_locations_user_id_fkey";

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_users_favourite_properties()
 RETURNS SETOF public.properties
 LANGUAGE plpgsql
AS $function$
begin
 
  return query
  select p.* 

  from buyer_favourites bf

  join properties p on p.id = bf.property_id

  where bf.buyer_id = auth.uid();

end;
$function$
;

CREATE OR REPLACE FUNCTION public.fetchrankedproperties(preferred_num_bedrooms smallint DEFAULT NULL::smallint, budget bigint DEFAULT NULL::bigint, preferred_property_types text[] DEFAULT NULL::text[], page integer DEFAULT 1, page_size integer DEFAULT 10)
 RETURNS SETOF public.properties
 LANGUAGE plpgsql
AS $function$
begin

return query

with scored as (
select p.*,
(
  -- add to weighted score if property type matches 
  (case when preferred_property_types is not null and p.property_type   = any(preferred_property_types) then 0 else 10000.0 end) 
  +
  -- add to weighted score based on how close it is to budget and preferred_num_bedrooms
  (case when preferred_num_bedrooms is not null 
  then abs(coalesce(p.num_bedrooms,0) - preferred_num_bedrooms) * 10000.0 
  else 0 end)
  +
  (case when budget is not null
  then abs(coalesce(p.price, 0) - budget) * 10000.0 else 0 end)
) as weighted_score
from properties p
where p.status in ('under offer', 'active')
)
 select s.*
  from scored s
  order by weighted_score asc
  limit page_size
  offset greatest((page - 1) * page_size, 0);
end;
$function$
;


  create policy "admins can create profiles"
  on "public"."estate_agent_profiles"
  as permissive
  for select
  to public
using (public.is_current_user_admin());



  create policy "admins can do anything"
  on "public"."estate_agent_profiles"
  as permissive
  for all
  to public
using (public.is_current_user_admin())
with check (public.is_current_user_admin());



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



  create policy "Sellers can edit and add to their own properties"
  on "public"."property_seller_info"
  as permissive
  for all
  to authenticated
using (public.does_property_belong_to_seller(id))
with check (true);



  create policy "admins can insert estate agents"
  on "public"."user_roles"
  as permissive
  for insert
  to public
with check ((public.is_current_user_admin() AND (role = 'agent'::text)));



  create policy "admins can select all data"
  on "public"."user_roles"
  as permissive
  for select
  to public
using (public.is_current_user_admin());



  create policy "agents can insert sellers"
  on "public"."user_roles"
  as permissive
  for insert
  to public
with check ((public.is_current_user_agent() AND (role = 'seller'::text)));



  create policy "agents can select all sellers"
  on "public"."user_roles"
  as permissive
  for select
  to public
using ((public.is_current_user_agent() AND (role = 'seller'::text)));



  create policy "admins can select all data"
  on "public"."users"
  as permissive
  for select
  to public
using (public.is_current_user_admin());



  create policy "agents can select users they added"
  on "public"."users"
  as permissive
  for select
  to authenticated
using (public.is_current_user_agent());


drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

drop policy "Admins can add and remove images ut6a19_0" on "storage"."objects";

drop policy "Admins can add and remove images ut6a19_1" on "storage"."objects";

drop policy "Admins can add and remove images ut6a19_2" on "storage"."objects";

drop policy "Allow estate agents to upload images ut6a19_0" on "storage"."objects";

drop policy "Sellers can insert, update and delete images ut6a19_0" on "storage"."objects";

drop policy "Sellers can insert, update and delete images ut6a19_1" on "storage"."objects";

drop policy "Sellers can insert, update and delete images ut6a19_2" on "storage"."objects";

drop policy "Sellers can insert, update and delete images ut6a19_3" on "storage"."objects";

drop policy "agents can delete images ut6a19_0" on "storage"."objects";

drop policy "agents can delete images ut6a19_1" on "storage"."objects";


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



