set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.fetchrankedproperties(preferred_num_bedrooms smallint, budget bigint, preferred_property_types text[])
 RETURNS SETOF public.properties
 LANGUAGE plpgsql
AS $function$
begin

return query

select * 
from properties
order by 
-- add to weighted score if property type matches 
(case when property_type = any(preferred_property_types) then 0 else 1 end) * 10000.0 +

-- add to weighted score based on how close it is to budget and preferred_num_bedrooms
abs(num_bedrooms - preferred_num_bedrooms) * 10000.0 + 
abs(price::numeric - budget::numeric)/nullif(budget::numeric, 0) * 10000
asc;

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

CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
begin
  insert into public.users (id, email)
  values (new.id, new.email);

  if new.raw_user_meta_data ? 'role' then
  insert into public.user_roles(user_id, role, granted_by)
  values (new.id, new.raw_user_meta_data->>'role', (new.raw_user_meta_data->>'granted_by')::uuid);

  if new.raw_user_meta_data->>'role' = 'agent' then
  insert into public.estate_agent_profiles(id, estate_agency_location_id)
  values (new.id, (new.raw_user_meta_data->>'location_id')::uuid);
  end if;
  end if;
  return new;
end;
$function$
;

drop trigger if exists "on_auth_user_created" on "auth"."users";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


