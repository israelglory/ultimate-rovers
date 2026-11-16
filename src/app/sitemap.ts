import type { MetadataRoute } from 'next'

import { getArticleSitemap } from '@/lib/data/articles'
import { getSitemapEntries } from '@/lib/data/sitemap'
import { siteUrl } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const statics: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/fixtures`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/squad`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/news`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${base}/club`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/club/stakeholders`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/cookies`, changeFrequency: 'yearly', priority: 0.2 },
  ]
  try {
    const [{ matches, players }, articles] = await Promise.all([
      getSitemapEntries(),
      getArticleSitemap(),
    ])
    return [
      ...statics,
      ...matches.map((m) => ({
        url: `${base}/matches/${m.slug}`,
        lastModified: m.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      })),
      ...players.map((p) => ({
        url: `${base}/squad/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      })),
      ...articles.map((a) => ({
        url: `${base}/news/${a.slug}`,
        lastModified: a.updatedAt,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    ]
  } catch (error) {
    // A database outage should not take the whole sitemap down.
    console.error('[sitemap] could not load dynamic entries', error)
    return statics
  }
}
