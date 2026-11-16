import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "matches" ALTER COLUMN "kickoff_tz" SET DEFAULT 'Africa/Lagos';
  ALTER TABLE "club_settings" ALTER COLUMN "timezone" SET DEFAULT 'Africa/Lagos';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "matches" ALTER COLUMN "kickoff_tz" SET DEFAULT 'Europe/London';
  ALTER TABLE "club_settings" ALTER COLUMN "timezone" SET DEFAULT 'Europe/London';`)
}
