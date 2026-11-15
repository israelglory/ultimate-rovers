/** URL-safe slug: lowercase ASCII, words joined by single hyphens. "[Opponent FC]" becomes "opponent-fc". */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Calendar date (YYYY-MM-DD) of an instant in a given IANA timezone. */
export function localDate(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')}`
}

/** Match slug as specified: `2026-11-21-ultimate-rovers-vs-opponent-fc`, dated in the kickoff timezone. */
export function matchSlug(
  kickoffIso: string,
  timeZone: string,
  home: string,
  away: string,
): string {
  return `${localDate(kickoffIso, timeZone)}-${slugify(home)}-vs-${slugify(away)}`
}
