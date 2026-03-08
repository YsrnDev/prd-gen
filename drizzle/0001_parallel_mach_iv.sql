CREATE TABLE "prd_chat_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"prd_id" integer NOT NULL,
	"role" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prd_chat_log" ADD CONSTRAINT "prd_chat_log_prd_id_prd_document_id_fk" FOREIGN KEY ("prd_id") REFERENCES "public"."prd_document"("id") ON DELETE cascade ON UPDATE no action;