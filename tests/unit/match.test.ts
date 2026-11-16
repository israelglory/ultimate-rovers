import { describe, expect, it } from 'vitest'

import {
  buildTimeline,
  formGuide,
  headToHead,
  resolveScore,
  resolveTab,
  scorers,
  statShare,
  tabsFor,
} from '@/lib/domain/match'

import { event, match, opponent, rovers } from './fixtures'

describe('tabs per match state', () => {
  it('matches the design labels', () => {
    expect(tabsFor('scheduled').map((t) => t.label)).toEqual([
      'Preview',
      'Line-ups',
      'Head to head',
    ])
    expect(tabsFor('live').map((t) => t.label)).toEqual([
      'Live',
      'Line-ups',
      'Stats',
      'Head to head',
    ])
    expect(tabsFor('half_time').map((t) => t.label)).toEqual([
      'Live',
      'Line-ups',
      'Stats',
      'Head to head',
    ])
    expect(tabsFor('full_time').map((t) => t.label)).toEqual([
      'Summary',
      'Line-ups',
      'Stats',
      'Report',
      'Head to head',
    ])
  })

  it('falls back to overview for a tab the state does not have', () => {
    expect(resolveTab('scheduled', 'stats')).toBe('overview')
    expect(resolveTab('full_time', 'report')).toBe('report')
    expect(resolveTab('live', undefined)).toBe('overview')
  })
})

describe('score and scorers', () => {
  const events = [
    event({ minute: 12, side: 'home', type: 'goal', player: { name: 'Nine', slug: 'nine' } }),
    event({ minute: 64, side: 'home', type: 'penalty', player: { name: 'Nine', slug: 'nine' } }),
    event({ minute: 39, side: 'away', type: 'goal', player: { name: 'Away', slug: null } }),
    event({ minute: 28, side: 'away', type: 'yellow' }),
  ]

  it('counts goals from events when score fields are empty', () => {
    expect(resolveScore({ homeScore: null, awayScore: null }, events)).toEqual({ home: 2, away: 1 })
    expect(resolveScore({ homeScore: 3, awayScore: 0 }, events)).toEqual({ home: 3, away: 0 })
  })

  it('lists scorers in order with penalty and own goal suffixes', () => {
    expect(scorers(events, 'home')).toEqual(["Nine 12'", "Nine 64' pen"])
    expect(
      scorers(
        [
          event({
            minute: 30,
            side: 'away',
            type: 'own_goal',
            player: { name: 'Def', slug: null },
          }),
        ],
        'away',
      ),
    ).toEqual(["Def 30' og"])
  })
})

describe('timeline', () => {
  const events = [
    event({ minute: 64, side: 'home', type: 'goal' }),
    event({ minute: 12, side: 'home', type: 'goal', related: { name: 'Ten', slug: null } }),
    event({ minute: 45, addedTime: 2, side: 'away', type: 'yellow', note: 'Foul' }),
    event({
      minute: 58,
      side: 'home',
      type: 'substitution',
      player: { name: 'Sub', slug: null },
      related: { name: 'Off', slug: null },
    }),
  ]

  it('is empty before kick-off', () => {
    expect(buildTimeline(match({ status: 'scheduled' }), events)).toEqual([])
  })

  it('orders events with kick-off, half time and full time markers', () => {
    const items = buildTimeline(
      match({
        status: 'full_time',
        homeScore: 2,
        awayScore: 0,
        halfTimeHomeScore: 1,
        halfTimeAwayScore: 0,
      }),
      events,
    )
    expect(items.map((i) => (i.kind === 'marker' ? i.text : i.minute))).toEqual([
      'Kick-off',
      "12'",
      "45+2'",
      'Half time, 1 : 0',
      "58'",
      "64'",
      'Full time, 2 : 0',
    ])
  })

  it('describes events as drawn', () => {
    const items = buildTimeline(match({ status: 'full_time' }), events)
    const sub = items.find((i) => i.kind === 'event' && i.badge === 'S')
    expect(sub).toMatchObject({ text: 'On: Sub', sub: 'Off: Off' })
    const goal = items.find((i) => i.kind === 'event' && i.minute === "12'")
    expect(goal).toMatchObject({ badge: 'G', sub: 'Assist: Ten' })
  })

  it('shows no full time marker while live and no half time marker in the first half', () => {
    const items = buildTimeline(match({ status: 'live', minute: 30 }), [events[1]!])
    expect(items.map((i) => (i.kind === 'marker' ? i.text : 'event'))).toEqual([
      'Kick-off',
      'event',
    ])
  })
})

describe('form guide and head to head', () => {
  const history = [
    match({ id: 10, kickoff: '2026-09-01T15:00:00Z', homeScore: 1, awayScore: 0 }),
    match({
      id: 11,
      kickoff: '2026-09-08T15:00:00Z',
      home: opponent,
      away: rovers,
      homeScore: 2,
      awayScore: 2,
    }),
    match({ id: 12, kickoff: '2026-09-15T15:00:00Z', homeScore: 0, awayScore: 3 }),
    match({
      id: 13,
      kickoff: '2026-12-01T15:00:00Z',
      status: 'scheduled',
      homeScore: null,
      awayScore: null,
    }),
  ]

  it('gives the last results before a date, oldest first', () => {
    expect(formGuide(rovers.id, history, '2026-11-21T15:00:00Z')).toEqual(['W', 'D', 'L'])
    expect(formGuide(opponent.id, history, '2026-11-21T15:00:00Z')).toEqual(['L', 'D', 'W'])
  })

  it('counts the head to head from Rovers point of view', () => {
    const h2h = headToHead(rovers.id, opponent.id, history, '2026-11-21T15:00:00Z')
    expect(h2h).toMatchObject({ wins: 1, draws: 1, losses: 1 })
    expect(h2h.meetings.map((m) => m.id)).toEqual([12, 11, 10])
  })
})

describe('statShare', () => {
  it('splits bars by share and evenly when both are zero', () => {
    expect(statShare(60, 40)).toBe(60)
    expect(statShare(0, 0)).toBe(50)
    expect(statShare(null, 3)).toBe(0)
  })
})
