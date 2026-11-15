import type { EventType, MatchStatus, Side, StatLine } from '@/lib/types'

/** Minimal match shape needed to count a player's stats. */
export type StatsMatch = {
  status: MatchStatus
  season: string
  /** Which side Ultimate Rovers played on, or null if neither (should not happen). */
  usSide: Side | null
  events: Array<{
    minute: number
    side: Side
    type: EventType
    playerId: number | null
    relatedPlayerId: number | null
  }>
  /** Rovers line-up only. */
  lineup: { starting: Array<number | null>; substitutes: Array<number | null> } | null
}

export const MATCH_MINUTES = 90

export const emptyStats = (): StatLine => ({
  appearances: 0,
  starts: 0,
  goals: 0,
  assists: 0,
  minutes: 0,
  shotsOnTarget: 0,
  yellowCards: 0,
  redCards: 0,
})

export const statKeys = Object.keys(emptyStats()) as Array<keyof StatLine>

/**
 * Stats for one player in one match. Only completed matches count.
 * - Starters play from 0; substitutes from the minute they came on.
 * - A player leaves at the minute they are substituted off or sent off, otherwise at 90.
 * - Goals are goals and penalties scored for Rovers (own goals are not credited to the scorer).
 * - Assists are the related player on a Rovers goal.
 * - A second yellow counts as a yellow card and a red card.
 */
export function statsForMatch(playerId: number, match: StatsMatch): StatLine {
  const line = emptyStats()
  if (match.status !== 'full_time' || !match.usSide) return line
  const ours = match.events.filter((e) => e.side === match.usSide)
  const started = match.lineup?.starting.includes(playerId) ?? false
  const cameOn = ours.find((e) => e.type === 'substitution' && e.playerId === playerId)
  const goingOff = ours.find((e) => e.type === 'substitution' && e.relatedPlayerId === playerId)
  const sentOff = match.events.find(
    (e) => (e.type === 'red' || e.type === 'second_yellow') && e.playerId === playerId,
  )
  const involved = match.events.some(
    (e) => e.playerId === playerId || (e.relatedPlayerId === playerId && e.type !== 'substitution'),
  )

  const appeared = started || Boolean(cameOn) || involved
  if (!appeared) return line

  line.appearances = 1
  line.starts = started ? 1 : 0
  const on = started ? 0 : (cameOn?.minute ?? 0)
  const offCandidates = [goingOff?.minute, sentOff?.minute, MATCH_MINUTES].filter(
    (m): m is number => typeof m === 'number',
  )
  const off = Math.min(...offCandidates, MATCH_MINUTES)
  line.minutes = Math.max(0, off - on)

  for (const e of match.events) {
    if (e.playerId === playerId) {
      if ((e.type === 'goal' || e.type === 'penalty') && e.side === match.usSide) line.goals += 1
      if (e.type === 'yellow') line.yellowCards += 1
      if (e.type === 'second_yellow') {
        line.yellowCards += 1
        line.redCards += 1
      }
      if (e.type === 'red') line.redCards += 1
    }
    if (e.relatedPlayerId === playerId && e.type === 'goal' && e.side === match.usSide)
      line.assists += 1
  }
  return line
}

export function addStats(a: StatLine, b: StatLine): StatLine {
  const out = emptyStats()
  for (const key of statKeys) out[key] = a[key] + b[key]
  return out
}

/** Totals for one player across matches, grouped by season. */
export function statsBySeason(playerId: number, matches: StatsMatch[]): Record<string, StatLine> {
  const result: Record<string, StatLine> = {}
  for (const match of matches) {
    const line = statsForMatch(playerId, match)
    result[match.season] = addStats(result[match.season] ?? emptyStats(), line)
  }
  return result
}

export type PartialStats = Partial<Record<keyof StatLine, number | null | undefined>>

/** Any override that is a number replaces the derived figure. */
export function applyOverrides(
  derived: StatLine,
  overrides: PartialStats | null | undefined,
): StatLine {
  const out = { ...derived }
  if (!overrides) return out
  for (const key of statKeys) {
    const value = overrides[key]
    if (typeof value === 'number' && Number.isFinite(value)) out[key] = value
  }
  return out
}

export type CareerRow = {
  season: string
  club: string
  apps: number | null
  goals: number | null
  assists: number | null
}

/** Fills empty Rovers rows in the career table from match data. */
export function fillCareerRows(
  rows: CareerRow[],
  clubName: string,
  bySeason: Record<string, StatLine>,
): CareerRow[] {
  return rows.map((row) => {
    const isClub = row.club.trim().toLowerCase() === clubName.trim().toLowerCase()
    const derived = isClub ? bySeason[row.season] : undefined
    if (!derived) return row
    return {
      ...row,
      apps: row.apps ?? derived.appearances,
      goals: row.goals ?? derived.goals,
      assists: row.assists ?? derived.assists,
    }
  })
}

/**
 * Career figures:
 * - appearances, goals and assists are the sum of the career table (Rovers rows filled from matches);
 * - every other figure is the pre-club total plus all Rovers seasons.
 */
export function careerStats({
  rows,
  clubSeasons,
  beforeClub,
}: {
  rows: CareerRow[]
  clubSeasons: StatLine[]
  beforeClub: PartialStats | null | undefined
}): StatLine {
  const club = clubSeasons.reduce(addStats, emptyStats())
  const before = applyOverrides(emptyStats(), beforeClub)
  const total = addStats(club, before)
  if (rows.length > 0) {
    total.appearances = rows.reduce((n, r) => n + (r.apps ?? 0), 0)
    total.goals = rows.reduce((n, r) => n + (r.goals ?? 0), 0)
    total.assists = rows.reduce((n, r) => n + (r.assists ?? 0), 0)
  }
  return total
}
