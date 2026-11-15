# Ultimate Rovers website: design and build specification

Version 1.0, November 2026. Design system name: Matchday Navy.

This document is the contract between the design and the build. When it disagrees with the design files, the design files win on visuals and this document wins on behaviour, data and routes.

## 1. Sources of truth

| What | Where |
| --- | --- |
| Visual reference for every page | `design/*.dc.html`, viewable in `preview/` |
| Colours, type, spacing, radii | `tokens/tokens.json`, `tokens/tokens.css`, `design/StyleGuide.dc.html` |
| Crest | `assets/crest.png` (transparent, 333 x 379), `assets/crest-original.jpg` |
| Behaviour, data, routes | This document |

## 2. Brand rules

- Colours come from the crest: Night `#071341`, Crest Navy `#0E2A8C`, Pitch Cyan `#5CE1E6`, Chalk `#F4F7FB`, Ink `#0A1030`, Slate `#4A5578`. Full list in tokens.
- Cyan is never text on white. On cyan, text is always Night. Body text on Chalk is Ink or Slate.
- Display type: Big Shoulders Display 800 to 900, used for headlines, scores, squad numbers and player surnames. Surnames and the club name are uppercase. Everything else is sentence case.
- Body type: Archivo 400 to 700.
- Motif: the centre circle and halfway line, drawn at about 35% cyan opacity behind page headers and the crest. It is the only decoration. No gradients, no drop shadows, no emoji.
- Squad numbers on player panels are outlined (transparent fill, 2px cyan stroke).
- Crest minimum width 32px, clear space of half the ball's width. Never stretch or recolour.

## 3. Global layout

- Content max width 1280px, 24px gutters.
- Header: Night background, 3px cyan bottom border, crest plus wordmark, primary nav, "Get tickets" button. Active nav item is cyan with `aria-current="page"`. Below 900px the nav collapses to a menu button that opens a full-height overlay (see `MobileHome.dc.html`).
- Footer: Night background. Crest, short club line, social links (Instagram, X, YouTube, TikTok, Facebook), Club links, Matchday links, newsletter signup, legal bar (privacy, terms, cookie settings).
- Page header band ("PageHero"): Night background, centre-circle motif top right, display title, optional intro, optional filter row. Used on Fixtures, Squad, Stakeholders, News, Contact.
- Responsive: every row is flex-wrap or an auto-fit grid, so layouts stack at 390px without bespoke breakpoints. Wide tables scroll inside their own container. Minimum supported width 360px.
- Focus: 3px cyan outline, 2px offset, on every interactive element.

## 4. Routes

| Route | Design file | Notes |
| --- | --- | --- |
| `/` | `Main.dc.html`, `MobileHome.dc.html` | Home |
| `/fixtures` | `Fixtures.dc.html` | Tabs via `?view=fixtures|results|table`, filter via `?competition=` and `?season=` |
| `/matches/[slug]` | `MatchCentre.dc.html` | Slug like `2026-11-21-ultimate-rovers-vs-opponent-fc`. Tabs via `?tab=` |
| `/squad` | `Squad.dc.html` | Filter via `?position=goalkeepers|defenders|midfielders|forwards` |
| `/squad/[slug]` | `Player.dc.html` | Stats period via `?stats=season|career` |
| `/news` | `News.dc.html` | `?category=`, `?q=`, `?page=` |
| `/news/[slug]` | Not drawn | Build from the Report tab layout in `MatchCentre.dc.html` |
| `/club` | `About.dc.html` | |
| `/club/stakeholders` | `Stakeholders.dc.html` | In-page anchors `#board`, `#management`, `#technical`, `#investors`, `#partners`, `#governance` |
| `/contact` | `Contact.dc.html` | `?topic=` preselects the topic field |
| `/privacy`, `/terms`, `/cookies` | Not drawn | Simple long-form pages using the PageHero and report body styles |
| 404 | Not drawn | PageHero "Page not found", links to Home, Fixtures, Squad |
| `/admin` | n/a | CMS admin |

All UI state that a user might share (tab, filter, page) lives in the URL, not only in component state.

## 5. Component inventory

Build these as reusable components. The page column shows where each is drawn.

