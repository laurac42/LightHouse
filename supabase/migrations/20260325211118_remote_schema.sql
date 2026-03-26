set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetch_ranked_properties(preferred_num_bedrooms smallint DEFAULT NULL::smallint, budget bigint DEFAULT NULL::bigint, preferred_property_types text[] DEFAULT NULL::text[], page integer DEFAULT 1, page_size integer DEFAULT 10)
 RETURNS SETOF public.properties
 LANGUAGE plpgsql
AS $function$
begin
  return query
  with scored as (
    select
      p.*,
      (
        (case when preferred_property_types is not null and p.property_type = any(preferred_property_types) then 0 else 10000 end)
        +
        (case when preferred_num_bedrooms is not null then abs(coalesce(p.num_bedrooms,0) - preferred_num_bedrooms) * 10000.0 else 0 end)
        +
        (case when budget is not null then abs(coalesce(p.price, 0) - budget) * 10000.0 else 0 end)
      ) as weighted_score
    from properties p
    where p.status in ('under offer', 'active')
  )
  select s.*
  from scored s
  order by s.weighted_score asc
  limit page_size
  offset greatest((page - 1) * page_size, 0);
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


