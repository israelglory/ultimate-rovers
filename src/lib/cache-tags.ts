/** Cache tags shared by the data layer (unstable_cache) and the Payload revalidation hooks. */
export const tags = {
  matches: 'matches',
  match: (slug: string) => `match:${slug}`,
  teams: 'teams',
  competitions: 'competitions',
  players: 'players',
  player: (slug: string) => `player:${slug}`,
  articles: 'articles',
  article: (slug: string) => `article:${slug}`,
  videos: 'videos',
  people: 'people',
  partners: 'partners',
  honours: 'honours',
  timeline: 'timeline',
  documents: 'documents',
  media: 'media',
  club: 'club',
} as const

/** Every collection-wide tag, for changes that can touch any page (media edits, club settings). */
export const allListTags: string[] = (Object.values(tags) as unknown[]).filter(
  (t): t is string => typeof t === 'string',
)

/**
 * Fallback lifetime for cached queries. CMS saves invalidate tags immediately; this only matters
 * for writes made outside the app (seed script, SQL), which cannot reach Next's cache.
 */
export const CACHE_SECONDS = 60
