# Progress

Log of what each phase delivered, the decisions taken and anything deferred. Newest phase last.

## Phase 1: Foundation

**Done**

- Repo: the handoff moved into `ultimate-rovers-handoff/` (untouched) and the app lives at the root. Work happens on the `feat/club-website` branch.
- Next.js 16.4 (App Router, Turbopack) with TypeScript 6 strict plus `noUncheckedIndexedAccess`. Payload 3.93 embedded: admin at `/admin`, REST at `/api`, GraphQL disabled.
- PostgreSQL 17 through `@payloadcms/db-postgres`. Local database via `docker-compose.dev.yml` on port 54329.
- Tailwind 4 theme in `src/styles/theme.css` generated from the tokens. The default palette, fonts and radii are cleared so only token names exist. `tests/unit/tokens.test.ts` fails if the theme drifts from `tokens.json`.
- Fonts self-hosted through `next/font` with `display: swap`.
- Users collection with `admin` and `editor` roles, field-level protection on roles, the first account becomes admin. Media collection with alt text required and resized variants.
- Media on local disk by default, S3-compatible storage when `S3_BUCKET` is set. SMTP email when `SMTP_HOST` is set, console otherwise.
- `/api/health` checks the database and returns 503 when it is unreachable.
- Dockerfile (standalone output, non-root user, health check, volumes for uploads), `docker-compose.yml` for Coolify, `docker-compose.local.yml` to run the image locally, GitHub Actions for typecheck, lint, format, unit tests, build and end-to-end tests.
- Components: SiteHeader with desktop nav (`aria-current`), MobileNav (menu button and full-height overlay), SiteFooter (desktop columns and the compact phone layout), NewsletterForm UI, PageHero, Button variants, FilterChip, Tag, SocialLinks, icons, motif.
- Unknown URLs render the site 404 inside the site chrome.

**Decisions**

- `SITE_URL` replaces `NEXT_PUBLIC_SITE_URL`: `NEXT_PUBLIC_*` values are frozen at build time, and Coolify must be able to set the domain at runtime.
- Big Shoulders Display no longer exists as its own Google family; it is now the `opsz` axis of the variable "Big Shoulders" family. The theme's `font-display` sets `opsz 72`, which is the Display cut, so the result matches the designs.
- The design files use `content-box`, so their 1280px max width excludes the gutters. The `wrap` utility reproduces that: 1280px of content plus 24px gutters (16px on phones, as drawn in MobileHome).
- The mobile menu is a native modal `<dialog>`: focus trap, Escape and top-layer stacking with no extra code. It repeats the header bar so the close button sits exactly where the menu button was.
- The phone footer follows MobileHome but keeps the newsletter signup and legal links, which the spec requires in the footer.
- Button padding and height are replaceable options, never stacked classes, to avoid Tailwind class conflicts without adding `tailwind-merge`.
- Next 16 writes an `AGENTS.md` on `next dev`; disabled with `agentRules: false` because it is not part of this project and contains em dashes.
- `server-only` added (Next's own guard against importing server code into client bundles). TypeScript pinned to 6.0 because typescript-eslint does not support TypeScript 7 yet. ESLint pinned to 9 for plugin compatibility.

**Deferred**

- The newsletter action returns "opens soon" until the subscribers collection exists (Phase 2).
- Header and footer read placeholder club data until Club settings exists (Phase 2).

## Phase 2: Content model and seed

**Done**

- Collections: matches, competitions (with manual standings), teams, players, articles (drafts and versions), videos, media, people, partners, honours, timeline entries, documents (PDF uploads), contact messages, newsletter subscribers, users. Global: Club settings with tabs for General, Ground, Contact, Social, Home, About, Tickets, Stakeholders and Legal.
- Access: public read for published content; admins and editors write content; only admins edit Club settings, users and the two inboxes. Form submissions cannot be created through the REST API, only by the server actions through the local API.
- Match admin is grouped into Match, Live, Line-ups, Stats and Content tabs. Slugs are generated from the kickoff date in the kickoff timezone and both team names (`2026-11-21-ultimate-rovers-vs-opponent-fc`), and stay stable once set. The title and default venue come from the teams. Kickoff stores its own timezone.
- Revalidation: every collection and the global have `afterChange` and `afterDelete` hooks that clear cache tags (with `expire: 0`, so the next request is fresh) and paths. Saving a match clears the match page, Home, Fixtures and player stats.
- Typed data layer in `src/lib/data/` over the Payload local API, mapping documents into view models (`src/lib/types.ts`). Pure logic in `src/lib/domain/`: player stats from events and line-ups with overrides, career totals, form guide, head to head, formation geometry, standings sorting and the six-row window, timeline with markers, tabs per match state, scorers.
- Form handlers with zod validation, honeypot, rate limiting (5 per 10 minutes per IP), stored submissions with hashed IPs, and email routing by topic through the Club settings departments. Newsletter signups are idempotent and never reveal whether an address was already subscribed.
- Seed (`pnpm seed`, `pnpm seed:reset`, `pnpm seed:reset live`): crest, 12 teams, 4 competitions with a full league table, 19 players numbered as drawn, 21 matches across three seasons (results with events, line-ups and stats, one fully written-up full-time match, a postponed cup tie, upcoming fixtures with a preview and predicted line-ups), 12 articles, 3 videos, 23 people, 12 partners, honours, timeline, 4 placeholder PDFs and every Club settings field.
- Initial Payload migration, applied automatically on production boot. `SEED_ON_EMPTY=true` seeds a fresh install on first boot.
- Unit tests: 87 across tokens, navigation, stats, formation, standings, match logic, ICS, URL params, slugs, formatting, countdown, validation, rate limiting, video links and access rules.

**Decisions**

- Seeded copy keeps the bracket convention from the designs. Numbers (scores, standings, stats, attendances) only attach to bracketed placeholder teams and players. Placeholder facts about the club itself (capacity, founding year, staff start dates) are left empty rather than invented, and their rows are hidden until real data is entered.
- Department emails use `example.com` addresses because the email field validates; `[clubdomain]` cannot be stored.
- Seeded videos have no source; the site shows them as "coming soon" until a link or file is added.
- A second yellow counts as one yellow and one red card. Starters play to 90 minutes; added time is not counted.
- Career appearances, goals and assists are the sum of the career table (Rovers rows filled from matches when left empty). Other career figures are the pre-club totals plus all Rovers seasons.
- Opponent form in the match centre comes from the league table form column, since the CMS only holds Rovers matches.
- `payload run` only forwards positional words, so seed options are `reset` and `live`, not `--flags`.
- `PAYLOAD_DB_PUSH=false` turns off development schema push for databases managed by migrations (CI, `pnpm migrate`).
- Cached queries fall back to a 60-second lifetime. CMS saves clear tags instantly; the fallback only covers writes from outside the app (seed, SQL), which cannot reach Next's cache.
- Site pages render per request over the cache, so `next build` never needs a database (verified with an unreachable database URL).

**Deferred**

- Rate limiting is per process. With more than one app replica it should move to Postgres.
