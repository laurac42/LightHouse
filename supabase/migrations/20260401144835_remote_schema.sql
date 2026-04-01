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

alter table "public"."user_roles" drop constraint "user_roles_user_id_fkey";

drop function if exists "public"."fetch_ranked_properties"(p_min_lat numeric, p_max_lat numeric, p_min_long numeric, p_max_long numeric, p_preferred_num_bedrooms smallint, p_budget bigint, p_preferred_property_types text[], page integer, page_size integer);

drop function if exists "public"."get_tag_counts"(p_property_id bigint);

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

alter table "public"."user_roles" add constraint "user_roles_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_roles" validate constraint "user_roles_user_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_ranked_properties(p_min_lat numeric DEFAULT NULL::numeric, p_max_lat numeric DEFAULT NULL::numeric, p_min_long numeric DEFAULT NULL::numeric, p_max_long numeric DEFAULT NULL::numeric, p_preferred_num_bedrooms smallint DEFAULT NULL::smallint, p_budget bigint DEFAULT NULL::bigint, p_preferred_property_types text[] DEFAULT NULL::text[], page integer DEFAULT 1, page_size integer DEFAULT 10, p_tag_ids bigint[] DEFAULT NULL::bigint[])
 RETURNS TABLE(id bigint, added_at timestamp with time zone, title text, price numeric, description text, agency_location_id uuid, seller_id uuid, address_line_1 text, address_line_2 text, city text, post_code text, num_bedrooms smallint, num_bathrooms smallint, property_type text, square_feet numeric, council_tax_band text, epc_rating text, image_url text, price_type text, has_garage boolean, is_new_build boolean, agent_id uuid, last_updated_at timestamp with time zone, status text, features text[], latitude numeric, longitude numeric, garden boolean, driveway boolean, total_count bigint, weighted_score numeric)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  with scored as (
    select
      p.*,
      count(*) over() as total_count,
      (
        (case when p_preferred_property_types is not null and not p.property_type = any(p_preferred_property_types) then 50000 else 0 end)
        +
        (case when p_preferred_num_bedrooms is not null then abs(coalesce(p.num_bedrooms,0) - p_preferred_num_bedrooms) * 10000.0 else 0 end)
        +
        (case when p_budget is not null then abs(coalesce(p.price, 0) - p_budget) / p_budget::numeric * 50000.0 else 0 end)
        +
        (case when p_tag_ids is not null  then (
            array_length(p_tag_ids, 1) - 
            (select count(*) from unnest(get_valid_tags_for_property(p.id)) t 
             where t = any(p_tag_ids))
            ) * 100000 else 0 end)
      ) as weighted_score
    from properties p
    where p.status in ('under offer', 'active') 
    and (p_max_lat is null or p.latitude <= p_max_lat)
    and (p_min_lat is null or p.latitude >= p_min_lat)
    and (p_max_long is null or p.longitude <= p_max_long)
    and (p_min_long is null or p.longitude >= p_min_long)
  )
  select s.*
  from scored s
  order by s.weighted_score asc
  limit page_size
  offset greatest((page - 1) * page_size, 0);
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_tag_counts(p_property_id bigint, p_user_id uuid DEFAULT NULL::uuid)
 RETURNS TABLE(name text, tag_id bigint, count bigint, user_applied boolean)
 LANGUAGE plpgsql
AS $function$
begin 
return query
select 
t.name, 
pt.tag_id, 
count(*)::bigint as count, 
exists (
  select 1
  from property_tags pt2
  where pt2.property_id = p_property_id
  and pt2.tag_id = pt.tag_id
  and pt2.user_id = p_user_id 
)
from property_tags as pt
join tags as t 
on t.id = pt.tag_id
where pt.property_id = p_property_id
group by pt.tag_id, t.name
order by count desc;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.get_valid_tags_for_property(p_property_id bigint)
 RETURNS bigint[]
 LANGUAGE plpgsql
AS $function$
declare v_tags bigint[];
begin
  select array_agg(t.tag_id)::bigint[]
  into v_tags
  from (
    select pt.tag_id
    from property_tags pt
    where pt.property_id = p_property_id
    group by pt.tag_id
    having count(*)::bigint >= 5
  ) t;
  return v_tags;
end;
$function$
;

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


  create policy "Enable delete for authenticated users only"
  on "public"."property_tags"
  as permissive
  for delete
  to authenticated
using (true);



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



