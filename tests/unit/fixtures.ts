import type { MatchEvent, MatchSummary, TeamRef } from '@/lib/types'

export const team = (id: number, name: string, isUs = false): TeamRef => ({
  id,
  name,
  shortName: name,
  slug: name.toLowerCase().replace(/\W+/g, '-'),
  isUs,
  crest: null,
})

export const rovers = team(1, 'Ultimate Rovers', true)
export const opponent = team(2, '[Opponent FC]')

export function match(overrides: Partial<MatchSummary> = {}): MatchSummary {
  return {
    id: 1,
    slug: '2026-11-21-ultimate-rovers-vs-opponent-fc',
    title: 'Ultimate Rovers vs [Opponent FC]',
    kickoff: '2026-11-21T15:00:00.000Z',
    timezone: 'Europe/London',
    status: 'full_time',
    minute: null,
    competition: {
      id: 1,
      name: '[League]',
      shortName: '[League]',
      type: 'league',
      season: '2026/27',
    },
    season: '2026/27',
    matchweek: 12,
    venue: '[Home ground name]',
    home: rovers,
    away: opponent,
    homeScore: 2,
    awayScore: 1,
    halfTimeHomeScore: 1,
    halfTimeAwayScore: 1,
    ticketUrl: null,
    ticketAvailability: 'not_on_sale',
    broadcast: null,
    watchUrl: null,
    statusNote: null,
    hasHighlights: false,
    ...overrides,
  }
}

let eventId = 0
export function event(
  overrides: Partial<MatchEvent> & Pick<MatchEvent, 'minute' | 'side' | 'type'>,
): MatchEvent {
  eventId += 1
  return {
    id: `e${eventId}`,
    addedTime: null,
    player: { name: 'Player', slug: null },
    related: null,
    note: null,
    ...overrides,
  }
}
