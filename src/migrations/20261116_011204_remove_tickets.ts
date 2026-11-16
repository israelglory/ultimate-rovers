// Removes ticketing. Existing "tickets" contact topics are remapped to "membership" before the enum
// changes, so the migration also succeeds on a database with real contact messages.
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "contact_submissions" ALTER COLUMN "topic" SET DATA TYPE text;
  UPDATE "contact_submissions" SET "topic" = 'membership' WHERE "topic" = 'tickets';
  DROP TYPE "public"."enum_contact_submissions_topic";
  CREATE TYPE "public"."enum_contact_submissions_topic" AS ENUM('general', 'membership', 'partnerships', 'media', 'academy');
  ALTER TABLE "contact_submissions" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_contact_submissions_topic" USING "topic"::"public"."enum_contact_submissions_topic";
  ALTER TABLE "club_settings_departments" ALTER COLUMN "topic" SET DATA TYPE text;
  UPDATE "club_settings_departments" SET "topic" = 'membership' WHERE "topic" = 'tickets';
  DROP TYPE "public"."enum_club_settings_departments_topic";
  CREATE TYPE "public"."enum_club_settings_departments_topic" AS ENUM('general', 'membership', 'partnerships', 'media', 'academy');
  ALTER TABLE "club_settings_departments" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_club_settings_departments_topic" USING "topic"::"public"."enum_club_settings_departments_topic";
  ALTER TABLE "matches" DROP COLUMN "ticket_availability";
  ALTER TABLE "matches" DROP COLUMN "ticket_url";
  ALTER TABLE "matches" DROP COLUMN "ticket_info";
  ALTER TABLE "club_settings" DROP COLUMN "tickets_url";
  ALTER TABLE "club_settings" DROP COLUMN "season_ticket_text";
  ALTER TABLE "club_settings" DROP COLUMN "matchday_ticket_text";
  ALTER TABLE "club_settings" DROP COLUMN "match_ticket_text";
  DROP TYPE "public"."enum_matches_ticket_availability";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_matches_ticket_availability" AS ENUM('not_on_sale', 'on_sale', 'members_only', 'sold_out');
  ALTER TABLE "contact_submissions" ALTER COLUMN "topic" SET DATA TYPE text;
  UPDATE "contact_submissions" SET "topic" = 'tickets' WHERE "topic" = 'membership';
  DROP TYPE "public"."enum_contact_submissions_topic";
  CREATE TYPE "public"."enum_contact_submissions_topic" AS ENUM('general', 'tickets', 'partnerships', 'media', 'academy');
  ALTER TABLE "contact_submissions" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_contact_submissions_topic" USING "topic"::"public"."enum_contact_submissions_topic";
  ALTER TABLE "club_settings_departments" ALTER COLUMN "topic" SET DATA TYPE text;
  UPDATE "club_settings_departments" SET "topic" = 'tickets' WHERE "topic" = 'membership';
  DROP TYPE "public"."enum_club_settings_departments_topic";
  CREATE TYPE "public"."enum_club_settings_departments_topic" AS ENUM('general', 'tickets', 'partnerships', 'media', 'academy');
  ALTER TABLE "club_settings_departments" ALTER COLUMN "topic" SET DATA TYPE "public"."enum_club_settings_departments_topic" USING "topic"::"public"."enum_club_settings_departments_topic";
  ALTER TABLE "matches" ADD COLUMN "ticket_availability" "enum_matches_ticket_availability" DEFAULT 'not_on_sale';
  ALTER TABLE "matches" ADD COLUMN "ticket_url" varchar;
  ALTER TABLE "matches" ADD COLUMN "ticket_info" varchar;
  ALTER TABLE "club_settings" ADD COLUMN "tickets_url" varchar;
  ALTER TABLE "club_settings" ADD COLUMN "season_ticket_text" varchar;
  ALTER TABLE "club_settings" ADD COLUMN "matchday_ticket_text" varchar;
  ALTER TABLE "club_settings" ADD COLUMN "match_ticket_text" varchar;`)
}
