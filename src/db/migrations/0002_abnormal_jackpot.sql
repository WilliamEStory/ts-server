ALTER TABLE "chirps" DROP CONSTRAINT "chirps_uuser_id_users_id_fk";
--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'chirps'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "chirps" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "chirps" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "chirps" ADD CONSTRAINT "chirps_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chirps" DROP COLUMN "uuser_id";