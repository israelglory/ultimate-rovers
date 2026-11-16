import type { FormResult, MatchEvent, MatchStatus, MatchSummary, Side } from '@/lib/types'

export const LIVE_STATUSES: readonly MatchStatus[] = ['live', 'half_time']

export const isLive = (status: MatchStatus): boolean => LIVE_STATUSES.includes(status)
export const isPlayed = (status: MatchStatus): boolean => status === 'full_time'
export const hasStarted = (status: MatchStatus): boolean => isLive(status) || status === 'full_time'
export const isCalledOff = (status: MatchStatus): boolean =>
  status === 'postponed' || status === 'cancelled'

export type MatchTabKey = 'overview' | 'lineups' | 'stats' | 'report' | 'h2h'
export type MatchTab = { key: MatchTabKey; label: string }

/** Tabs per state, as drawn in MatchCentre.dc.html and DESIGN_SPEC section 7. */
export function tabsFor(status: MatchStatus): MatchTab[] {
  if (isLive(status)) {
    return [
      { key: 'overview', label: 'Live' },
      { key: 'lineups', label: 'Line-ups' },
      { key: 'stats', label: 'Stats' },
      { key: 'h2h', label: 'Head to head' },
    ]
  }
  if (status === 'full_time') {
    return [
      { key: 'overview', label: 'Summary' },
      { key: 'lineups', label: 'Line-ups' },
      { key: 'stats', label: 'Stats' },
      { key: 'report', label: 'Report' },
      { key: 'h2h', label: 'Head to head' },
    ]
  }
  return [
    { key: 'overview', label: 'Preview' },
    { key: 'lineups', label: 'Line-ups' },
    { key: 'h2h', label: 'Head to head' },
  ]
}

/** The requested tab if it exists in this state, otherwise the first one. */
export function resolveTab(status: MatchStatus, requested: string | undefined): MatchTabKey {
  const tabs = tabsFor(status)
  return tabs.find((t) => t.key === requested)?.key ?? 'overview'
}

const isGoal = (e: Pick<MatchEvent, 'type'>) =>
  e.type === 'goal' || e.type === 'penalty' || e.type === 'own_goal'

/** Sort key that puts 45+2 after 45 and before 46. */
export const eventOrder = (e: Pick<MatchEvent, 'minute' | 'addedTime'>): number =>
  e.minute + (e.addedTime ?? 0) / 100

export const formatMinute = (minute: number, addedTime?: number | null): string =>
  addedTime ? `${minute}+${addedTime}'` : `${minute}'`

/** Score from the CMS fields, or counted from goal events when the fields are empty. */
export function resolveScore(
  match: Pick<MatchSummary, 'homeScore' | 'awayScore'>,
  events: Array<Pick<MatchEvent, 'type' | 'side'>>,
): { home: number; away: number } {
  const counted = { home: 0, away: 0 }
  for (const e of events) if (isGoal(e)) counted[e.side] += 1
  return { home: match.homeScore ?? counted.home, away: match.awayScore ?? counted.away }
}

export function halfTimeScore(
  match: Pick<MatchSummary, 'halfTimeHomeScore' | 'halfTimeAwayScore'>,
  events: Array<Pick<MatchEvent, 'type' | 'side' | 'minute'>>,
): { home: number; away: number } {
  const counted = { home: 0, away: 0 }
  for (const e of events) if (isGoal(e) && e.minute <= 45) counted[e.side] += 1
  return {
    home: match.halfTimeHomeScore ?? counted.home,
    away: match.halfTimeAwayScore ?? counted.away,
  }
}

/** "Surname 12'", "Surname 64' pen", "Surname 30' og" lines under each crest. */
export function scorers(events: MatchEvent[], side: Side): string[] {
  return [...events]
    .filter((e) => isGoal(e) && e.side === side)
    .sort((a, b) => eventOrder(a) - eventOrder(b))
    .map((e) => {
      const name = e.player?.name ?? 'Goal'
      const suffix = e.type === 'penalty' ? ' pen' : e.type === 'own_goal' ? ' og' : ''
      return `${name} ${formatMinute(e.minute, e.addedTime)}${suffix}`
    })
}

export type BadgeKind = 'G' | 'Y' | 'R' | 'S'

export type TimelineItem =
  | { kind: 'marker'; id: string; text: string }
  | {
      kind: 'event'
      id: string
      side: Side
      minute: string
      badge: BadgeKind
      badgeLabel: string
      text: string
      sub: string | null
      playerSlug: string | null
    }

const badgeFor = (type: MatchEvent['type']): { badge: BadgeKind; label: string } => {
  switch (type) {
    case 'goal':
    case 'penalty':
    case 'own_goal':
      return { badge: 'G', label: 'Goal' }
    case 'yellow':
      return { badge: 'Y', label: 'Yellow card' }
    case 'second_yellow':
      return { badge: 'R', label: 'Red card, second yellow' }
    case 'red':
      return { badge: 'R', label: 'Red card' }
    case 'substitution':
    default:
      return { badge: 'S', label: 'Substitution' }
  }
}

