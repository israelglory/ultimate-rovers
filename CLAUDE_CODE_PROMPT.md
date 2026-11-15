You are the senior full-stack engineer and tech lead on the official website for Ultimate Rovers, a football club. You own architecture, code quality, and delivery. Build it to the standard of a production club site that staff will update on matchdays without a developer.

## Inputs (read all of these before writing code)

This repo contains a design handoff folder, `ultimate-rovers-handoff/`:

- `docs/DESIGN_SPEC.md`: routes, components, content model, behaviour, SEO, accessibility and performance targets. This is your contract.
- `docs/DESIGN_FORMAT.md`: how to read the design files.
- `design/*.dc.html`: the exact markup and styling of every page (Home, Fixtures, Match centre, Squad, Player, Stakeholders, About, News, Contact, mobile Home, Design system).
- `preview/`: the same pages running in a browser. Serve the folder (`npx serve ultimate-rovers-handoff`) and open `/preview/` to see and click through them.
- `tokens/tokens.json` and `tokens/tokens.css`: the design tokens.
- `assets/crest.png`: the transparent crest.

The designs are the visual source of truth. Match them closely: layout, spacing, type sizes, colours, radii, states. Do not copy the inline-style markup into the codebase; rebuild it as clean components that use the tokens.

## Stack

Use this stack unless you find a concrete blocker, in which case stop and explain before switching:

- Next.js (App Router, current stable) with TypeScript in strict mode, React Server Components by default.
- Tailwind CSS with the theme mapped from `tokens/tokens.css`. No hardcoded hex values in components.
- Payload CMS 3 embedded in the same Next.js app, admin at `/admin`, PostgreSQL via the Postgres adapter.
- Fonts self-hosted with `next/font`: Big Shoulders Display (700, 800, 900) and Archivo (400 to 700).
- Media: local volume in development, S3-compatible storage adapter configurable by env for production.
- Email: SMTP via env (works with any provider).
- Tests: Vitest for units, Playwright for end to end.
- Deployment: one Dockerfile and docker-compose (app plus Postgres) that deploys cleanly on a VPS through Coolify. Health check endpoint at `/api/health`.
- pnpm, ESLint, Prettier, and a GitHub Actions workflow for typecheck, lint, test and build.

## Architecture expectations

- Feature folders: `app/(site)/...` for pages, `components/` for shared UI, `lib/` for data access, `payload/collections/` for the schema.
- Model every collection from section 6 of the spec with access control: public read for published content, authenticated write, an `editor` role for matchday staff and an `admin` role.
- All data access goes through typed functions in `lib/` using the Payload local API. No CMS calls from client components.
- URL search params own shareable UI state (tabs, filters, pagination) as listed in the route table.
- Revalidate affected pages from Payload `afterChange` hooks (match saved: match page, Home, Fixtures). For live matches, add a small JSON route the match page polls every 30 seconds while status is live or half time, paused when the tab is hidden.
- Derive player season stats from match events and line-ups, with manual override fields.
- ICS feeds: `/fixtures.ics` for the season and a per-match download.
- Contact and newsletter: server actions with zod validation, honeypot, rate limiting, stored submissions, and email routing by topic.
- Seed script that fills every collection with clearly marked placeholder data mirroring the bracketed content in the designs, so every page renders fully on a fresh install. Never present placeholder data as real club facts.

## Quality bar

- Pixel-close to the designs at 1440px and 390px. Every layout must hold from 360px up.
- WCAG 2.2 AA: semantic elements, labelled controls, keyboard operable tabs and accordion, visible cyan focus ring, aria attributes as drawn.
- Performance: Lighthouse 90+ on mobile for Home, Fixtures, Match centre, Player. LCP under 2.5s, CLS under 0.1. Minimal client JS.
- SEO: metadata, sitemap, robots, JSON-LD (SportsTeam, SportsEvent, Person, NewsArticle), dynamic OG images for matches and players.
- Every list has the empty state from the design. Every form has idle, error, submitting and success states.
- No em dashes in UI copy, seed data, comments or docs.

## How to work

1. Read everything in `ultimate-rovers-handoff/`, then open the preview pages. Write `PLAN.md` with your architecture, folder structure, collection schemas, component list mapped to design files, and the phase plan below with estimates. Flag any gaps or contradictions you find in the spec. Stop and wait for my approval.
2. Work phase by phase. At the end of each phase: run typecheck, lint, tests and a production build; update `PROGRESS.md` with what was done, decisions made and anything deferred; commit with a clear message; then give me a short summary and wait before starting the next phase.
3. When the design does not cover something (article page, legal pages, 404, admin edge cases), build it from existing components and the spec's guidance, and note the decision in `PROGRESS.md`.
4. Ask before adding any dependency not listed above, and before changing a route, collection or token.

## Phases

1. Foundation: project setup, tokens in Tailwind, fonts, Payload with Postgres, Docker, CI, SiteHeader, MobileNav, SiteFooter, PageHero, buttons, chips, tags.
2. Content model and seed: all collections, roles, access rules, seed script, typed data layer.
3. Matchday: Fixtures (tabs, filters, table, ICS), Match centre (all states, timeline, line-up pitch, stats, head to head, report, live polling), Home.
4. Squad: Squad list with position filter, Player profile with stats toggle, videos and career.
5. Club: About, Stakeholders, News list and article, Contact with forms, legal pages, 404.
6. Hardening: SEO, OG images, accessibility audit with axe, Lighthouse pass, Playwright end-to-end tests for the main journeys (home to match centre, squad to player, filter fixtures, send contact message), deploy guide in `README.md` for Coolify.

Start with step 1 of "How to work": read the handoff and write `PLAN.md`.
