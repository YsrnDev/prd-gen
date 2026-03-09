CREATE TABLE "subscription_plan" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"price" integer NOT NULL,
	"features" jsonb DEFAULT '[]'::jsonb,
	"is_popular" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_plan_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "ai_config" ADD COLUMN "temperature" real DEFAULT 0.5 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_config" ADD COLUMN "rate_limit_rpm" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_config" ADD COLUMN "rate_limit_tpm" integer DEFAULT 100000 NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_config" ADD COLUMN "maintenance_mode" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "tier" text DEFAULT 'FREE' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_status" text DEFAULT 'NONE' NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "subscription_until" timestamp;