import 'server-only'

import { unstable_cache } from 'next/cache'
import type { Where } from 'payload'

import { CACHE_SECONDS, tags } from '@/lib/cache-tags'
import type { StatsMatch } from '@/lib/domain/stats'
import { getPayloadClient } from '@/lib/payload'
import type { Article, Match } from '@/payload-types'
import type { MatchDetail, MatchReport, MatchSummary, RichTextValue } from '@/lib/types'

import {
  populated,
  relationId,
  toEvents,
  toImage,
  toLineup,
  toMatchSummary,
  toPlayerRef,
  toTeamStats,
  toVideo,
} from './mappers'

const LIST_TAGS = [tags.matches, tags.teams, tags.competitions]

/** Fields needed for list views; keeps queries light. */
const summarySelect = {
  title: true,
  slug: true,
  competition: true,
  season: true,
  matchweek: true,
  kickoff: true,
  kickoff_tz: true,
  homeTeam: true,
  awayTeam: true,
  venue: true,
  broadcast: true,
  watchUrl: true,
  ticketAvailability: true,
  ticketUrl: true,
  status: true,
  minute: true,
  homeScore: true,
  awayScore: true,
  halfTimeHomeScore: true,
  halfTimeAwayScore: true,
  statusNote: true,
  highlights: true,
} as const

const summaryPopulate = {
  teams: { name: true, shortName: true, slug: true, isUs: true, crest: true },
  competitions: { name: true, shortName: true, type: true, season: true },
  videos: { title: true },
} as const

async function findSummaries(where: Where, sort: string, limit = 500): Promise<MatchSummary[]> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'matches',
    where,
    sort,
    limit,
    depth: 2,
    select: summarySelect,
    populate: summaryPopulate,
  })
  return (docs as Match[]).map(toMatchSummary)
}

/** Every match in a season, soonest first. */
export const getSeasonMatches = (season: string) =>
  unstable_cache(
    () => findSummaries({ season: { equals: season } }, 'kickoff'),
    ['season-matches', season],
    {
      tags: LIST_TAGS,
      revalidate: CACHE_SECONDS,
    },
  )()

/** Scheduled and live matches from any season, soonest first. The caller filters by the current time. */
export const getUpcomingMatches = unstable_cache(
  () =>
    findSummaries(
      { status: { in: ['scheduled', 'live', 'half_time', 'postponed'] } },
      'kickoff',
      50,
    ),
  ['upcoming-matches'],
  { tags: LIST_TAGS, revalidate: CACHE_SECONDS },
)

/** Completed matches, newest first. */
export const getRecentResults = (limit: number) =>
  unstable_cache(
    () => findSummaries({ status: { equals: 'full_time' } }, '-kickoff', limit),
    ['recent-results', String(limit)],
    {
      tags: LIST_TAGS,
      revalidate: CACHE_SECONDS,
    },
  )()

/** Seasons that have matches, newest first, always including the current season. */
export const getSeasons = (current: string) =>
  unstable_cache(
    async () => {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'matches',
        select: { season: true },
        limit: 2000,
        depth: 0,
        pagination: false,
      })
      const seasons = new Set<string>([current, ...docs.map((d) => d.season)])
      return [...seasons].sort().reverse()
    },
    ['seasons', current],
    { tags: [tags.matches], revalidate: CACHE_SECONDS },
  )()

/** All completed meetings between two teams, for head to head and form. */
export const getMatchesBetween = (teamA: number, teamB: number) =>
  unstable_cache(
    () =>
      findSummaries(
        {
          and: [
            { status: { equals: 'full_time' } },
            {
              or: [
                { and: [{ homeTeam: { equals: teamA } }, { awayTeam: { equals: teamB } }] },
                { and: [{ homeTeam: { equals: teamB } }, { awayTeam: { equals: teamA } }] },
              ],
            },
          ],
        },
        '-kickoff',
        50,
      ),
    ['matches-between', String(Math.min(teamA, teamB)), String(Math.max(teamA, teamB))],
    { tags: LIST_TAGS, revalidate: CACHE_SECONDS },
  )()

/** Completed matches involving a team, newest first, for its form guide. */
export const getTeamResults = (teamId: number) =>
  unstable_cache(
    () =>
      findSummaries(
        {
          and: [
            { status: { equals: 'full_time' } },
            { or: [{ homeTeam: { equals: teamId } }, { awayTeam: { equals: teamId } }] },
          ],
        },
        '-kickoff',
        20,
      ),
    ['team-results', String(teamId)],
    { tags: LIST_TAGS, revalidate: CACHE_SECONDS },
  )()

