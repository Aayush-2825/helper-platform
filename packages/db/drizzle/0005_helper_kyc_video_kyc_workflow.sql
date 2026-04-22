CREATE TYPE "public"."helper_video_kyc_status" AS ENUM('not_required', 'pending_schedule', 'scheduled', 'passed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."video_kyc_session_status" AS ENUM('scheduled', 'passed', 'failed', 'no_show', 'cancelled');--> statement-breakpoint

CREATE TABLE "helper_onboarding_draft" (
  "id" text PRIMARY KEY NOT NULL,
  "user_id" text NOT NULL,
  "step_index" integer DEFAULT 0 NOT NULL,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

CREATE TABLE "video_kyc_session" (
  "id" text PRIMARY KEY NOT NULL,
  "helper_profile_id" text NOT NULL,
  "meet_link" text NOT NULL,
  "calendar_event_id" text NOT NULL,
  "scheduled_at" timestamp NOT NULL,
  "status" "video_kyc_session_status" DEFAULT 'scheduled' NOT NULL,
  "attempt_number" integer DEFAULT 1 NOT NULL,
  "admin_user_id" text,
  "admin_notes" text,
  "completed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

ALTER TABLE "helper_kyc_document" ADD COLUMN "superseded_at" timestamp;--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN "block_resubmission" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN "last_resubmitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN "submitted_at" timestamp;--> statement-breakpoint
ALTER TABLE "helper_profile" ADD COLUMN "video_kyc_status" "helper_video_kyc_status" DEFAULT 'not_required' NOT NULL;--> statement-breakpoint

ALTER TABLE "helper_onboarding_draft" ADD CONSTRAINT "helper_onboarding_draft_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_kyc_session" ADD CONSTRAINT "video_kyc_session_helper_profile_id_helper_profile_id_fk" FOREIGN KEY ("helper_profile_id") REFERENCES "public"."helper_profile"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_kyc_session" ADD CONSTRAINT "video_kyc_session_admin_user_id_user_id_fk" FOREIGN KEY ("admin_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint

CREATE UNIQUE INDEX "helperOnboardingDraft_userId_uidx" ON "helper_onboarding_draft" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "videoKycSession_helperProfileId_idx" ON "video_kyc_session" USING btree ("helper_profile_id");--> statement-breakpoint
CREATE INDEX "videoKycSession_status_scheduledAt_idx" ON "video_kyc_session" USING btree ("status", "scheduled_at");--> statement-breakpoint
