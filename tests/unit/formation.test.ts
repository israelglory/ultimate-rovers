import { describe, expect, it } from 'vitest'

import { lineYs, parseFormation, pitchSpots } from '@/lib/domain/formation'
import type { LineupPlayer } from '@/lib/types'

const xi = (n = 11): LineupPlayer[] =>
  Array.from({ length: n }, (_, i) => ({
    name: `P${i}`,
    number: i + 1,
    slug: null,
    x: null,
    y: null,
  }))

describe('formation geometry', () => {
  it('parses formations and falls back to 4-4-2', () => {
    expect(parseFormation('4-3-3')).toEqual([4, 3, 3])
    expect(parseFormation('4-2-3-1')).toEqual([4, 2, 3, 1])
    expect(parseFormation('nonsense')).toEqual([4, 4, 2])
    expect(parseFormation(null)).toEqual([4, 4, 2])
  })

  it('spreads a back four close to the drawn positions', () => {
    expect(lineYs(4)).toEqual([14, 38, 62, 86])
    expect(lineYs(1)).toEqual([50])
  })

  it('puts the home keeper on the left and lines between 18% and 43%', () => {
    const spots = pitchSpots(xi(), '4-3-3', 'home')
    expect(spots[0]).toEqual({ left: 5, top: 50 })
    expect(spots[1]?.left).toBe(18)
    expect(spots[10]?.left).toBe(43)
    expect(spots).toHaveLength(11)
  })

  it('mirrors the away side', () => {
    const spots = pitchSpots(xi(), '4-3-3', 'away')
    expect(spots[0]).toEqual({ left: 95, top: 50 })
    expect(spots[1]).toEqual({ left: 82, top: 86 })
  })

  it('respects manual coordinates', () => {
    const players = xi()
    players[9] = { ...players[9]!, x: 90, y: 30 }
    expect(pitchSpots(players, '4-3-3', 'home')[9]).toEqual({ left: 45, top: 30 })
  })
})