| Component | Variants and states | Drawn on |
| --- | --- | --- |
| SiteHeader, MobileNav | active item, menu open and closed | all |
| SiteFooter, NewsletterForm | idle, submitting, success, error | all |
| PageHero | with intro, with filters, with search | Fixtures, Squad, Stakeholders, News, Contact |
| Button | primary-light (navy), primary-dark (cyan), secondary (outline navy), outline-dark (white border), icon-only with aria-label | all |
| FilterChip | on and off, uses `aria-pressed` | Fixtures, Squad, News |
| Tag | competition tag on cyan-tint | Fixtures, Match centre |
| Tabs | underline style (Match centre), folder style (Fixtures), segmented (Player stats) | |
| NextMatchStrip, Countdown | upcoming only; hidden when no fixture is scheduled | Home |
| FixtureRow | home or away, ticket label changes ("Buy tickets" home, "Away tickets" away) | Fixtures |
| ResultRow, ResultCard | score chip, match centre and highlights links | Fixtures, Home |
| LeagueTable | compact (Pos, Team, P, GD, Pts) and full (adds W D L GF GA, Last 5), club row highlighted | Home, Fixtures |
| FormGuide | five boxes W, D, L, oldest left | Match centre, Fixtures table |
| PlayerCard | number outline, photo or silhouette fallback, name, position, nationality | Home, Squad, Player |
| PlayerHero, FactList, StatTile | | Player |
| VideoEmbed | facade first (poster plus play button), loads YouTube, Vimeo or MP4 on click; duration chip | Home, Player, Match centre |
| NewsCard | featured, compact (thumbnail left), grid | Home, News |
| PersonCard | photo or silhouette, role, name, "Since YYYY" | Stakeholders |
| PartnerGrid | principal (large dark panel), tiered logo grids | Home strip, Stakeholders |
| Timeline (MatchEvents) | goal G, yellow Y, red R, substitution S, markers (kick-off, half time, full time); home events left, away right | Match centre |
| PitchLineup | horizontal pitch, home left in cyan, away right in white, formation-driven coordinates, scrolls horizontally under 720px | Match centre |
| StatCompareRow | two values and a split bar sized by share | Match centre |
| HeadToHead | summary counts and last five meetings | Match centre |
| Scoreboard | upcoming, live, full time | Match centre |
| Accordion | one open at a time, `aria-expanded` | Contact |
| ContactForm | idle, field errors, submitting, sent | Contact |
| Breadcrumbs, Pagination, DocumentList, EmptyState | | Player, Match centre, News, Stakeholders |

Empty states copy is in the designs (for example "No fixtures in this competition yet. Choose All to see the full schedule."). Every list needs one.

## 6. Content model (CMS)

Everything in square brackets in the designs is CMS content. Suggested collections:

**Club settings** (global): name, short bio, founded year, city, crest, home ground (name, address, capacity, surface, accessible entry, map link), office hours, phone, department emails, social links, current season, broadcast partner.

**Competition**: name, short name, type (league, cup, friendly), season.

**Team** (opponents and the club itself): name, short name, crest, is_us flag, home ground.

**Match**: slug, competition, season, matchweek, kickoff (datetime with timezone), venue, home team, away team, status (scheduled, live, half_time, full_time, postponed, cancelled), minute (live), home score, away score, half-time scores, referee, attendance, broadcast, ticket URL and availability, preview text, team news (per side), events (array: minute, added time, side, type goal, own_goal, penalty, yellow, second_yellow, red, substitution; player, related player such as assist or player off; note), line-ups (per side: formation, starting XI with player, number and grid position; substitutes; head coach), stats (per side: possession, shots, shots on target, corners, passes completed, fouls, offsides, yellow cards), player of the match, highlights video, report (rich text, author, hero image, coach quote).

**Player**: slug, first name, surname, squad number, position group (goalkeeper, defender, midfielder, forward), specific position, date of birth, nationality, height, preferred foot, joined, previous club, contract until, cut-out photo (transparent PNG, 4:5), biography (rich text), quote, social links, videos (up to two: title, caption, URL or file, poster, duration), career history (season, club, apps, goals, assists), status (active, on loan, left).

