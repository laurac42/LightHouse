alter table "public"."properties" drop column "media_url";

alter table "public"."properties" drop column "tenure_type";

alter table "public"."properties" add column "image_url" text;

alter table "public"."properties" add column "video_url" text;


