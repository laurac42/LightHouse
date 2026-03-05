alter table "public"."properties" drop column "home_report_url";

alter table "public"."properties" drop column "maps_url";

alter table "public"."properties" drop column "video_url";

alter table "public"."properties" add column "is_new_build" boolean not null default false;


