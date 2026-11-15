import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_SECONDS, tags } from '@/lib/cache-tags'
import {
  applyOverrides,
  type CareerRow,
  careerStats,
  emptyStats,
  fillCareerRows,
  type PartialStats,
  statsBySeason,
} from '@/lib/domain/stats'
import { getPayloadClient } from '@/lib/payload'
import type { Player } from '@/payload-types'
import type {
  ImageRef,
  PlayerRef,
  PositionGroup,
  RichTextValue,
  StatLine,
  VideoRef,
} from '@/lib/types'

import { getStatsMatches } from './matches'
import { toImage, toPlayerRef } from './mappers'

const groupOrder: PositionGroup[] = ['goalkeeper', 'defender', 'midfielder', 'forward']

/** Active first-team players, by position group then squad number. */
export const getSquad = unstable_cache(
  async (): Promise<PlayerRef[]> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'players',
      where: { status: { equals: 'active' } },
      sort: 'squadNumber',
      limit: 100,
      depth: 1,
      pagination: false,
    })
    return docs
      .map((p) => toPlayerRef(p))
      .filter((p): p is PlayerRef => p !== null)
      .sort(
        (a, b) =>
          groupOrder.indexOf(a.positionGroup) - groupOrder.indexOf(b.positionGroup) ||
          (a.squadNumber ?? 999) - (b.squadNumber ?? 999),
      )
  },
  ['squad'],
  { tags: [tags.players, tags.media], revalidate: CACHE_SECONDS },
)

/** Squad spotlight on Home: the CMS choice, or the first player of each position group. */
export async function getSpotlight(ids: number[]): Promise<PlayerRef[]> {
  const squad = await getSquad()
  if (ids.length > 0) {
    const chosen = ids
      .map((id) => squad.find((p) => p.id === id))
      .filter((p): p is PlayerRef => Boolean(p))
    if (chosen.length > 0) return chosen.slice(0, 4)
  }
  return groupOrder
    .map((g) => squad.find((p) => p.positionGroup === g))
    .filter((p): p is PlayerRef => Boolean(p))
}

export type PlayerVideo = VideoRef
export type SocialHandle = { platform: 'instagram' | 'x' | 'tiktok'; url: string }

export type PlayerProfile = PlayerRef & {
  status: Player['status']
  dateOfBirth: string | null
  heightCm: number | null
  preferredFoot: string | null
  joined: string | null
  previousClub: string | null
  contractUntil: number | null
  biography: RichTextValue | null
  quote: string | null
  socials: SocialHandle[]
  videos: PlayerVideo[]
  career: CareerRow[]
  seasonStats: StatLine
  careerStats: StatLine
  photo: ImageRef | null
}

function toVideos(p: Player): PlayerVideo[] {
  return (p.videos ?? []).map((v, i) => {
    const file = typeof v.file === 'object' ? v.file : null
    return {
      id: v.id ?? `video-${i}`,
      title: v.title,
      caption: v.caption ?? null,
      url: v.url ?? null,
      fileUrl: file?.url ? (file.url.split('?')[0] ?? null) : null,
      fileType: file?.mimeType ?? null,
      poster: toImage(v.poster, 'hero'),
      durationSeconds: v.durationSeconds ?? null,
    }
  })
}

async function loadProfile(
  slug: string,
  season: string,
  clubName: string,
): Promise<PlayerProfile | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'players',
    where: { and: [{ slug: { equals: slug } }, { status: { not_equals: 'left' } }] },
    limit: 1,
    depth: 1,
  })
  const p = docs[0]
  const ref = toPlayerRef(p)
  if (!p || !ref) return null

  const bySeason = statsBySeason(p.id, await getStatsMatches())
  const seasonStats = applyOverrides(
    bySeason[season] ?? emptyStats(),
    p.seasonOverrides as PartialStats | undefined,
  )
  const clubSeasons = Object.entries(bySeason).map(([s, line]) =>
    s === season ? seasonStats : line,
  )
  const rawCareer: CareerRow[] = (p.career ?? []).map((c) => ({
    season: c.season,
    club: c.club,
    apps: c.apps ?? null,
    goals: c.goals ?? null,
    assists: c.assists ?? null,
  }))
  const career = fillCareerRows(rawCareer, clubName, { ...bySeason, [season]: seasonStats })
  const socials: SocialHandle[] = (['instagram', 'x', 'tiktok'] as const)
    .map((platform) => ({ platform, url: p.socials?.[platform] ?? '' }))
    .filter((s) => s.url !== '')

  return {
    ...ref,
    photo: toImage(p.photo, 'hero'),
    status: p.status,
    dateOfBirth: p.dateOfBirth ?? null,
    heightCm: p.heightCm ?? null,
    preferredFoot: p.preferredFoot ?? null,
    joined: p.joined ?? null,
    previousClub: p.previousClub ?? null,
    contractUntil: p.contractUntil ?? null,
    biography: (p.biography as RichTextValue | null | undefined) ?? null,
    quote: p.quote ?? null,
    socials,
    videos: toVideos(p),
    career,
    seasonStats,
    careerStats: careerStats({
      rows: career,
      clubSeasons,
      beforeClub: p.careerBeforeClub as PartialStats | undefined,
    }),
  }
}

export const getPlayerProfile = (slug: string, season: string, clubName: string) =>
  unstable_cache(
    () => loadProfile(slug, season, clubName),
    ['player-profile', slug, season, clubName],
    {
      tags: [tags.player(slug), tags.players, tags.matches, tags.media],
      revalidate: CACHE_SECONDS,
    },
  )()
