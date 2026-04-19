CREATE TABLE IF NOT EXISTS "helper_web_push_subscription" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "helper_profile_id" text NOT NULL,
  "endpoint" text NOT NULL,
  "p256dh" text NOT NULL,
  "auth" text NOT NULL,
  "expiration_time" timestamp,
  "user_agent" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "last_used_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "helper_web_push_subscription" ADD CONSTRAINT "helper_web_push_subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "helper_web_push_subscription" ADD CONSTRAINT "helper_web_push_subscription_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "helperWebPushSubscription_helperProfile_endpoint_uidx" ON "helper_web_push_subscription" USING btree ("helper_profile_id", "endpoint");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "helperWebPushSubscription_userId_idx" ON "helper_web_push_subscription" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "helperWebPushSubscription_helperProfileId_idx" ON "helper_web_push_subscription" USING btree ("helper_profile_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "helperWebPushSubscription_isActive_idx" ON "helper_web_push_subscription" USING btree ("is_active");
