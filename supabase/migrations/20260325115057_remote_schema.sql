
  create table "public"."buyer_favourites" (
    "created_at" timestamp with time zone not null default now(),
    "buyer_id" uuid not null,
    "property_id" bigint not null
      );


alter table "public"."buyer_favourites" enable row level security;

CREATE UNIQUE INDEX buyer_favourites_pkey ON public.buyer_favourites USING btree (buyer_id, property_id);

alter table "public"."buyer_favourites" add constraint "buyer_favourites_pkey" PRIMARY KEY using index "buyer_favourites_pkey";

alter table "public"."buyer_favourites" add constraint "buyer_favourites_buyer_id_fkey" FOREIGN KEY (buyer_id) REFERENCES public.users(id) not valid;

alter table "public"."buyer_favourites" validate constraint "buyer_favourites_buyer_id_fkey";

alter table "public"."buyer_favourites" add constraint "buyer_favourites_property_id_fkey" FOREIGN KEY (property_id) REFERENCES public.properties(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."buyer_favourites" validate constraint "buyer_favourites_property_id_fkey";

set check_function_bodies = off;

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

grant delete on table "public"."buyer_favourites" to "anon";

grant insert on table "public"."buyer_favourites" to "anon";

grant references on table "public"."buyer_favourites" to "anon";

grant select on table "public"."buyer_favourites" to "anon";

grant trigger on table "public"."buyer_favourites" to "anon";

grant truncate on table "public"."buyer_favourites" to "anon";

grant update on table "public"."buyer_favourites" to "anon";

grant delete on table "public"."buyer_favourites" to "authenticated";

grant insert on table "public"."buyer_favourites" to "authenticated";

grant references on table "public"."buyer_favourites" to "authenticated";

grant select on table "public"."buyer_favourites" to "authenticated";

grant trigger on table "public"."buyer_favourites" to "authenticated";

grant truncate on table "public"."buyer_favourites" to "authenticated";

grant update on table "public"."buyer_favourites" to "authenticated";

grant delete on table "public"."buyer_favourites" to "service_role";

grant insert on table "public"."buyer_favourites" to "service_role";

grant references on table "public"."buyer_favourites" to "service_role";

grant select on table "public"."buyer_favourites" to "service_role";

grant trigger on table "public"."buyer_favourites" to "service_role";

grant truncate on table "public"."buyer_favourites" to "service_role";

grant update on table "public"."buyer_favourites" to "service_role";


