drop function if exists "public"."fetch_ranked_properties"(p_min_lat numeric, p_max_lat numeric, p_min_long numeric, p_max_long numeric, p_preferred_num_bedrooms smallint, p_budget bigint, p_preferred_property_types text[], page integer, page_size integer, p_tag_ids bigint[], geo_json text, p_search_radius_metres numeric);

drop function if exists "public"."fetch_ranked_properties"(p_min_lat numeric, p_max_lat numeric, p_min_long numeric, p_max_long numeric, p_preferred_num_bedrooms smallint, p_budget bigint, p_preferred_property_types text[], page integer, page_size integer, p_tag_ids bigint[], geo_json text, p_search_radius_metres numeric, p_min_price numeric, p_max_price numeric, p_min_beds smallint, p_max_beds smallint, p_min_baths smallint, p_max_baths smallint);

drop function if exists "public"."fetch_ranked_properties"(p_min_lat numeric, p_max_lat numeric, p_min_long numeric, p_max_long numeric, p_preferred_num_bedrooms smallint, p_budget bigint, p_preferred_property_types text[], page integer, page_size integer, p_tag_ids bigint[], geo_json text, p_search_radius_metres numeric, p_min_price numeric, p_max_price numeric, p_min_beds smallint, p_max_beds smallint, p_min_baths smallint, p_max_baths smallint, p_property_types text[]);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_ranked_properties(p_min_lat numeric DEFAULT NULL::numeric, p_max_lat numeric DEFAULT NULL::numeric, p_min_long numeric DEFAULT NULL::numeric, p_max_long numeric DEFAULT NULL::numeric, p_preferred_num_bedrooms smallint DEFAULT NULL::smallint, p_budget bigint DEFAULT NULL::bigint, p_preferred_property_types text[] DEFAULT NULL::text[], page integer DEFAULT 1, page_size integer DEFAULT 10, p_tag_ids bigint[] DEFAULT NULL::bigint[], geo_json text DEFAULT NULL::text, p_search_radius_metres numeric DEFAULT 0, p_min_price numeric DEFAULT 0, p_max_price numeric DEFAULT 0, p_min_beds smallint DEFAULT 0, p_max_beds smallint DEFAULT 0, p_min_baths smallint DEFAULT 0, p_max_baths smallint DEFAULT 0, p_property_types text[] DEFAULT NULL::text[], p_has_garage boolean DEFAULT NULL::boolean, p_has_garden boolean DEFAULT NULL::boolean, p_has_driveway boolean DEFAULT NULL::boolean, p_min_sqft numeric DEFAULT NULL::numeric, p_max_sqft numeric DEFAULT NULL::numeric, p_council_tax_max text DEFAULT NULL::text, p_council_tax_min text DEFAULT NULL::text, p_epc_max text DEFAULT NULL::text, p_epc_min text DEFAULT NULL::text, p_include_new_builds boolean DEFAULT true, p_include_under_offer boolean DEFAULT true, p_only_under_offer boolean DEFAULT false)
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

    and ((p_max_price = 0 ) or (p_max_price != 0 and p.price <= p_max_price))
    and ((p_min_price = 0 ) or (p_min_price != 0 and p.price >= p_min_price))

    and ((p_max_beds = 0 ) or (p_max_beds != 0 and p.num_bedrooms <= p_max_beds))
    and ((p_min_beds = 0 ) or (p_min_beds != 0 and p.num_bedrooms >= p_min_beds))

    and ((p_max_baths = 0 ) or (p_max_baths != 0 and p.num_bathrooms <= p_max_baths))
    and ((p_min_baths = 0 ) or (p_min_baths != 0 and p.num_bathrooms >= p_min_baths))

    and ((p_property_types is null) or (lower(p.property_type) = any(p_property_types)))

    and ((p_has_garage is null) or (p.has_garage = p_has_garage))

    and ((geo_json is null and (p_max_lat is null or p.latitude <= p_max_lat)
      and (p_min_lat is null or p.latitude >= p_min_lat)
      and (p_max_long is null or p.longitude <= p_max_long)
      and (p_min_long is null or p.longitude >= p_min_long))

    or (geo_json is not null and extensions.ST_Within(
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


