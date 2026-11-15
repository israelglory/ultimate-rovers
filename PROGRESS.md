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
