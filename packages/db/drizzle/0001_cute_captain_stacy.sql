DROP INDEX "realtime"."helperPresence_helperUserId_uidx";--> statement-breakpoint
ALTER TABLE "realtime"."helper_presence" ALTER COLUMN "available_slots" SET DEFAULT 1;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "start_code" text;--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "complete_code" text;--> statement-breakpoint
ALTER TABLE "realtime"."helper_presence" DROP COLUMN "accuracy";--> statement-breakpoint
ALTER TABLE "realtime"."helper_presence" DROP COLUMN "last_location_update";--> statement-breakpoint
ALTER TABLE "realtime"."helper_presence" ADD CONSTRAINT "helper_presence_helper_user_id_unique" UNIQUE("helper_user_id");