drop function if exists "public"."fetch_ranked_properties"(preferred_num_bedrooms smallint, budget bigint, preferred_property_types text[], page integer, page_size integer);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_ranked_properties(p_preferred_num_bedrooms smallint DEFAULT NULL::smallint, p_budget bigint DEFAULT NULL::bigint, p_preferred_property_types text[] DEFAULT NULL::text[], page integer DEFAULT 1, page_size integer DEFAULT 10)
 RETURNS TABLE("like" public.properties, total_count bigint)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  with scored as (
    select
      p.*,
      count(*) over() as total_count,
      (
        (case when p_preferred_property_types is not null and p.property_type = any(p_preferred_property_types) then 0 else 10000 end)
        +
        (case when p_preferred_num_bedrooms is not null then abs(coalesce(p.num_bedrooms,0) - p_preferred_num_bedrooms) * 10000.0 else 0 end)
        +
        (case when p_budget is not null then abs(coalesce(p.price, 0) - p_budget) * 10000.0 else 0 end)
      ) as weighted_score
    from properties p
    where p.status in ('under offer', 'active')
  )
  select s.*, s.total_count
  from scored s
  order by s.weighted_score asc
  limit page_size
  offset greatest((page - 1) * page_size, 0);
end;
$function$
;


