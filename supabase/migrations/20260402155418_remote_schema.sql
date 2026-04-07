drop function if exists "public"."fetch_ranked_properties"(p_min_lat numeric, p_max_lat numeric, p_min_long numeric, p_max_long numeric, p_preferred_num_bedrooms smallint, p_budget bigint, p_preferred_property_types text[], page integer, page_size integer, p_tag_ids bigint[], geo_json text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_ranked_properties(p_min_lat numeric DEFAULT NULL::numeric, p_max_lat numeric DEFAULT NULL::numeric, p_min_long numeric DEFAULT NULL::numeric, p_max_long numeric DEFAULT NULL::numeric, p_preferred_num_bedrooms smallint DEFAULT NULL::smallint, p_budget bigint DEFAULT NULL::bigint, p_preferred_property_types text[] DEFAULT NULL::text[], page integer DEFAULT 1, page_size integer DEFAULT 10, p_tag_ids bigint[] DEFAULT NULL::bigint[], geo_json text DEFAULT NULL::text, p_search_radius_metres numeric DEFAULT 0)
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
        (case when (p_tag_ids is not null and array_length(p_tag_ids, 1) > 0) then (
        1.0 - 
        (
          select count(*) from unnest(get_valid_tags_for_property(p.id)) t
          where t = any(p_tag_ids)
        )::numeric / array_length(p_tag_ids, 1)
        ) * 50000.0 else 0 end)
      ) as weighted_score
    from properties p
    where p.status in ('under offer', 'active') 
    and ((geo_json is null and (p_max_lat is null or p.latitude <= p_max_lat)
      and (p_min_lat is null or p.latitude >= p_min_lat)
      and (p_max_long is null or p.longitude <= p_max_long)
      and (p_min_long is null or p.longitude >= p_min_long))

    or (geo_json IS NOT NULL AND extensions.ST_Within(
      extensions.ST_SetSRID(extensions.ST_MakePoint(p.longitude, p.latitude), 4326),
      extensions.ST_Buffer(
        extensions.ST_GeomFromGeoJSON(geo_json::text)::geography,
        p_search_radius_metres
      )::geometry
    )))
  )
  select s.*
  from scored s
  order by s.weighted_score asc
  limit page_size
  offset greatest((page - 1) * page_size, 0);
end;
$function$
;


