import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_SECONDS, tags } from '@/lib/cache-tags'
import { getPayloadClient } from '@/lib/payload'

/** Slugs and last-modified dates for matches and players. Articles come from articles.ts. */
export const getSitemapEntries = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const [matches, players] = await Promise.all([
      payload.find({
        collection: 'matches',
        select: { slug: true, updatedAt: true },
        limit: 5000,
        depth: 0,
        pagination: false,
      }),
      payload.find({
        collection: 'players',
        where: { status: { not_equals: 'left' } },
        select: { slug: true, updatedAt: true },
        limit: 1000,
        depth: 0,
        pagination: false,
      }),
    ])
    return {
      matches: matches.docs.map((d) => ({ slug: d.slug ?? String(d.id), updatedAt: d.updatedAt })),
      players: players.docs.map((d) => ({ slug: d.slug ?? String(d.id), updatedAt: d.updatedAt })),
    }
  },
  ['sitemap-entries'],
  { tags: [tags.matches, tags.players], revalidate: CACHE_SECONDS },
)