async function loadReportArticle(matchId: number): Promise<Article | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'articles',
    where: {
      and: [
        { relatedMatch: { equals: matchId } },
        { category: { equals: 'match-report' } },
        { _status: { equals: 'published' } },
      ],
    },
    sort: '-publishedAt',
    limit: 1,
    depth: 1,
  })
  return docs[0] ?? null
}

function toReport(match: Match, article: Article | null): MatchReport | null {
  const r = match.report
  const hasOwn = Boolean(r?.headline || r?.body)
  if (hasOwn && r) {
    return {
      headline: r.headline ?? match.title ?? 'Match report',
      standfirst: r.standfirst ?? null,
      author: r.author ?? null,
      heroImage: toImage(r.heroImage, 'hero'),
      body: (r.body as RichTextValue | null | undefined) ?? null,
      coachQuote: r.coachQuote ?? null,
      articleSlug: article?.slug ?? null,
    }
  }
  if (!article) return null
  return {
    headline: article.title,
    standfirst: article.standfirst,
    author: article.author ?? null,
    heroImage: toImage(article.heroImage, 'hero'),
    body: (article.body as RichTextValue | null | undefined) ?? null,
    coachQuote: null,
    articleSlug: article.slug ?? null,
  }
}

async function loadMatchDetail(slug: string): Promise<MatchDetail | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({
    collection: 'matches',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 2,
  })
  const m = docs[0]
  if (!m) return null
  const article = await loadReportArticle(m.id)
  return {
    ...toMatchSummary(m),
    referee: m.referee ?? null,
    attendance: m.attendance ?? null,
    ticketInfo: m.ticketInfo ?? null,
    events: toEvents(m),
    lineupsConfirmed: Boolean(m.lineupsConfirmed),
    lineups: { home: toLineup(m.homeLineup), away: toLineup(m.awayLineup) },
    stats:
      m.homeStats || m.awayStats
        ? { home: toTeamStats(m.homeStats), away: toTeamStats(m.awayStats) }
        : null,
    preview: m.preview ?? null,
    teamNews: {
      home: (m.homeTeamNews ?? []).map((n) => n.text),
      away: (m.awayTeamNews ?? []).map((n) => n.text),
    },
    playerOfTheMatch: toPlayerRef(m.playerOfTheMatch),
    highlights: toVideo(m.highlights),
    report: toReport(m, article),
  }
}

export const getMatchDetail = (slug: string) =>
  unstable_cache(() => loadMatchDetail(slug), ['match-detail', slug], {
    tags: [tags.match(slug), ...LIST_TAGS, tags.players, tags.videos, tags.articles],
    revalidate: CACHE_SECONDS,
  })()

/** Uncached snapshot for live polling. */
export async function getLiveSnapshot(slug: string): Promise<MatchDetail | null> {
  return loadMatchDetail(slug)
}

/** Completed Rovers matches in the shape the stats derivation needs. */
export const getStatsMatches = unstable_cache(
  async (): Promise<StatsMatch[]> => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'matches',
      where: { status: { equals: 'full_time' } },
      limit: 2000,
      depth: 1,
      pagination: false,
      select: {
        season: true,
        status: true,
        homeTeam: true,
        awayTeam: true,
        events: true,
        homeLineup: true,
        awayLineup: true,
      },
      populate: { teams: { isUs: true } },
    })
    return (docs as Match[]).map((m) => {
      const home = populated(m.homeTeam)
      const away = populated(m.awayTeam)
      const usSide = home?.isUs ? 'home' : away?.isUs ? 'away' : null
      const lineup = usSide === 'home' ? m.homeLineup : usSide === 'away' ? m.awayLineup : null
      return {
        status: m.status,
        season: m.season,
        usSide,
        events: (m.events ?? []).map((e) => ({
          minute: e.minute,
          side: e.side,
          type: e.type,
          playerId: relationId(e.player as number | { id: number } | null | undefined),
          relatedPlayerId: relationId(
            e.relatedPlayer as number | { id: number } | null | undefined,
          ),
        })),
        lineup: lineup
          ? {
              starting: (lineup.starting ?? []).map((p) =>
                relationId(p.player as number | { id: number } | null | undefined),
              ),
              substitutes: (lineup.substitutes ?? []).map((p) =>
                relationId(p.player as number | { id: number } | null | undefined),
              ),
            }
          : null,
      }
    })
  },
  ['stats-matches'],
  { tags: [tags.matches, tags.players], revalidate: CACHE_SECONDS },
)

/** The club team (is_us). */
export const getClubTeam = unstable_cache(
  async () => {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'teams',
      where: { isUs: { equals: true } },
      limit: 1,
      depth: 1,
    })
    return docs[0] ? { id: docs[0].id, name: docs[0].name } : null
  },
  ['club-team'],
  { tags: [tags.teams], revalidate: CACHE_SECONDS },
)
