import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_matches_events_side" AS ENUM('home', 'away');
  CREATE TYPE "public"."enum_matches_events_type" AS ENUM('goal', 'own_goal', 'penalty', 'yellow', 'second_yellow', 'red', 'substitution');
  CREATE TYPE "public"."enum_matches_kickoff_tz" AS ENUM('Pacific/Midway', 'Pacific/Niue', 'Pacific/Honolulu', 'Pacific/Rarotonga', 'America/Anchorage', 'Pacific/Gambier', 'America/Los_Angeles', 'America/Tijuana', 'America/Denver', 'America/Phoenix', 'America/Chicago', 'America/Guatemala', 'America/New_York', 'America/Bogota', 'America/Caracas', 'America/Santiago', 'America/Buenos_Aires', 'America/Sao_Paulo', 'Atlantic/South_Georgia', 'Atlantic/Azores', 'Atlantic/Cape_Verde', 'Europe/London', 'Europe/Berlin', 'Africa/Lagos', 'Europe/Athens', 'Africa/Cairo', 'Europe/Moscow', 'Asia/Riyadh', 'Asia/Dubai', 'Asia/Baku', 'Asia/Karachi', 'Asia/Tashkent', 'Asia/Calcutta', 'Asia/Dhaka', 'Asia/Almaty', 'Asia/Jakarta', 'Asia/Bangkok', 'Asia/Shanghai', 'Asia/Singapore', 'Asia/Tokyo', 'Asia/Seoul', 'Australia/Brisbane', 'Australia/Sydney', 'Pacific/Guam', 'Pacific/Noumea', 'Pacific/Auckland', 'Pacific/Fiji');
  CREATE TYPE "public"."enum_matches_ticket_availability" AS ENUM('not_on_sale', 'on_sale', 'members_only', 'sold_out');
  CREATE TYPE "public"."enum_matches_status" AS ENUM('scheduled', 'live', 'half_time', 'full_time', 'postponed', 'cancelled');
  CREATE TYPE "public"."enum_competitions_type" AS ENUM('league', 'cup', 'friendly');
  CREATE TYPE "public"."enum_players_status" AS ENUM('active', 'on_loan', 'left');
  CREATE TYPE "public"."enum_players_position_group" AS ENUM('goalkeeper', 'defender', 'midfielder', 'forward');
  CREATE TYPE "public"."enum_players_preferred_foot" AS ENUM('right', 'left', 'both');
  CREATE TYPE "public"."enum_articles_category" AS ENUM('match-report', 'match-preview', 'squad-news', 'club', 'academy', 'community');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__articles_v_version_category" AS ENUM('match-report', 'match-preview', 'squad-news', 'club', 'academy', 'community');
  CREATE TYPE "public"."enum__articles_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_people_group" AS ENUM('board', 'management', 'technical', 'investors');
  CREATE TYPE "public"."enum_partners_tier" AS ENUM('principal', 'official', 'supplier', 'community');
  CREATE TYPE "public"."enum_contact_submissions_status" AS ENUM('new', 'handled');
  CREATE TYPE "public"."enum_contact_submissions_topic" AS ENUM('general', 'tickets', 'partnerships', 'media', 'academy');
  CREATE TYPE "public"."enum_contact_submissions_email_status" AS ENUM('sent', 'failed');
  CREATE TYPE "public"."enum_users_roles" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum_club_settings_departments_topic" AS ENUM('general', 'tickets', 'partnerships', 'media', 'academy');
  CREATE TABLE "matches_events" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"minute" numeric NOT NULL,
  	"added_time" numeric,
  	"side" "enum_matches_events_side" NOT NULL,
  	"type" "enum_matches_events_type" NOT NULL,
  	"player_id" integer,
  	"player_name" varchar,
  	"related_player_id" integer,
  	"related_player_name" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "matches_home_lineup_starting" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"player_id" integer,
  	"name" varchar,
  	"number" numeric,
  	"x" numeric,
  	"y" numeric
  );
  
  CREATE TABLE "matches_home_lineup_substitutes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"player_id" integer,
  	"name" varchar,
  	"number" numeric
  );
  
  CREATE TABLE "matches_away_lineup_starting" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"player_id" integer,
  	"name" varchar,
  	"number" numeric,
  	"x" numeric,
  	"y" numeric
  );
  
  CREATE TABLE "matches_away_lineup_substitutes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"player_id" integer,
  	"name" varchar,
  	"number" numeric
  );
  
  CREATE TABLE "matches_home_team_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "matches_away_team_news" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "matches" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"competition_id" integer NOT NULL,
  	"season" varchar NOT NULL,
  	"matchweek" numeric,
  	"kickoff" timestamp(3) with time zone NOT NULL,
  	"kickoff_tz" "enum_matches_kickoff_tz" DEFAULT 'Europe/London' NOT NULL,
  	"home_team_id" integer NOT NULL,
  	"away_team_id" integer NOT NULL,
  	"venue" varchar,
  	"referee" varchar,
  	"broadcast" varchar,
  	"watch_url" varchar,
  	"ticket_availability" "enum_matches_ticket_availability" DEFAULT 'not_on_sale',
  	"ticket_url" varchar,
  	"ticket_info" varchar,
  	"status" "enum_matches_status" DEFAULT 'scheduled' NOT NULL,
  	"minute" numeric,
  	"attendance" numeric,
  	"home_score" numeric,
  	"away_score" numeric,
  	"half_time_home_score" numeric,
  	"half_time_away_score" numeric,
  	"status_note" varchar,
  	"lineups_confirmed" boolean DEFAULT false,
  	"home_lineup_formation" varchar,
  	"home_lineup_head_coach" varchar,
  	"away_lineup_formation" varchar,
  	"away_lineup_head_coach" varchar,
  	"home_stats_possession" numeric,
  	"home_stats_shots" numeric,
  	"home_stats_shots_on_target" numeric,
  	"home_stats_corners" numeric,
  	"home_stats_passes_completed" numeric,
  	"home_stats_fouls" numeric,
  	"home_stats_offsides" numeric,
  	"home_stats_yellow_cards" numeric,
  	"away_stats_possession" numeric,
  	"away_stats_shots" numeric,
  	"away_stats_shots_on_target" numeric,
  	"away_stats_corners" numeric,
  	"away_stats_passes_completed" numeric,
  	"away_stats_fouls" numeric,
  	"away_stats_offsides" numeric,
  	"away_stats_yellow_cards" numeric,
  	"preview" varchar,
  	"player_of_the_match_id" integer,
  	"highlights_id" integer,
  	"report_headline" varchar,
  	"report_standfirst" varchar,
  	"report_author" varchar,
  	"report_hero_image_id" integer,
  	"report_body" jsonb,
  	"report_coach_quote" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "competitions_standings" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"team_id" integer,
  	"played" numeric DEFAULT 0,
  	"won" numeric DEFAULT 0,
  	"drawn" numeric DEFAULT 0,
  	"lost" numeric DEFAULT 0,
  	"goals_for" numeric DEFAULT 0,
  	"goals_against" numeric DEFAULT 0,
  	"points" numeric,
  	"form" varchar
  );
  
  CREATE TABLE "competitions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"short_name" varchar,
  	"type" "enum_competitions_type" NOT NULL,
  	"season" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "teams" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"short_name" varchar,
  	"slug" varchar,
  	"is_us" boolean DEFAULT false,
  	"crest_id" integer,
  	"home_ground" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "players_videos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"duration_seconds" numeric,
  	"caption" varchar,
  	"url" varchar,
  	"file_id" integer,
  	"poster_id" integer
  );
  
  CREATE TABLE "players_career" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"season" varchar NOT NULL,
  	"club" varchar NOT NULL,
  	"apps" numeric,
  	"goals" numeric,
  	"assists" numeric
  );
  
  CREATE TABLE "players" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_name" varchar,
  	"slug" varchar,
  	"status" "enum_players_status" DEFAULT 'active' NOT NULL,
  	"first_name" varchar NOT NULL,
  	"surname" varchar NOT NULL,
  	"squad_number" numeric,
  	"position_group" "enum_players_position_group" NOT NULL,
  	"position" varchar,
  	"date_of_birth" timestamp(3) with time zone,
  	"nationality" varchar,
  	"height_cm" numeric,
  	"preferred_foot" "enum_players_preferred_foot",
  	"joined" timestamp(3) with time zone,
  	"previous_club" varchar,
  	"contract_until" numeric,
  	"photo_id" integer,
  	"biography" jsonb,
  	"quote" varchar,
  	"socials_instagram" varchar,
  	"socials_x" varchar,
  	"socials_tiktok" varchar,
  	"season_overrides_appearances" numeric,
  	"season_overrides_starts" numeric,
  	"season_overrides_goals" numeric,
  	"season_overrides_assists" numeric,
  	"season_overrides_minutes" numeric,
  	"season_overrides_shots_on_target" numeric,
  	"season_overrides_yellow_cards" numeric,
  	"season_overrides_red_cards" numeric,
  	"career_before_club_appearances" numeric,
  	"career_before_club_starts" numeric,
  	"career_before_club_goals" numeric,
  	"career_before_club_assists" numeric,
  	"career_before_club_minutes" numeric,
  	"career_before_club_shots_on_target" numeric,
  	"career_before_club_yellow_cards" numeric,
  	"career_before_club_red_cards" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"published_at" timestamp(3) with time zone,
  	"featured" boolean DEFAULT false,
  	"category" "enum_articles_category",
  	"author" varchar,
  	"standfirst" varchar,
  	"hero_image_id" integer,
  	"body" jsonb,
  	"related_match_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_articles_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"players_id" integer
  );
  
  CREATE TABLE "_articles_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_published_at" timestamp(3) with time zone,
  	"version_featured" boolean DEFAULT false,
  	"version_category" "enum__articles_v_version_category",
  	"version_author" varchar,
  	"version_standfirst" varchar,
  	"version_hero_image_id" integer,
  	"version_body" jsonb,
  	"version_related_match_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__articles_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "_articles_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"players_id" integer
  );
  
  CREATE TABLE "videos" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"url" varchar,
  	"file_id" integer,
  	"poster_id" integer,
  	"duration_seconds" numeric,
  	"published_at" timestamp(3) with time zone NOT NULL,
  	"related_match_id" integer,
  	"related_player_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumb_url" varchar,
  	"sizes_thumb_width" numeric,
  	"sizes_thumb_height" numeric,
  	"sizes_thumb_mime_type" varchar,
  	"sizes_thumb_filesize" numeric,
  	"sizes_thumb_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar
  );
  
  CREATE TABLE "people" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"group" "enum_people_group" NOT NULL,
  	"since_year" numeric,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partners" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"tier" "enum_partners_tier" NOT NULL,
  	"url" varchar,
  	"logo_id" integer,
  	"blurb" varchar,
  	"show_on_home" boolean DEFAULT true,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "honours" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"competition" varchar NOT NULL,
  	"count" numeric DEFAULT 0,
  	"years" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "timeline_entries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"year" varchar NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "contact_submissions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"status" "enum_contact_submissions_status" DEFAULT 'new',
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"topic" "enum_contact_submissions_topic" NOT NULL,
  	"message" varchar NOT NULL,
  	"routed_to" varchar,
  	"email_status" "enum_contact_submissions_email_status",
  	"ip_hash" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter_subscribers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"consent" boolean DEFAULT false NOT NULL,
  	"consent_text" varchar,
  	"source" varchar DEFAULT 'footer',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "users_roles" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_users_roles",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"reset_password_requested_at" timestamp(3) with time zone,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"matches_id" integer,
  	"competitions_id" integer,
  	"teams_id" integer,
  	"players_id" integer,
  	"articles_id" integer,
  	"videos_id" integer,
  	"media_id" integer,
  	"people_id" integer,
  	"partners_id" integer,
  	"honours_id" integer,
  	"timeline_entries_id" integer,
  	"documents_id" integer,
  	"contact_submissions_id" integer,
  	"newsletter_subscribers_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "club_settings_departments" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"topic" "enum_club_settings_departments_topic" NOT NULL,
  	"email" varchar NOT NULL,
  	"show_card" boolean DEFAULT true,
  	"title" varchar NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "club_settings_faqs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );
  
  CREATE TABLE "club_settings_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"paragraph" varchar NOT NULL
  );
  
  CREATE TABLE "club_settings_crest_elements" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "club_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"club_name" varchar DEFAULT 'Ultimate Rovers' NOT NULL,
  	"founded" varchar,
  	"current_season" varchar DEFAULT '2026/27' NOT NULL,
  	"city" varchar,
  	"country" varchar,
  	"timezone" varchar DEFAULT 'Europe/London' NOT NULL,
  	"short_bio" varchar,
  	"tickets_url" varchar,
  	"broadcast_partner" varchar,
  	"crest_id" integer,
  	"ground_name" varchar,
  	"ground_capacity" numeric,
  	"ground_surface" varchar,
  	"ground_street" varchar,
  	"ground_city" varchar,
  	"ground_postcode" varchar,
  	"ground_accessible_entry" varchar,
  	"ground_map_url" varchar,
  	"ground_map_embed_url" varchar,
  	"ground_photo_id" integer,
  	"ground_guide" varchar,
  	"phone" varchar,
  	"reply_days" numeric DEFAULT 2,
  	"office_hours" varchar,
  	"matchday_hours" varchar,
  	"socials_instagram" varchar,
  	"socials_x" varchar,
  	"socials_youtube" varchar,
  	"socials_tiktok" varchar,
  	"socials_facebook" varchar,
  	"hero_intro" varchar DEFAULT 'Fixtures, results, the squad and every story from the club, in one place.',
  	"crest_story" varchar,
  	"about_intro" varchar,
  	"mission" varchar,
  	"vision" varchar,
  	"values" varchar,
  	"academy_text" varchar,
  	"community_text" varchar,
  	"academy_image_id" integer,
  	"community_image_id" integer,
  	"membership_text" varchar,
  	"season_ticket_text" varchar,
  	"matchday_ticket_text" varchar,
  	"match_ticket_text" varchar,
  	"partnership_text" varchar,
  	"privacy" jsonb,
  	"terms" jsonb,
  	"cookies" jsonb,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "club_settings_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"players_id" integer
  );
  
  ALTER TABLE "matches_events" ADD CONSTRAINT "matches_events_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_events" ADD CONSTRAINT "matches_events_related_player_id_players_id_fk" FOREIGN KEY ("related_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_events" ADD CONSTRAINT "matches_events_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches_home_lineup_starting" ADD CONSTRAINT "matches_home_lineup_starting_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_home_lineup_starting" ADD CONSTRAINT "matches_home_lineup_starting_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches_home_lineup_substitutes" ADD CONSTRAINT "matches_home_lineup_substitutes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_home_lineup_substitutes" ADD CONSTRAINT "matches_home_lineup_substitutes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches_away_lineup_starting" ADD CONSTRAINT "matches_away_lineup_starting_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_away_lineup_starting" ADD CONSTRAINT "matches_away_lineup_starting_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches_away_lineup_substitutes" ADD CONSTRAINT "matches_away_lineup_substitutes_player_id_players_id_fk" FOREIGN KEY ("player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches_away_lineup_substitutes" ADD CONSTRAINT "matches_away_lineup_substitutes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches_home_team_news" ADD CONSTRAINT "matches_home_team_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches_away_team_news" ADD CONSTRAINT "matches_away_team_news_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_competition_id_competitions_id_fk" FOREIGN KEY ("competition_id") REFERENCES "public"."competitions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_home_team_id_teams_id_fk" FOREIGN KEY ("home_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_away_team_id_teams_id_fk" FOREIGN KEY ("away_team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_player_of_the_match_id_players_id_fk" FOREIGN KEY ("player_of_the_match_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_highlights_id_videos_id_fk" FOREIGN KEY ("highlights_id") REFERENCES "public"."videos"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "matches" ADD CONSTRAINT "matches_report_hero_image_id_media_id_fk" FOREIGN KEY ("report_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "competitions_standings" ADD CONSTRAINT "competitions_standings_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "competitions_standings" ADD CONSTRAINT "competitions_standings_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "teams" ADD CONSTRAINT "teams_crest_id_media_id_fk" FOREIGN KEY ("crest_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players_videos" ADD CONSTRAINT "players_videos_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players_videos" ADD CONSTRAINT "players_videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "players_videos" ADD CONSTRAINT "players_videos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players_career" ADD CONSTRAINT "players_career_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "players" ADD CONSTRAINT "players_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_hero_image_id_media_id_fk" FOREIGN KEY ("hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_related_match_id_matches_id_fk" FOREIGN KEY ("related_match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_parent_id_articles_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_hero_image_id_media_id_fk" FOREIGN KEY ("version_hero_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v" ADD CONSTRAINT "_articles_v_version_related_match_id_matches_id_fk" FOREIGN KEY ("version_related_match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_articles_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_articles_v_rels" ADD CONSTRAINT "_articles_v_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_poster_id_media_id_fk" FOREIGN KEY ("poster_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_related_match_id_matches_id_fk" FOREIGN KEY ("related_match_id") REFERENCES "public"."matches"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "videos" ADD CONSTRAINT "videos_related_player_id_players_id_fk" FOREIGN KEY ("related_player_id") REFERENCES "public"."players"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "people" ADD CONSTRAINT "people_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "partners" ADD CONSTRAINT "partners_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users_roles" ADD CONSTRAINT "users_roles_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_matches_fk" FOREIGN KEY ("matches_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_competitions_fk" FOREIGN KEY ("competitions_id") REFERENCES "public"."competitions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_teams_fk" FOREIGN KEY ("teams_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_videos_fk" FOREIGN KEY ("videos_id") REFERENCES "public"."videos"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_people_fk" FOREIGN KEY ("people_id") REFERENCES "public"."people"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partners_fk" FOREIGN KEY ("partners_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_honours_fk" FOREIGN KEY ("honours_id") REFERENCES "public"."honours"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_timeline_entries_fk" FOREIGN KEY ("timeline_entries_id") REFERENCES "public"."timeline_entries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_submissions_fk" FOREIGN KEY ("contact_submissions_id") REFERENCES "public"."contact_submissions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_subscribers_fk" FOREIGN KEY ("newsletter_subscribers_id") REFERENCES "public"."newsletter_subscribers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_settings_departments" ADD CONSTRAINT "club_settings_departments_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."club_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_settings_faqs" ADD CONSTRAINT "club_settings_faqs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."club_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_settings_story" ADD CONSTRAINT "club_settings_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."club_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_settings_crest_elements" ADD CONSTRAINT "club_settings_crest_elements_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."club_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_settings" ADD CONSTRAINT "club_settings_crest_id_media_id_fk" FOREIGN KEY ("crest_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_settings" ADD CONSTRAINT "club_settings_ground_photo_id_media_id_fk" FOREIGN KEY ("ground_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_settings" ADD CONSTRAINT "club_settings_academy_image_id_media_id_fk" FOREIGN KEY ("academy_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_settings" ADD CONSTRAINT "club_settings_community_image_id_media_id_fk" FOREIGN KEY ("community_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "club_settings_rels" ADD CONSTRAINT "club_settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."club_settings"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "club_settings_rels" ADD CONSTRAINT "club_settings_rels_players_fk" FOREIGN KEY ("players_id") REFERENCES "public"."players"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "matches_events_order_idx" ON "matches_events" USING btree ("_order");
  CREATE INDEX "matches_events_parent_id_idx" ON "matches_events" USING btree ("_parent_id");
  CREATE INDEX "matches_events_player_idx" ON "matches_events" USING btree ("player_id");
  CREATE INDEX "matches_events_related_player_idx" ON "matches_events" USING btree ("related_player_id");
  CREATE INDEX "matches_home_lineup_starting_order_idx" ON "matches_home_lineup_starting" USING btree ("_order");
  CREATE INDEX "matches_home_lineup_starting_parent_id_idx" ON "matches_home_lineup_starting" USING btree ("_parent_id");
  CREATE INDEX "matches_home_lineup_starting_player_idx" ON "matches_home_lineup_starting" USING btree ("player_id");
  CREATE INDEX "matches_home_lineup_substitutes_order_idx" ON "matches_home_lineup_substitutes" USING btree ("_order");
  CREATE INDEX "matches_home_lineup_substitutes_parent_id_idx" ON "matches_home_lineup_substitutes" USING btree ("_parent_id");
  CREATE INDEX "matches_home_lineup_substitutes_player_idx" ON "matches_home_lineup_substitutes" USING btree ("player_id");
  CREATE INDEX "matches_away_lineup_starting_order_idx" ON "matches_away_lineup_starting" USING btree ("_order");
  CREATE INDEX "matches_away_lineup_starting_parent_id_idx" ON "matches_away_lineup_starting" USING btree ("_parent_id");
  CREATE INDEX "matches_away_lineup_starting_player_idx" ON "matches_away_lineup_starting" USING btree ("player_id");
  CREATE INDEX "matches_away_lineup_substitutes_order_idx" ON "matches_away_lineup_substitutes" USING btree ("_order");
  CREATE INDEX "matches_away_lineup_substitutes_parent_id_idx" ON "matches_away_lineup_substitutes" USING btree ("_parent_id");
  CREATE INDEX "matches_away_lineup_substitutes_player_idx" ON "matches_away_lineup_substitutes" USING btree ("player_id");
  CREATE INDEX "matches_home_team_news_order_idx" ON "matches_home_team_news" USING btree ("_order");
  CREATE INDEX "matches_home_team_news_parent_id_idx" ON "matches_home_team_news" USING btree ("_parent_id");
  CREATE INDEX "matches_away_team_news_order_idx" ON "matches_away_team_news" USING btree ("_order");
  CREATE INDEX "matches_away_team_news_parent_id_idx" ON "matches_away_team_news" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "matches_slug_idx" ON "matches" USING btree ("slug");
  CREATE INDEX "matches_competition_idx" ON "matches" USING btree ("competition_id");
  CREATE INDEX "matches_season_idx" ON "matches" USING btree ("season");
  CREATE INDEX "matches_kickoff_idx" ON "matches" USING btree ("kickoff");
  CREATE INDEX "matches_home_team_idx" ON "matches" USING btree ("home_team_id");
  CREATE INDEX "matches_away_team_idx" ON "matches" USING btree ("away_team_id");
  CREATE INDEX "matches_player_of_the_match_idx" ON "matches" USING btree ("player_of_the_match_id");
  CREATE INDEX "matches_highlights_idx" ON "matches" USING btree ("highlights_id");
  CREATE INDEX "matches_report_report_hero_image_idx" ON "matches" USING btree ("report_hero_image_id");
  CREATE INDEX "matches_updated_at_idx" ON "matches" USING btree ("updated_at");
  CREATE INDEX "matches_created_at_idx" ON "matches" USING btree ("created_at");
  CREATE INDEX "competitions_standings_order_idx" ON "competitions_standings" USING btree ("_order");
  CREATE INDEX "competitions_standings_parent_id_idx" ON "competitions_standings" USING btree ("_parent_id");
  CREATE INDEX "competitions_standings_team_idx" ON "competitions_standings" USING btree ("team_id");
  CREATE INDEX "competitions_updated_at_idx" ON "competitions" USING btree ("updated_at");
  CREATE INDEX "competitions_created_at_idx" ON "competitions" USING btree ("created_at");
  CREATE UNIQUE INDEX "teams_slug_idx" ON "teams" USING btree ("slug");
  CREATE INDEX "teams_crest_idx" ON "teams" USING btree ("crest_id");
  CREATE INDEX "teams_updated_at_idx" ON "teams" USING btree ("updated_at");
  CREATE INDEX "teams_created_at_idx" ON "teams" USING btree ("created_at");
  CREATE INDEX "players_videos_order_idx" ON "players_videos" USING btree ("_order");
  CREATE INDEX "players_videos_parent_id_idx" ON "players_videos" USING btree ("_parent_id");
  CREATE INDEX "players_videos_file_idx" ON "players_videos" USING btree ("file_id");
  CREATE INDEX "players_videos_poster_idx" ON "players_videos" USING btree ("poster_id");
  CREATE INDEX "players_career_order_idx" ON "players_career" USING btree ("_order");
  CREATE INDEX "players_career_parent_id_idx" ON "players_career" USING btree ("_parent_id");
  CREATE UNIQUE INDEX "players_slug_idx" ON "players" USING btree ("slug");
  CREATE INDEX "players_photo_idx" ON "players" USING btree ("photo_id");
  CREATE INDEX "players_updated_at_idx" ON "players" USING btree ("updated_at");
  CREATE INDEX "players_created_at_idx" ON "players" USING btree ("created_at");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles" USING btree ("slug");
  CREATE INDEX "articles_published_at_idx" ON "articles" USING btree ("published_at");
  CREATE INDEX "articles_hero_image_idx" ON "articles" USING btree ("hero_image_id");
  CREATE INDEX "articles_related_match_idx" ON "articles" USING btree ("related_match_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE INDEX "articles__status_idx" ON "articles" USING btree ("_status");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_players_id_idx" ON "articles_rels" USING btree ("players_id");
  CREATE INDEX "_articles_v_parent_idx" ON "_articles_v" USING btree ("parent_id");
  CREATE INDEX "_articles_v_version_version_slug_idx" ON "_articles_v" USING btree ("version_slug");
  CREATE INDEX "_articles_v_version_version_published_at_idx" ON "_articles_v" USING btree ("version_published_at");
  CREATE INDEX "_articles_v_version_version_hero_image_idx" ON "_articles_v" USING btree ("version_hero_image_id");
  CREATE INDEX "_articles_v_version_version_related_match_idx" ON "_articles_v" USING btree ("version_related_match_id");
  CREATE INDEX "_articles_v_version_version_updated_at_idx" ON "_articles_v" USING btree ("version_updated_at");
  CREATE INDEX "_articles_v_version_version_created_at_idx" ON "_articles_v" USING btree ("version_created_at");
  CREATE INDEX "_articles_v_version_version__status_idx" ON "_articles_v" USING btree ("version__status");
  CREATE INDEX "_articles_v_created_at_idx" ON "_articles_v" USING btree ("created_at");
  CREATE INDEX "_articles_v_updated_at_idx" ON "_articles_v" USING btree ("updated_at");
  CREATE INDEX "_articles_v_latest_idx" ON "_articles_v" USING btree ("latest");
  CREATE INDEX "_articles_v_rels_order_idx" ON "_articles_v_rels" USING btree ("order");
  CREATE INDEX "_articles_v_rels_parent_idx" ON "_articles_v_rels" USING btree ("parent_id");
  CREATE INDEX "_articles_v_rels_path_idx" ON "_articles_v_rels" USING btree ("path");
  CREATE INDEX "_articles_v_rels_players_id_idx" ON "_articles_v_rels" USING btree ("players_id");
  CREATE INDEX "videos_file_idx" ON "videos" USING btree ("file_id");
  CREATE INDEX "videos_poster_idx" ON "videos" USING btree ("poster_id");
  CREATE INDEX "videos_related_match_idx" ON "videos" USING btree ("related_match_id");
  CREATE INDEX "videos_related_player_idx" ON "videos" USING btree ("related_player_id");
  CREATE INDEX "videos_updated_at_idx" ON "videos" USING btree ("updated_at");
  CREATE INDEX "videos_created_at_idx" ON "videos" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumb_sizes_thumb_filename_idx" ON "media" USING btree ("sizes_thumb_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "people_photo_idx" ON "people" USING btree ("photo_id");
  CREATE INDEX "people_updated_at_idx" ON "people" USING btree ("updated_at");
  CREATE INDEX "people_created_at_idx" ON "people" USING btree ("created_at");
  CREATE INDEX "partners_logo_idx" ON "partners" USING btree ("logo_id");
  CREATE INDEX "partners_updated_at_idx" ON "partners" USING btree ("updated_at");
  CREATE INDEX "partners_created_at_idx" ON "partners" USING btree ("created_at");
  CREATE INDEX "honours_updated_at_idx" ON "honours" USING btree ("updated_at");
  CREATE INDEX "honours_created_at_idx" ON "honours" USING btree ("created_at");
  CREATE INDEX "timeline_entries_updated_at_idx" ON "timeline_entries" USING btree ("updated_at");
  CREATE INDEX "timeline_entries_created_at_idx" ON "timeline_entries" USING btree ("created_at");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE UNIQUE INDEX "documents_filename_idx" ON "documents" USING btree ("filename");
  CREATE INDEX "contact_submissions_updated_at_idx" ON "contact_submissions" USING btree ("updated_at");
  CREATE INDEX "contact_submissions_created_at_idx" ON "contact_submissions" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");
  CREATE INDEX "newsletter_subscribers_updated_at_idx" ON "newsletter_subscribers" USING btree ("updated_at");
  CREATE INDEX "newsletter_subscribers_created_at_idx" ON "newsletter_subscribers" USING btree ("created_at");
  CREATE INDEX "users_roles_order_idx" ON "users_roles" USING btree ("order");
  CREATE INDEX "users_roles_parent_idx" ON "users_roles" USING btree ("parent_id");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_matches_id_idx" ON "payload_locked_documents_rels" USING btree ("matches_id");
  CREATE INDEX "payload_locked_documents_rels_competitions_id_idx" ON "payload_locked_documents_rels" USING btree ("competitions_id");
  CREATE INDEX "payload_locked_documents_rels_teams_id_idx" ON "payload_locked_documents_rels" USING btree ("teams_id");
  CREATE INDEX "payload_locked_documents_rels_players_id_idx" ON "payload_locked_documents_rels" USING btree ("players_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_videos_id_idx" ON "payload_locked_documents_rels" USING btree ("videos_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_people_id_idx" ON "payload_locked_documents_rels" USING btree ("people_id");
  CREATE INDEX "payload_locked_documents_rels_partners_id_idx" ON "payload_locked_documents_rels" USING btree ("partners_id");
  CREATE INDEX "payload_locked_documents_rels_honours_id_idx" ON "payload_locked_documents_rels" USING btree ("honours_id");
  CREATE INDEX "payload_locked_documents_rels_timeline_entries_id_idx" ON "payload_locked_documents_rels" USING btree ("timeline_entries_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_contact_submissions_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_submissions_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_subscribers_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_subscribers_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");
  CREATE INDEX "club_settings_departments_order_idx" ON "club_settings_departments" USING btree ("_order");
  CREATE INDEX "club_settings_departments_parent_id_idx" ON "club_settings_departments" USING btree ("_parent_id");
  CREATE INDEX "club_settings_faqs_order_idx" ON "club_settings_faqs" USING btree ("_order");
  CREATE INDEX "club_settings_faqs_parent_id_idx" ON "club_settings_faqs" USING btree ("_parent_id");
  CREATE INDEX "club_settings_story_order_idx" ON "club_settings_story" USING btree ("_order");
  CREATE INDEX "club_settings_story_parent_id_idx" ON "club_settings_story" USING btree ("_parent_id");
  CREATE INDEX "club_settings_crest_elements_order_idx" ON "club_settings_crest_elements" USING btree ("_order");
  CREATE INDEX "club_settings_crest_elements_parent_id_idx" ON "club_settings_crest_elements" USING btree ("_parent_id");
  CREATE INDEX "club_settings_crest_idx" ON "club_settings" USING btree ("crest_id");
  CREATE INDEX "club_settings_ground_ground_photo_idx" ON "club_settings" USING btree ("ground_photo_id");
  CREATE INDEX "club_settings_academy_image_idx" ON "club_settings" USING btree ("academy_image_id");
  CREATE INDEX "club_settings_community_image_idx" ON "club_settings" USING btree ("community_image_id");
  CREATE INDEX "club_settings_rels_order_idx" ON "club_settings_rels" USING btree ("order");
  CREATE INDEX "club_settings_rels_parent_idx" ON "club_settings_rels" USING btree ("parent_id");
  CREATE INDEX "club_settings_rels_path_idx" ON "club_settings_rels" USING btree ("path");
  CREATE INDEX "club_settings_rels_players_id_idx" ON "club_settings_rels" USING btree ("players_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "matches_events" CASCADE;
  DROP TABLE "matches_home_lineup_starting" CASCADE;
  DROP TABLE "matches_home_lineup_substitutes" CASCADE;
  DROP TABLE "matches_away_lineup_starting" CASCADE;
  DROP TABLE "matches_away_lineup_substitutes" CASCADE;
  DROP TABLE "matches_home_team_news" CASCADE;
  DROP TABLE "matches_away_team_news" CASCADE;
  DROP TABLE "matches" CASCADE;
  DROP TABLE "competitions_standings" CASCADE;
  DROP TABLE "competitions" CASCADE;
  DROP TABLE "teams" CASCADE;
  DROP TABLE "players_videos" CASCADE;
  DROP TABLE "players_career" CASCADE;
  DROP TABLE "players" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "_articles_v" CASCADE;
  DROP TABLE "_articles_v_rels" CASCADE;
  DROP TABLE "videos" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "people" CASCADE;
  DROP TABLE "partners" CASCADE;
  DROP TABLE "honours" CASCADE;
  DROP TABLE "timeline_entries" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "contact_submissions" CASCADE;
  DROP TABLE "newsletter_subscribers" CASCADE;
  DROP TABLE "users_roles" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "club_settings_departments" CASCADE;
  DROP TABLE "club_settings_faqs" CASCADE;
  DROP TABLE "club_settings_story" CASCADE;
  DROP TABLE "club_settings_crest_elements" CASCADE;
  DROP TABLE "club_settings" CASCADE;
  DROP TABLE "club_settings_rels" CASCADE;
  DROP TYPE "public"."enum_matches_events_side";
  DROP TYPE "public"."enum_matches_events_type";
  DROP TYPE "public"."enum_matches_kickoff_tz";
  DROP TYPE "public"."enum_matches_ticket_availability";
  DROP TYPE "public"."enum_matches_status";
  DROP TYPE "public"."enum_competitions_type";
  DROP TYPE "public"."enum_players_status";
  DROP TYPE "public"."enum_players_position_group";
  DROP TYPE "public"."enum_players_preferred_foot";
  DROP TYPE "public"."enum_articles_category";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum__articles_v_version_category";
  DROP TYPE "public"."enum__articles_v_version_status";
  DROP TYPE "public"."enum_people_group";
  DROP TYPE "public"."enum_partners_tier";
  DROP TYPE "public"."enum_contact_submissions_status";
  DROP TYPE "public"."enum_contact_submissions_topic";
  DROP TYPE "public"."enum_contact_submissions_email_status";
  DROP TYPE "public"."enum_users_roles";
  DROP TYPE "public"."enum_club_settings_departments_topic";`)
}