function describe(e: MatchEvent): { text: string; sub: string | null } {
  const player = e.player?.name ?? 'Unknown player'
  const related = e.related?.name
  switch (e.type) {
    case 'goal':
      return { text: player, sub: related ? `Assist: ${related}` : e.note }
    case 'penalty':
      return { text: player, sub: 'Penalty' }
    case 'own_goal':
      return { text: player, sub: 'Own goal' }
    case 'second_yellow':
      return { text: player, sub: 'Second yellow' }
    case 'substitution':
      return { text: `On: ${player}`, sub: related ? `Off: ${related}` : null }
    default:
      return { text: player, sub: e.note }
  }
}

/**
 * Key moments in order, with kick-off, half time and full time markers drawn as in the design.
 * The half-time marker appears once the second half has started or the match is at half time.
 */
export function buildTimeline(
  match: Pick<
    MatchSummary,
    'status' | 'minute' | 'homeScore' | 'awayScore' | 'halfTimeHomeScore' | 'halfTimeAwayScore'
  >,
  events: MatchEvent[],
): TimelineItem[] {
  if (!hasStarted(match.status)) return []
  const sorted = [...events].sort((a, b) => eventOrder(a) - eventOrder(b))
  const firstHalf = sorted.filter((e) => e.minute <= 45)
  const secondHalf = sorted.filter((e) => e.minute > 45)
  const ht = halfTimeScore(match, events)
  const ft = resolveScore(match, events)
  const reachedHalfTime =
    match.status === 'half_time' ||
    match.status === 'full_time' ||
    secondHalf.length > 0 ||
    (match.minute ?? 0) > 45

  const toItem = (e: MatchEvent): TimelineItem => {
    const { badge, label } = badgeFor(e.type)
    const { text, sub } = describe(e)
    return {
      kind: 'event',
      id: e.id,
      side: e.side,
      minute: formatMinute(e.minute, e.addedTime),
      badge,
      badgeLabel: label,
      text,
      sub,
      playerSlug: e.player?.slug ?? null,
    }
  }

  const items: TimelineItem[] = [
    { kind: 'marker', id: 'kick-off', text: 'Kick-off' },
    ...firstHalf.map(toItem),
  ]
  if (reachedHalfTime)
    items.push({ kind: 'marker', id: 'half-time', text: `Half time, ${ht.home} : ${ht.away}` })
  items.push(...secondHalf.map(toItem))
  if (match.status === 'full_time')
    items.push({ kind: 'marker', id: 'full-time', text: `Full time, ${ft.home} : ${ft.away}` })
  return items
}

/** Result of a completed match from one team's point of view. */
export function resultFor(
  teamId: number,
  match: Pick<MatchSummary, 'home' | 'away' | 'homeScore' | 'awayScore'>,
): FormResult | null {
  if (match.homeScore == null || match.awayScore == null) return null
  const isHome = match.home.id === teamId
  if (!isHome && match.away.id !== teamId) return null
  const own = isHome ? match.homeScore : match.awayScore
  const other = isHome ? match.awayScore : match.homeScore
  return own > other ? 'W' : own < other ? 'L' : 'D'
}

/** Last five completed results before a kickoff, oldest on the left. */
export function formGuide(
  teamId: number,
  matches: MatchSummary[],
  before: string,
  count = 5,
): FormResult[] {
  return matches
    .filter(
      (m) =>
        m.status === 'full_time' &&
        m.kickoff < before &&
        (m.home.id === teamId || m.away.id === teamId),
    )
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff))
    .slice(0, count)
    .map((m) => resultFor(teamId, m))
    .filter((r): r is FormResult => r !== null)
    .reverse()
}

export type HeadToHead = {
  wins: number
  draws: number
  losses: number
  meetings: MatchSummary[]
}

/** Rovers' record against an opponent before this match, newest meetings first. */
export function headToHead(
  usId: number,
  opponentId: number,
  matches: MatchSummary[],
  before: string,
  count = 5,
): HeadToHead {
  const meetings = matches
    .filter(
      (m) =>
        m.status === 'full_time' &&
        m.kickoff < before &&
        ((m.home.id === usId && m.away.id === opponentId) ||
          (m.home.id === opponentId && m.away.id === usId)),
    )
    .sort((a, b) => b.kickoff.localeCompare(a.kickoff))
  const record = { wins: 0, draws: 0, losses: 0 }
  for (const m of meetings) {
    const r = resultFor(usId, m)
    if (r === 'W') record.wins += 1
    else if (r === 'D') record.draws += 1
    else if (r === 'L') record.losses += 1
  }
  return { ...record, meetings: meetings.slice(0, count) }
}

/** Share of the bar for the home side in a stat comparison, 0 to 100. Equal split when both are 0. */
export function statShare(home: number | null, away: number | null): number {
  const h = home ?? 0
  const a = away ?? 0
  if (h + a === 0) return 50
  return Math.round((h / (h + a)) * 1000) / 10
}
