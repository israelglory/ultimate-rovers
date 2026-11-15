import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_SECONDS, tags } from '@/lib/cache-tags'
import { getPayloadClient } from '@/lib/payload'
import type { ImageRef, VideoRef } from '@/lib/types'

import { cleanUrl, toImage, toVideo } from './mappers'

export const getLatestVideos = (limit: number) =>
  unstable_cache(
    async (): Promise<VideoRef[]> => {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'videos',
        sort: '-publishedAt',
        limit,
        depth: 1,
      })
      return docs.map((d) => toVideo(d)).filter((v): v is VideoRef => v !== null)
    },
    ['latest-videos', String(limit)],
    { tags: [tags.videos, tags.media], revalidate: CACHE_SECONDS },
  )()

export type PersonCardData = {
  id: number
  name: string
  role: string
  sinceYear: number | null
  photo: ImageRef | null
}
export type PeopleGroup = 'board' | 'management' | 'technical' | 'investors'

export const getPeople = unstable_cache(
  async (): Promise<Record<PeopleGroup, PersonCardData[]>> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'people',
      sort: 'order',
      limit: 200,
      depth: 1,
      pagination: false,
    })
    const groups: Record<PeopleGroup, PersonCardData[]> = {
      board: [],
      management: [],
      technical: [],
      investors: [],
    }
    for (const p of docs) {
      groups[p.group].push({
        id: p.id,
        name: p.name,
        role: p.role,
        sinceYear: p.sinceYear ?? null,
        photo: toImage(p.photo, 'thumb'),
      })
    }
    return groups
  },
  ['people'],
  { tags: [tags.people, tags.media], revalidate: CACHE_SECONDS },
)

export type PartnerData = {
  id: number
  name: string
  tier: 'principal' | 'official' | 'supplier' | 'community'
  url: string | null
  blurb: string | null
  logo: ImageRef | null
  showOnHome: boolean
}

export const getPartners = unstable_cache(
  async (): Promise<PartnerData[]> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'partners',
      sort: 'order',
      limit: 100,
      depth: 1,
      pagination: false,
    })
    return docs.map((p) => ({
      id: p.id,
      name: p.name,
      tier: p.tier,
      url: p.url ?? null,
      blurb: p.blurb ?? null,
      logo: toImage(p.logo, 'card'),
      showOnHome: p.showOnHome !== false,
    }))
  },
  ['partners'],
  { tags: [tags.partners, tags.media], revalidate: CACHE_SECONDS },
)

export const getHonours = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'honours',
      sort: 'order',
      limit: 50,
      depth: 0,
      pagination: false,
    })
    return docs.map((h) => ({
      id: h.id,
      competition: h.competition,
      count: h.count ?? 0,
      years: h.years ?? null,
    }))
  },
  ['honours'],
  { tags: [tags.honours], revalidate: CACHE_SECONDS },
)

export const getTimeline = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'timeline-entries',
      sort: 'order',
      limit: 100,
      depth: 0,
      pagination: false,
    })
    return docs.map((t) => ({ id: t.id, year: t.year, title: t.title, text: t.text ?? null }))
  },
  ['timeline'],
  { tags: [tags.timeline], revalidate: CACHE_SECONDS },
)

export const getDocuments = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'documents',
      sort: 'order',
      limit: 50,
      depth: 0,
      pagination: false,
    })
    return docs
      .filter((d) => d.url)
      .map((d) => ({
        id: d.id,
        title: d.title,
        url: cleanUrl(d.url ?? ''),
        filesize: d.filesize ?? null,
      }))
  },
  ['documents'],
  { tags: [tags.documents], revalidate: CACHE_SECONDS },
)
