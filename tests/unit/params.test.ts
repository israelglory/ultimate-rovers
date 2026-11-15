import { describe, expect, it } from 'vitest'

import {
  parseContactParams,
  parseFixturesParams,
  parseMatchParams,
  parseNewsParams,
  parsePlayerParams,
  parseSquadParams,
  seasonToParam,
  toQuery,
} from '@/lib/search-params'

describe('URL state', () => {
  it('parses fixtures params with safe fallbacks', () => {
    expect(parseFixturesParams({ view: 'results', competition: 'cup', season: '2025-26' })).toEqual(
      {
        view: 'results',
        competition: 'cup',
        season: '2025/26',
      },
    )
    expect(parseFixturesParams({ view: 'hack', competition: 'x', season: '2025/26' })).toEqual({
      view: 'fixtures',
      competition: undefined,
      season: undefined,
    })
  })

  it('parses the other pages', () => {
    expect(parseSquadParams({ position: 'forwards' }).position).toBe('forwards')
    expect(parseSquadParams({ position: 'strikers' }).position).toBeUndefined()
    expect(parseMatchParams({ tab: ['stats', 'x'] }).tab).toBe('stats')
    expect(parsePlayerParams({ stats: 'career' }).stats).toBe('career')
    expect(parsePlayerParams({}).stats).toBe('season')
    expect(parseNewsParams({ page: '3', q: '  derby  ', category: 'academy' })).toEqual({
      page: 3,
      q: 'derby',
      category: 'academy',
    })
    expect(parseNewsParams({ page: '-1', q: '   ' })).toEqual({
      page: 1,
      q: undefined,
      category: undefined,
    })
    expect(parseContactParams({ topic: 'media' }).topic).toBe('media')
    expect(parseContactParams({ topic: 'spam' }).topic).toBe('general')
  })

  it('builds clean query strings', () => {
    expect(toQuery({ view: 'results', competition: undefined, page: 2 })).toBe(
      '?view=results&page=2',
    )
    expect(toQuery({})).toBe('')
    expect(seasonToParam('2026/27')).toBe('2026-27')
  })
})
