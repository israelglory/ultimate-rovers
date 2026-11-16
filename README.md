# Ultimate Rovers website

The official Ultimate Rovers club website: Next.js 16 with Payload CMS 3 in the same app, PostgreSQL, Tailwind CSS 4. Staff update matches, players and news at `/admin`; the public site updates straight away.

- Design handoff: [`ultimate-rovers-handoff/`](ultimate-rovers-handoff/)
- Architecture and decisions: [`PLAN.md`](PLAN.md), [`PROGRESS.md`](PROGRESS.md)

## Contents

1. [Run it locally](#run-it-locally)
2. [Scripts](#scripts)
3. [Environment variables](#environment-variables)
4. [Matchday guide for staff](#matchday-guide-for-staff)
5. [Deploy on a VPS with Coolify](#deploy-on-a-vps-with-coolify)
6. [Operations](#operations)
7. [Project layout](#project-layout)

## Run it locally

Requirements: Node 24 or newer, pnpm 12, Docker.

```bash
pnpm install
cp .env.example .env            # then set PAYLOAD_SECRET to a long random string
pnpm db:up                      # PostgreSQL 17 on 127.0.0.1:54329
pnpm seed                       # placeholder content so every page renders
pnpm dev                        # http://localhost:3000
```

Open `http://localhost:3000/admin` and create the first account. The first account is always an admin.

The seed fills every collection with placeholder content that copies the bracketed text in the designs, such as `[Opponent FC 3]` and `[Surname]`. None of it is real club information. Replace it in the admin before launch, or start from an empty database and skip `pnpm seed`.

Development tip: Turbopack sometimes misses route folders created while `pnpm dev` is running. Restart the dev server after adding a route.

## Scripts

| Command                                          | What it does                                                                                                                                   |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                       | Development server with hot reload                                                                                                             |
| `pnpm build`, `pnpm start`                       | Production build and server. The build needs no database.                                                                                      |
| `pnpm typecheck`, `pnpm lint`, `pnpm format`     | TypeScript, ESLint, Prettier                                                                                                                   |
| `pnpm test`                                      | Unit tests (Vitest)                                                                                                                            |
| `pnpm test:e2e`                                  | End-to-end and accessibility tests (Playwright and axe) against a production build on port 3100. Run `pnpm build` and seed the database first. |
| `pnpm lighthouse`                                | Mobile Lighthouse for Home, Fixtures, Match centre and Player. Start a production server first; set `BASE_URL` if it is not on port 3100.      |
| `pnpm seed`                                      | Placeholder content, only into an empty database                                                                                               |
| `pnpm seed:reset`                                | Replace all content with placeholders (user accounts are kept). Add `live` for a match in progress: `pnpm seed:reset live`                     |
| `pnpm migrate`                                   | Apply database migrations                                                                                                                      |
| `pnpm migrate:create <name>`                     | Create a migration after changing a collection                                                                                                 |
| `pnpm generate:types`, `pnpm generate:importmap` | Regenerate Payload types and the admin import map after schema changes                                                                         |

## Environment variables

| Variable                                                                                                   | Required  | Purpose                                                                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                             | Yes       | PostgreSQL connection string                                                                                                                                               |
| `PAYLOAD_SECRET`                                                                                           | Yes       | Signs admin sessions. At least 32 random characters. Changing it signs everyone out.                                                                                       |
| `SITE_URL`                                                                                                 | Yes       | Public address without a trailing slash, for example `https://ultimaterovers.com`. Used for canonical URLs, the sitemap, calendar feeds and share images. Read at runtime. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`                                          | For email | Any SMTP provider. Without `SMTP_HOST`, emails are written to the server log instead of sent.                                                                              |
| `EMAIL_FROM_ADDRESS`, `EMAIL_FROM_NAME`                                                                    | For email | Sender of contact form notifications                                                                                                                                       |
| `S3_BUCKET`, `S3_REGION`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_FORCE_PATH_STYLE` | Optional  | Store uploads in any S3-compatible bucket (AWS S3, Cloudflare R2, MinIO, Backblaze B2). Without `S3_BUCKET`, uploads go to the local volume.                               |
| `MEDIA_DIR`, `DOCUMENTS_DIR`                                                                               | Optional  | Local upload folders. The Docker image sets them to `/app/media` and `/app/documents-uploads`.                                                                             |
| `SEED_ON_EMPTY`                                                                                            | Optional  | `true` fills an empty database with placeholder content on first boot. It never runs once the database has matches or players.                                             |
| `PAYLOAD_DB_PUSH`                                                                                          | Optional  | `false` stops development schema sync. Used for databases managed by migrations.                                                                                           |

## Matchday guide for staff

Everything below happens in `/admin`. Editors can do all of it; only admins can change Club settings, users and the inbox of contact messages.

**Before the match**

1. Open **Matchday > Matches** and the fixture. On the **Match** tab, check kick-off, venue, broadcast and tickets. Set ticket availability to "On sale" and add the ticket link to show "Buy tickets".
2. On **Content**, add the match preview and team news.
3. On **Line-ups**, enter both starting elevens (goalkeeper first, then each line from defence to attack, from the left as the team attacks) and the formation. Tick "Line-ups confirmed" when they are official; until then the site says "Predicted line-ups".

**During the match**

1. On the **Live** tab set the status to Live and keep the minute up to date.
2. Add each goal, card and substitution under **Events** (choose the Rovers player from the list so their stats count; type opponents' names). Update the score and save.
3. Saving refreshes the match page, Home and Fixtures straight away. Supporters with the match page open see the new score and key moments within 30 seconds without reloading.
4. At the break set the status to Half time and fill in the half-time score. At the end set Full time.

**After the match**

Add stats, player of the match, highlights (create the video under **Content > Videos** first) and the report on the **Content** tab, or publish a "Match report" article linked to the match. Player season stats update automatically from line-ups and events.

**League table**: open **Matchday > Competitions**, the league for the season, and edit the standings rows.

## Deploy on a VPS with Coolify

The repository contains a `Dockerfile` (Next standalone server, non-root user, health check) and a `docker-compose.yml` with the app and PostgreSQL. Database migrations run automatically when the app starts.

### 1. Prepare

- A VPS with Coolify installed (2 vCPU and 2 GB RAM is enough to start; 4 GB makes builds faster).
- A domain pointing at the server, for example `ultimaterovers.com`.
- Optional: SMTP credentials and an S3-compatible bucket.

### 2. Create the application

1. In Coolify, create a project, then **New resource > Public or private repository** and select this repository and branch.
2. Choose the **Docker Compose** build pack. Coolify reads `docker-compose.yml`.
3. On the `app` service, set the domain to `https://ultimaterovers.com:3000`. Coolify's proxy issues the certificate and forwards to port 3000. Leave the `db` service without a domain so it is never public.

### 3. Set environment variables

In the resource's **Environment variables**:

```
POSTGRES_PASSWORD=<long random string>
PAYLOAD_SECRET=<at least 32 random characters>
SITE_URL=https://ultimaterovers.com
SEED_ON_EMPTY=false
SMTP_HOST=...            # optional, see the table above
EMAIL_FROM_ADDRESS=no-reply@ultimaterovers.com
S3_BUCKET=...            # optional
```

Generate secrets with `openssl rand -hex 32`. Set `SEED_ON_EMPTY=true` only for a demo or staging copy.

### 4. Deploy and check

1. Click **Deploy**. The first build takes a few minutes.
2. Coolify uses the container health check (`/api/health`). It returns 200 when the app can reach the database and 503 when it cannot.
3. Open `https://ultimaterovers.com/admin` and create the first account straight away: the first account becomes the admin.
4. In **Club settings**, fill in the club details, contact addresses per department, social links and legal text.

### 5. Persistent data

The compose file declares three volumes: `db` (PostgreSQL), `media` and `documents` (uploads, unless S3 is configured). Coolify keeps them between deploys. Enable Coolify's scheduled PostgreSQL backups on the `db` service and back up the upload volumes, or use S3 for uploads.

### Running the image without Coolify

```bash
POSTGRES_PASSWORD=... PAYLOAD_SECRET=... SITE_URL=http://localhost:3001 \
  docker compose -f docker-compose.yml -f docker-compose.local.yml up --build
```

The site is then on `http://localhost:3001`.

## Operations

- **Health**: `GET /api/health` returns `{ "status": "ok", "database": "ok" }`.
- **Schema changes**: edit a collection in `src/payload/collections/`, run `pnpm migrate:create <name>` against a database that is up to date, commit the generated files in `src/migrations/`, and deploy. Production applies pending migrations on boot.
- **Caching**: pages render on each request from a data cache. Saving in the CMS clears the affected entries immediately. Changes made outside the app (SQL, scripts) show within 60 seconds.
- **Rate limits**: the contact and newsletter forms accept 5 submissions per 10 minutes per IP address, counted per app process. With more than one app container, move the limiter to PostgreSQL.
- **Calendar feeds**: `/fixtures.ics` (whole season, subscribable) and `/matches/<slug>/calendar.ics`.
- **SEO**: `/sitemap.xml`, `/robots.txt`, share images for matches and players, JSON-LD on Home, matches, players and articles.

## Project layout

```
src/app/(site)/          public pages, one folder per route
src/app/(payload)/       Payload admin and REST API
src/app/api/             health check and the live match JSON endpoint
src/components/          shared UI (layout, match, squad, content, forms, ui, seo)
src/lib/data/            typed data access over the Payload local API, cached and tagged
src/lib/domain/          pure logic: stats, form, formation, standings, timeline, live polling
src/payload/             collections, the Club settings global, access rules, hooks
src/seed/                placeholder content
src/migrations/          database migrations
tests/unit/, tests/e2e/  Vitest and Playwright
```
