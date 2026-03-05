alter table "public"."properties" drop constraint "properties_agency_id_fkey";

alter table "public"."properties" drop column "agency_id";

alter table "public"."properties" add column "agency_location_id" uuid not null;

alter table "public"."properties" add constraint "properties_agency_location_id_fkey" FOREIGN KEY (agency_location_id) REFERENCES public.estate_agency_location(location_id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."properties" validate constraint "properties_agency_location_id_fkey";


