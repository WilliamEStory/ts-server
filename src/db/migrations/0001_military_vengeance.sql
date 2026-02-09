CREATE TABLE "chirps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"body" varchar(140) NOT NULL,
	"uuser_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_uuser_id_users_id_fk" FOREIGN KEY ("uuser_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;