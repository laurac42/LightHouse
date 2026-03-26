drop function if exists "public"."fetchrankedproperties"(preferred_num_bedrooms smallint, budget bigint, preferred_property_types text[]);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetchrankedproperties(preferred_num_bedrooms smallint, budget bigint, preferred_property_types text[], page integer, page_size integer)
 RETURNS SETOF public.properties
 LANGUAGE plpgsql
AS $function$
begin

return query

select * , count
from properties
where (status = 'under offer' or status = 'active')
order by (


-- add to weighted score if property type matches 
(case when property_type = any(preferred_property_types) then 0 else 1 end) * 10000.0 +

-- add to weighted score based on how close it is to budget and preferred_num_bedrooms
abs(num_bedrooms - preferred_num_bedrooms) * 10000.0 + 
abs(price::numeric - budget::numeric)/nullif(budget::numeric, 0) * 10000

) asc
limit page_size
offset greatest((page-1)* page_size, 0);

end;
$function$
;


