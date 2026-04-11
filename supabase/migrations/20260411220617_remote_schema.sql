
  create table "public"."user_locations" (
    "id" uuid not null,
    "created_at" timestamp with time zone not null default now(),
    "nickname" text not null,
    "user_id" uuid default gen_random_uuid(),
    "address_line_1" text,
    "address_line_2" text,
    "city" text,
    "post_code" text not null
      );


alter table "public"."user_locations" enable row level security;

CREATE UNIQUE INDEX user_locations_pkey ON public.user_locations USING btree (id);

alter table "public"."user_locations" add constraint "user_locations_pkey" PRIMARY KEY using index "user_locations_pkey";

alter table "public"."user_locations" add constraint "user_locations_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."user_locations" validate constraint "user_locations_user_id_fkey";

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

grant delete on table "public"."user_locations" to "anon";

grant insert on table "public"."user_locations" to "anon";

grant references on table "public"."user_locations" to "anon";

grant select on table "public"."user_locations" to "anon";

grant trigger on table "public"."user_locations" to "anon";

grant truncate on table "public"."user_locations" to "anon";

grant update on table "public"."user_locations" to "anon";

grant delete on table "public"."user_locations" to "authenticated";

grant insert on table "public"."user_locations" to "authenticated";

grant references on table "public"."user_locations" to "authenticated";

grant select on table "public"."user_locations" to "authenticated";

grant trigger on table "public"."user_locations" to "authenticated";

grant truncate on table "public"."user_locations" to "authenticated";

grant update on table "public"."user_locations" to "authenticated";

grant delete on table "public"."user_locations" to "service_role";

grant insert on table "public"."user_locations" to "service_role";

grant references on table "public"."user_locations" to "service_role";

grant select on table "public"."user_locations" to "service_role";

grant trigger on table "public"."user_locations" to "service_role";

grant truncate on table "public"."user_locations" to "service_role";

grant update on table "public"."user_locations" to "service_role";


  create policy "Enable all actions for users based on user_id"
  on "public"."user_locations"
  as permissive
  for all
  to public
using ((( SELECT auth.uid() AS uid) = user_id))
with check ((( SELECT auth.uid() AS uid) = user_id));



