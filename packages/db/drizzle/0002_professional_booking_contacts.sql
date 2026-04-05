DO $$ BEGIN
 CREATE TYPE "public"."contact_method" AS ENUM('call', 'sms', 'whatsapp', 'in_app');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TABLE "customer_profile" ADD COLUMN IF NOT EXISTS "phone" text;
--> statement-breakpoint
ALTER TABLE "customer_profile" ADD COLUMN IF NOT EXISTS "phone_verified" boolean DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE "customer_profile" ADD COLUMN IF NOT EXISTS "preferred_contact_method" "contact_method" DEFAULT 'call' NOT NULL;
--> statement-breakpoint
ALTER TABLE "customer_profile" ADD COLUMN IF NOT EXISTS "emergency_contact_name" text;
--> statement-breakpoint
ALTER TABLE "customer_profile" ADD COLUMN IF NOT EXISTS "emergency_contact_phone" text;
--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN IF NOT EXISTS "phone_for_bookings" text;
--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN IF NOT EXISTS "verified_phone" text;
--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN IF NOT EXISTS "verified_phone_date" timestamp;
--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN IF NOT EXISTS "emergency_contact_name" text;
--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN IF NOT EXISTS "emergency_contact_phone" text;
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "customer_name" text;
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "customer_phone" text;
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "helper_name" text;
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "helper_phone" text;
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "helper_phone_visible_at" timestamp;
--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN IF NOT EXISTS "preferred_contact_method" "contact_method" DEFAULT 'call' NOT NULL;