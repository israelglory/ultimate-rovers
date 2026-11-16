import 'server-only'

import { unstable_cache } from 'next/cache'

import { CACHE_SECONDS, tags } from '@/lib/cache-tags'
import { buildTable, type RawStanding } from '@/lib/domain/standings'
import { getPayloadClient } from '@/lib/payload'
import type { CompetitionRef, StandingRow } from '@/lib/types'

import { toCompetition, toTeam } from './mappers'

export type LeagueTable = { competition: CompetitionRef; rows: StandingRow[] }

/** The club's league table for a season, or null if no league has standings yet. */
export const getLeagueTable = (season: string) =>
  unstable_cache(
    async (): Promise<LeagueTable | null> => {
      const payload = await getPayloadClient()
      const { docs } = await payload.find({
        collection: 'competitions',
        where: { and: [{ type: { equals: 'league' } }, { season: { equals: season } }] },
        limit: 5,
        depth: 2,
        populate: { teams: { name: true, shortName: true, slug: true, isUs: true, crest: true } },
      })
      const league = docs.find((c) => (c.standings ?? []).length > 0)
      if (!league) return null
      const raw: RawStanding[] = (league.standings ?? []).map((r) => ({
        team: toTeam(r.team),
        played: r.played ?? 0,
        won: r.won ?? 0,
        drawn: r.drawn ?? 0,
        lost: r.lost ?? 0,
        goalsFor: r.goalsFor ?? 0,
        goalsAgainst: r.goalsAgainst ?? 0,
        points: r.points ?? null,
        form: r.form ?? null,
      }))
      return { competition: toCompetition(league), rows: buildTable(raw) }
    },
    ['league-table', season],
    { tags: [tags.competitions, tags.teams], revalidate: CACHE_SECONDS },
  )()