Player season stats are derived from Match events and line-ups where possible (appearances, starts, minutes, goals, assists, cards). Allow manual overrides for figures not captured in events (shots on target, career totals before the club).

**Person** (stakeholders): name, role, group (board, management, technical, investors), photo, since year, order.

**Partner**: name, logo, tier (principal, official, supplier, community), URL, blurb, order.

**Article**: slug, title, standfirst, category (match report, squad news, club, academy, community), hero image, body (rich text with images and video embeds), author, published at, related match, related players.

**Video**: title, URL or upload, poster, duration, related match or player.

**Honour**: competition, count, years.

**Timeline entry** (About): year, title, text.

**Document** (governance): title, file, order.

**Submissions**: contact messages (name, email, phone, topic, message, created), newsletter subscribers (email, consent, created).

## 7. Behaviour

**Fixtures and results.** Fixtures grouped by month, soonest first. Results newest first. Table from a standings source (manual entry in the CMS first, an API later). "Sync fixtures to calendar" serves an ICS feed at `/fixtures.ics`; each fixture row also has a per-match ICS download.

**Match centre states.** Driven by `status`:

- Scheduled: kick-off time and countdown, Buy tickets, Add to calendar. Tabs: Preview, Line-ups (labelled "Predicted line-ups" until confirmed), Head to head. Preview shows match preview, team news, form guide, match details, tickets card.
- Live and half time: score, live badge with minute, scorers under each crest, Watch live. Tabs: Live, Line-ups, Stats, Head to head. Live shows Key moments up to now, form guide, match details.
- Full time: final and half-time score, scorers, Watch highlights. Tabs: Summary, Line-ups, Stats, Report, Head to head. Summary adds highlights video and player of the match, plus attendance.
- Postponed or cancelled: banner in place of the score, no countdown, link to the fixture list.

**Live updates.** Staff enter events in the CMS. On save, revalidate the match page, Home, Fixtures. While a match is live, the match page polls a lightweight JSON endpoint every 30 seconds and updates scoreboard and timeline without a full reload. Stop polling at full time or when the tab is hidden.

**Home.** Next match strip shows the next scheduled fixture. Recent results: last three. Table: six rows centred on the club's position. News: latest featured plus three. Squad spotlight: four players chosen in the CMS. Watch: latest three videos.

**Countdown.** Client-side, ticks each minute, uses the kickoff timezone, renders a static fallback on the server. Hidden once the match starts.

**Forms.** Contact and newsletter: server-side validation, honeypot plus rate limiting, clear inline errors under each field, success message in place ("Message sent", "You're subscribed"). Contact sends an email to the department address for the chosen topic and stores the submission.

**Video.** Facade first. Never autoplay with sound. Respect `prefers-reduced-motion`.

**Images.** Player cut-outs 4:5 transparent PNG; news 16:9; stadium 16:10. Silhouette fallback when a player photo is missing.

## 8. SEO and sharing

- Per-page title and description, canonical URLs, Open Graph and X cards.
- Dynamic OG images for matches (crests, teams, score or kick-off) and players (number, surname).
- JSON-LD: `SportsTeam` on Home, `SportsEvent` on match pages, `Person` on player pages, `NewsArticle` on articles.
- Sitemap and robots.

## 9. Accessibility

WCAG 2.2 AA. Real buttons and links, labelled inputs, `aria-current`, `aria-pressed`, `aria-selected`, `aria-expanded` as drawn. Tabs keyboard operable. Colour is never the only signal (event badges carry letters, table row highlight adds bold). All text meets 4.5:1; the palette was chosen to pass.

## 10. Performance

Targets on a mid-range phone over 4G: LCP under 2.5s, CLS under 0.1, INP under 200ms, Lighthouse 90+ in all categories. Self-host the two fonts with subsetting and `font-display: swap`. Server-render everything; ship client JS only for tabs that need it, filters, countdown, live polling, video facade, forms and the mobile menu.

## 11. Copy rules

Sentence case for labels and buttons. Buttons say what they do ("Buy tickets", "Send message"). No em dashes anywhere in UI copy or docs.
