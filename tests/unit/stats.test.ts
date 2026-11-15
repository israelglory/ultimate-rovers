import { describe, expect, it } from 'vitest'

import {
  applyOverrides,
  careerStats,
  emptyStats,
  fillCareerRows,
  statsBySeason,
  statsForMatch,
  type StatsMatch,
} from '@/lib/domain/stats'

const base = (overrides: Partial<StatsMatch> = {}): StatsMatch => ({
  status: 'full_time',
  season: '2026/27',
  usSide: 'home',
  events: [],
  lineup: { starting: [9, 10, 11], substitutes: [19, 20] },
  ...overrides,
})

describe('statsForMatch', () => {
  it('credits a starter with 90 minutes, a start and an appearance', () => {
    expect(statsForMatch(9, base())).toMatchObject({ appearances: 1, starts: 1, minutes: 90 })
  })

  it('ignores matches that are not finished', () => {
    expect(statsForMatch(9, base({ status: 'live' }))).toEqual(emptyStats())
    expect(statsForMatch(9, base({ status: 'scheduled' }))).toEqual(emptyStats())
  })

  it('counts minutes for substitutions on both sides of the swap', () => {
    const m = base({
      events: [
        { minute: 58, side: 'home', type: 'substitution', playerId: 19, relatedPlayerId: 9 },
      ],
    })
    expect(statsForMatch(9, m)).toMatchObject({ appearances: 1, starts: 1, minutes: 58 })
    expect(statsForMatch(19, m)).toMatchObject({ appearances: 1, starts: 0, minutes: 32 })
  })

  it('does not count an unused substitute', () => {
    expect(statsForMatch(20, base())).toEqual(emptyStats())
  })

  it('counts goals, penalties and assists for Rovers only', () => {
    const m = base({
      events: [
        { minute: 12, side: 'home', type: 'goal', playerId: 9, relatedPlayerId: 10 },
        { minute: 64, side: 'home', type: 'penalty', playerId: 9, relatedPlayerId: null },
        { minute: 70, side: 'away', type: 'own_goal', playerId: 11, relatedPlayerId: null },
      ],
    })
    expect(statsForMatch(9, m)).toMatchObject({ goals: 2, assists: 0 })
    expect(statsForMatch(10, m)).toMatchObject({ goals: 0, assists: 1 })
    expect(statsForMatch(11, m)).toMatchObject({ goals: 0 })
  })

  it('ends minutes at a red card and counts a second yellow as yellow plus red', () => {
    const m = base({
      events: [
        { minute: 30, side: 'home', type: 'yellow', playerId: 10, relatedPlayerId: null },
        { minute: 77, side: 'home', type: 'second_yellow', playerId: 10, relatedPlayerId: null },
      ],
    })
    expect(statsForMatch(10, m)).toMatchObject({ minutes: 77, yellowCards: 2, redCards: 1 })
  })

  it('works when Rovers are the away side', () => {
    const m = base({
      usSide: 'away',
      events: [{ minute: 5, side: 'away', type: 'goal', playerId: 9, relatedPlayerId: null }],
    })
    expect(statsForMatch(9, m).goals).toBe(1)
  })
})

describe('season and career totals', () => {
  it('groups by season', () => {
    const totals = statsBySeason(9, [base(), base(), base({ season: '2025/26' })])
    expect(totals['2026/27']?.appearances).toBe(2)
    expect(totals['2025/26']?.appearances).toBe(1)
  })

  it('applies only numeric overrides', () => {
    const out = applyOverrides(
      { ...emptyStats(), goals: 3 },
      { goals: 5, assists: null, shotsOnTarget: 12 },
    )
    expect(out).toMatchObject({ goals: 5, assists: 0, shotsOnTarget: 12 })
  })

  it('fills empty Rovers career rows from matches and keeps entered numbers', () => {
    const rows = fillCareerRows(
      [
        { season: '2026/27', club: 'Ultimate Rovers', apps: null, goals: null, assists: 4 },
        { season: '2024/25', club: '[Previous club]', apps: 30, goals: 8, assists: 2 },
      ],
      'Ultimate Rovers',
      { '2026/27': { ...emptyStats(), appearances: 10, goals: 6, assists: 1 } },
    )
    expect(rows[0]).toMatchObject({ apps: 10, goals: 6, assists: 4 })
    expect(rows[1]).toMatchObject({ apps: 30, goals: 8 })
  })

  it('sums the career table and adds pre-club figures to Rovers totals', () => {
    const total = careerStats({
      rows: [
        { season: '2026/27', club: 'Ultimate Rovers', apps: 10, goals: 6, assists: 4 },
        { season: '2024/25', club: '[Previous club]', apps: 30, goals: 8, assists: 2 },
      ],
      clubSeasons: [{ ...emptyStats(), appearances: 10, minutes: 800, yellowCards: 1 }],
      beforeClub: { minutes: 2400, yellowCards: 3 },
    })
    expect(total).toMatchObject({
      appearances: 40,
      goals: 14,
      assists: 6,
      minutes: 3200,
      yellowCards: 4,
    })
  })
})
