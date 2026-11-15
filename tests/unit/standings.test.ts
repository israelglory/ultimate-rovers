import { describe, expect, it } from 'vitest'

import { buildTable, parseForm, type RawStanding, windowAroundClub } from '@/lib/domain/standings'

import { team } from './fixtures'

const row = (
  id: number,
  won: number,
  drawn: number,
  gf = 10,
  ga = 10,
  isUs = false,
): RawStanding => ({
  team: team(id, `[Club ${id}]`, isUs),
  played: won + drawn,
  won,
  drawn,
  lost: 0,
  goalsFor: gf,
  goalsAgainst: ga,
  points: null,
  form: null,
})

describe('league table', () => {
  it('computes points and sorts by points, goal difference, goals scored', () => {
    const table = buildTable([
      row(1, 2, 0),
      row(2, 2, 0, 15, 5),
      row(3, 3, 0),
      row(4, 2, 0, 20, 10),
    ])
    expect(table.map((r) => r.team.id)).toEqual([3, 4, 2, 1])
    expect(table[0]).toMatchObject({ points: 9, position: 1 })
  })

  it('keeps entered points', () => {
    expect(buildTable([{ ...row(1, 1, 0), points: 7 }])[0]?.points).toBe(7)
  })

  it('parses up to five form letters', () => {
    expect(parseForm('wdlwwl')).toEqual(['D', 'L', 'W', 'W', 'L'])
    expect(parseForm(null)).toEqual([])
  })

  it('centres six rows on the club, clamped at the ends', () => {
    const rows = Array.from({ length: 12 }, (_, i) => row(i + 1, 12 - i, 0, 10, 10, i + 1 === 7))
    const table = buildTable(rows)
    expect(windowAroundClub(table).map((r) => r.position)).toEqual([5, 6, 7, 8, 9, 10])
    const top = buildTable(rows.map((r, i) => ({ ...r, team: { ...r.team, isUs: i === 0 } })))
    expect(windowAroundClub(top).map((r) => r.position)).toEqual([1, 2, 3, 4, 5, 6])
    const bottom = buildTable(rows.map((r, i) => ({ ...r, team: { ...r.team, isUs: i === 11 } })))
    expect(windowAroundClub(bottom).map((r) => r.position)).toEqual([7, 8, 9, 10, 11, 12])
  })
})
