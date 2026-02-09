ALTER TABLE "chirps" DROP CONSTRAINT "chirps_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "chirps" DROP CONSTRAINT IF EXISTS "chirps_pkey";
--> statement-breakpoint
ALTER TABLE "chirps" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "chirps" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "chirps" ADD COLUMN "user_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;