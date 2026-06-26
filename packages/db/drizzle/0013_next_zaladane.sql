-- Made idempotent: this migration was never recorded as applied due to a
-- clock-skew bug in journal timestamps for idx 11/12 (see _journal.json),
-- but most of its content (bansos_programs, pemilu_events, ui_sync_versions,
-- the service_request_type enum value, the household_members index swap)
-- already exists in the live DB via a separate bootstrap script. Only
-- barang_hilang and its dependents are actually new.
DO $$ BEGIN
  CREATE TYPE "public"."barang_hilang_priority" AS ENUM('low', 'medium', 'high');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  CREATE TYPE "public"."barang_hilang_status" AS ENUM('pending_verification', 'in_verification', 'processing', 'resolved', 'rejected', 'archived');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TYPE "public"."service_request_type" ADD VALUE IF NOT EXISTS 'BANSOS_APPLICATION';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bansos_programs" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"assistance_type" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"start_time" text NOT NULL,
	"end_time" text NOT NULL,
	"funding_source" text NOT NULL,
	"general_requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"allowed_rt_scope" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pemilu_events" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"requirements" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"polling_stations" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"election_date" text NOT NULL,
	"start_time" text,
	"end_time" text,
	"activity_id" text,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ui_sync_versions" (
	"scope_key" text PRIMARY KEY NOT NULL,
	"version" bigint DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "barang_hilang" (
	"id" text PRIMARY KEY NOT NULL,
	"ticket_number" text NOT NULL,
	"reporter_id" text NOT NULL,
	"status" "barang_hilang_status" DEFAULT 'pending_verification' NOT NULL,
	"priority" "barang_hilang_priority" DEFAULT 'low' NOT NULL,
	"item_name" text NOT NULL,
	"category" text NOT NULL,
	"item_description" text NOT NULL,
	"color" text,
	"estimated_value" integer,
	"incident_date" date NOT NULL,
	"incident_time" text,
	"location" text NOT NULL,
	"chronicle" text NOT NULL,
	"photos" jsonb DEFAULT '[]'::jsonb,
	"verification_checklist" jsonb,
	"handled_by" text,
	"admin_notes" text,
	"admin_reply" text,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "barang_hilang_ticket_number_unique" UNIQUE("ticket_number")
);
--> statement-breakpoint
DROP INDEX IF EXISTS "household_members_citizen_id_idx";--> statement-breakpoint
-- bansos_programs_created_by_user_id_fk intentionally not (re-)added here:
-- an equivalent FK on the same column already exists live under the name
-- "bansos_programs_created_by_users_id_fk" (created by the bootstrap script).
DO $$ BEGIN
  ALTER TABLE "pemilu_events" ADD CONSTRAINT "pemilu_events_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "pemilu_events" ADD CONSTRAINT "pemilu_events_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "barang_hilang" ADD CONSTRAINT "barang_hilang_reporter_id_user_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "barang_hilang" ADD CONSTRAINT "barang_hilang_handled_by_user_id_fk" FOREIGN KEY ("handled_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bansos_programs_title_idx" ON "bansos_programs" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bansos_programs_type_period_idx" ON "bansos_programs" USING btree ("assistance_type","start_date","end_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bansos_programs_created_by_idx" ON "bansos_programs" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pemilu_events_title_idx" ON "pemilu_events" USING btree ("title");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pemilu_events_date_idx" ON "pemilu_events" USING btree ("election_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pemilu_events_activity_id_idx" ON "pemilu_events" USING btree ("activity_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pemilu_events_created_by_idx" ON "pemilu_events" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "barang_hilang_reporter_idx" ON "barang_hilang" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "barang_hilang_status_idx" ON "barang_hilang" USING btree ("status");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "barang_hilang_ticket_idx" ON "barang_hilang" USING btree ("ticket_number");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "household_members_citizen_id_uq" ON "household_members" USING btree ("citizen_id");
