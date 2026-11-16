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
- Seed (`pnpm seed`, `pnpm seed:reset`, `pnpm seed:reset live`): crest, 12 teams, 4 competitions with a full league table, 19 players numbered as drawn, 19 matches across two seasons (20 with `live`) (results with events, line-ups and stats, one fully written-up full-time match, a postponed cup tie, upcoming fixtures with a preview and predicted line-ups), 12 articles, 3 videos, 23 people, 12 partners, honours, timeline, 4 placeholder PDFs and every Club settings field.
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

## Phase 3: Matchday

**Done**

- Fixtures (`/fixtures`): folder tabs for Fixtures, Results and Table (`?view=`), competition chips (`?competition=league|cup|friendly`) and a season select (`?season=2025-26`). Fixtures are grouped by month in the club timezone, soonest first; results newest first; full table with W D L GF GA, GD, points and last-five dots. Every list has its empty state. Tickets and matchday cards below.
- Fixture rows: home or away, competition tag, kick-off chip (or Postponed, Cancelled, live score), Match centre, "Buy tickets" or "Away tickets" only when tickets are on sale, "Sold out" when sold out, and a per-match calendar download.
- ICS: `/fixtures.ics` (current season, subscribable) and `/matches/[slug]/calendar.ics`.
- Match centre (`/matches/[slug]`): breadcrumbs; scoreboard for scheduled (kick-off time and countdown, Buy tickets, Add to calendar), live and half time (score, live badge with minute, scorers, Watch live), full time (final and half-time score, Watch highlights), postponed and cancelled (banner with the reason, back to fixtures); Share. Tabs per state via `?tab=`. Summary and Live: key moments with kick-off, half-time and full-time markers, highlights, match details, player of the match. Preview: match preview, team news, tickets card. Form guide, line-ups on a formation-driven pitch with benches, stats with split bars, report (from the match or the linked match report article), head to head, and Coming up.
- Live updates: `/api/live/[slug]` returns an uncached JSON snapshot. The page polls every 30 seconds while live or at half time, pauses when the tab is hidden, fetches at once when it returns, and refreshes into the full-time layout when the status changes. Verified in a browser: a CMS save showed on an open page within one poll, with no reload.
- Home: hero with crest and motif, next match strip with countdown (hidden when nothing is scheduled), recent results, six-row table around the club, latest news (lead plus three), squad spotlight (CMS choice, or the first player in each position), Watch, crest story, partner strip. The phone layout follows MobileHome.dc.html (crest behind the title, stacked next-match card, scrolling results, two-column squad).
- Components: TabList (URL-driven ARIA tabs in folder, underline and segmented styles, arrow keys, Home and End), ParamForm (GET filters that work without JavaScript and produce clean URLs with it), FilterChip, TeamCrest, Countdown, FixtureRow, ResultRow, ResultCard, CompactTable, FullTable, FormDots, FormBoxes, MatchHero, MatchTimeline, PitchLineup, Bench, StatsComparison, HeadToHead, NextMatchStrip, VideoEmbed, RichText, NewsCard variants, PlayerCard variants, PlayerSilhouette, PartnerLogo, Breadcrumbs, EmptyState, SectionHeader, ShareButton, JsonLd.

**Decisions**

- Tabs are links with `role="tab"`: the server renders only the selected panel, so tab state is shareable and works without JavaScript. With JavaScript, keyboard selection uses `router.replace`, so tabs do not add history entries.
- Filter chips are submit buttons inside a GET form, which keeps `aria-pressed` on real buttons as drawn and still works without JavaScript.
- The browser's `normal` line height is restored globally because every design file relies on it; Tailwind's preflight sets 1.5.
- Media URLs from Payload are reduced to their path so `next/image` treats them as local under any domain.
- Kick-off within the last two hours still counts as the next match on Home until staff set it live.
- Result cards show the real home team on the left (PLAN gap 8). Opponent form comes from the league table form column.
- Scroll containers are positioning contexts, so screen-reader-only text inside them cannot widen the page. Checked every page at 360px: no horizontal page scroll.

**Fixed along the way**

- The live poller called the browser's `setInterval` as a method of another object, which throws "Illegal invocation" in browsers but not in Node. Found by the browser check above; the timers are now wrapped.
- Turbopack's dev server sometimes misses route folders created while it is running; restart `pnpm dev` after adding routes.

**Deferred**

- Opponent crests are the dashed placeholder until crests are uploaded to Teams.

## Phase 4: Squad

**Done**

- Squad (`/squad`): position chips with counts (`?position=goalkeepers|defenders|midfielders|forwards`), groups with headings and counts, outlined squad numbers, crest, silhouette fallback, "Behind the squad" panel. Empty states for the whole squad and for a single position.
- Player profile (`/squad/[slug]`): breadcrumbs with previous and next player (squad order), hero with outlined number, cut-out or silhouette, position and number chips, facts, social links and Share profile. Stats with a segmented toggle (`?stats=season|career`), videos (facade, durations, "coming soon" when no source), biography and quote, career table, and "More forwards" (same position group). Person JSON-LD.
- Season stats are counted from line-ups and events with manual overrides; career Rovers rows fill themselves from matches.

**Decisions**

- Only active players are listed. On-loan players keep a profile (with an "On loan" chip); players who left return 404.
- Shots on target show "-" until a figure is entered, because events never capture them, rather than a misleading 0.
- Eight stat tiles sit in a 4 by 2 grid (2 by 4 on phones). The design drew six tiles in an auto-fit grid, which leaves one orphan tile with eight.
- Empty facts are hidden rather than shown as placeholders.
- Fixed: the Lexical renderer ignores `className` when its container is disabled, so rich text is wrapped in its own styled element (this also fixes the match report body).

## Phase 5: Club

**Done**

- About (`/club`): intro with crest and motif, story with timeline, reading the crest, mission, vision and values, honours, home ground with directions, academy and community cards, membership panel. Rows and blocks without content are hidden.
- Stakeholders (`/club/stakeholders`): in-page anchors `#board`, `#management`, `#technical`, `#investors`, `#partners`, `#governance`; person cards with photo or silhouette; principal partner panel and tiered logo grids (dashed name boxes until logos are uploaded); governance PDFs with download links; Partner with us.
- News (`/news`): search (`?q=`), category chips (`?category=`), lead story on the unfiltered first page, card grid, pagination (`?page=`), and empty states for categories and searches.
- Article (`/news/[slug]`): built from the Report tab layout, with breadcrumbs, related match and players, Share, "Read next" and NewsArticle JSON-LD.
- Contact (`/contact`): department cards, contact form (idle, field errors with focus on the first invalid field, submitting, sent with "Send another message"), `?topic=` preselects the topic, map embed or placeholder, club office and hours, one-open-at-a-time accordion.
- Legal pages (`/privacy`, `/terms`, `/cookies`) from Club settings rich text, with an empty state until written.
- 404 inside the site chrome with links to Home, Fixtures and Squad (from Phase 1).

**Decisions**

- The news search box sits beside the title as drawn and joins the filter form through the HTML `form` attribute, so search and chips share one GET form and work without JavaScript.
- Searches are not stored in the data cache, because free text would create unbounded cache entries. Search result pages are `noindex`.
- Accordion answers stay in the HTML with `hidden`, so find-in-page and search engines still see them.
- Phone numbers only become `tel:` links when they contain at least six digits.
- The cookie page states that the site sets only essential cookies; "Cookie settings" in the footer links there (PLAN gap 10).
