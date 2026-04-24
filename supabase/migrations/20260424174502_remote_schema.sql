set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_buyer_profile(p_id uuid, p_budget numeric, p_preferred_num_bedrooms smallint, p_preferred_property_types text[], p_preferred_locations text[])
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin
  update buyer_profiles
  set 
  budget = p_budget,
  preferred_num_bedrooms = p_preferred_num_bedrooms,
  preferred_property_types = p_preferred_property_types,
  preferred_locations = p_preferred_locations

  where buyer_profiles.id = id;

  update users
  set onboarded = true
  where users.id = id;
end;
$function$
;


