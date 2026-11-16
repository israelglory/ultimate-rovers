import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Where } from 'payload'

import { CACHE_SECONDS, tags } from '@/lib/cache-tags'
import { getPayloadClient } from '@/lib/payload'
import type { NewsCategory } from '@/lib/search-params'
import type { Article } from '@/payload-types'
import type { ImageRef, RichTextValue } from '@/lib/types'

import { populated, toImage, toPlayerRef } from './mappers'

export const categoryLabels: Record<NewsCategory, string> = {
  'match-report': 'Match report',
  'match-preview': 'Match preview',
  'squad-news': 'Squad news',
  club: 'Club',
  academy: 'Academy',
  community: 'Community',
}

/** Plural chip labels on the News page. */
export const categoryChipLabels: Record<NewsCategory, string> = {
  'match-report': 'Match reports',
  'match-preview': 'Match previews',
  'squad-news': 'Squad news',
  club: 'Club',
  academy: 'Academy',
  community: 'Community',
}

export type ArticleCard = {
  id: number
  slug: string
  title: string
  standfirst: string
  category: NewsCategory
  categoryLabel: string
  publishedAt: string
  readMinutes: number
  heroImage: ImageRef | null
}

export type ArticleDetail = ArticleCard & {
  author: string | null
  body: RichTextValue | null
  relatedMatchSlug: string | null
  relatedPlayers: Array<{ slug: string; name: string }>
}

/** Words in a Lexical tree, for the "[#] min read" label. */
export function countWords(node: unknown): number {
  if (!node || typeof node !== 'object') return 0
  const n = node as { text?: unknown; children?: unknown[]; root?: unknown }
  let count = typeof n.text === 'string' ? n.text.split(/\s+/).filter(Boolean).length : 0
  if (n.root) count += countWords(n.root)
  if (Array.isArray(n.children)) for (const child of n.children) count += countWords(child)
  return count
}

export const readMinutes = (body: unknown, standfirst = '') =>
  Math.max(1, Math.round((countWords(body) + standfirst.split(/\s+/).length) / 220))

function toCard(a: Article): ArticleCard {
  return {
    id: a.id,
    slug: a.slug ?? String(a.id),
    title: a.title,
    standfirst: a.standfirst,
    category: a.category,
    categoryLabel: categoryLabels[a.category],
    publishedAt: a.publishedAt,
    readMinutes: readMinutes(a.body, a.standfirst),
    heroImage: toImage(a.heroImage, 'card'),
  }
}

const published: Where = { _status: { equals: 'published' } }

export type ArticleList = {
  featured: ArticleCard | null
  items: ArticleCard[]
  page: number
  totalPages: number
  total: number
}

export const PAGE_SIZE = 9

async function loadList({
  category,
  q,
  page,
}: {
  category?: NewsCategory
  q?: string
  page: number
}): Promise<ArticleList> {
  const payload = await getPayloadClient()
  const filters: Where[] = [published]
  if (category) filters.push({ category: { equals: category } })
  if (q) filters.push({ or: [{ title: { like: q } }, { standfirst: { like: q } }] })
  const where: Where = { and: filters }

  // The lead story only appears on the unfiltered first page, as drawn.
  const showFeatured = !category && !q && page === 1
  let featured: ArticleCard | null = null
  if (showFeatured) {
    const lead = await payload.find({
      collection: 'articles',
      where: { and: [published, { featured: { equals: true } }] },
      sort: '-publishedAt',
      limit: 1,
      depth: 1,
    })
    const leadDoc = lead.docs[0]
    if (leadDoc) {
      featured = toCard(leadDoc)
      filters.push({ id: { not_equals: leadDoc.id } })
    }
  }
  const result = await payload.find({
    collection: 'articles',
    where,
    sort: '-publishedAt',
    limit: PAGE_SIZE,
    page,
    depth: 1,
  })
  return {
    featured: featured ? { ...featured, heroImage: featured.heroImage } : null,
    items: result.docs.map(toCard),
    page: result.page ?? page,
    totalPages: Math.max(1, result.totalPages),
    total: result.totalDocs,
  }
}

/** Searches skip the data cache: free text would create an unbounded number of entries. */
export const listArticles = (args: { category?: NewsCategory; q?: string; page: number }) =>
  args.q
    ? loadList(args)
    : unstable_cache(
        () => loadList(args),
        ['articles-list', args.category ?? 'all', args.q ?? '', String(args.page)],
        {
          tags: [tags.articles, tags.media],
          revalidate: CACHE_SECONDS,
        },
      )()

/** Lead story plus the next `count` for Home. */
export const getHomeNews = (count: number) =>
  unstable_cache(
    async () => {
      const list = await loadList({ page: 1 })
      const featured = list.featured ?? list.items[0] ?? null
      const rest = list.items.filter((a) => a.id !== featured?.id).slice(0, count)
      return { featured, rest }
    },
    ['home-news', String(count)],
    { tags: [tags.articles, tags.media], revalidate: CACHE_SECONDS },
  )()

async function loadArticle(slug: string): Promise<ArticleDetail | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: { and: [published, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
  })
  const a = docs[0]
  if (!a) return null
  const match = populated(a.relatedMatch)
  return {
    ...toCard(a),
    heroImage: toImage(a.heroImage, 'hero'),
    author: a.author ?? null,
    body: (a.body as RichTextValue | null | undefined) ?? null,
    relatedMatchSlug: match?.slug ?? null,
    relatedPlayers: (a.relatedPlayers ?? [])
      .map((p) => toPlayerRef(p))
      .filter((p) => p !== null)
      .map((p) => ({ slug: p.slug, name: `${p.firstName} ${p.surname}` })),
  }
}

export const getArticle = (slug: string) =>
  unstable_cache(() => loadArticle(slug), ['article', slug], {
    tags: [tags.article(slug), tags.articles, tags.media],
    revalidate: CACHE_SECONDS,
  })()

/** Other stories in the same category for the end of an article. */
export const getRelatedArticles = (category: NewsCategory, excludeId: number) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'articles',
        where: {
          and: [published, { category: { equals: category } }, { id: { not_equals: excludeId } }],
        },
        sort: '-publishedAt',
        limit: 3,
        depth: 1,
      })
      return docs.map(toCard)
    },
    ['related-articles', category, String(excludeId)],
    { tags: [tags.articles, tags.media], revalidate: CACHE_SECONDS },
  )()

/** Slugs and dates for the sitemap. */
export const getArticleSitemap = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'articles',
      where: published,
      select: { slug: true, updatedAt: true },
      limit: 5000,
      depth: 0,
      pagination: false,
    })
    return docs.map((d) => ({ slug: d.slug ?? String(d.id), updatedAt: d.updatedAt }))
  },
  ['article-sitemap'],
  { tags: [tags.articles], revalidate: CACHE_SECONDS },
)
