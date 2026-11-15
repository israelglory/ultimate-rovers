import { describe, expect, it } from 'vitest'

import { isNavActive } from '@/lib/navigation'

describe('isNavActive', () => {
  it('matches Home only on the root', () => {
    expect(isNavActive('/', '/')).toBe(true)
    expect(isNavActive('/', '/squad')).toBe(false)
  })

  it('treats match centre pages as part of Fixtures', () => {
    expect(isNavActive('/fixtures', '/matches/2026-11-21-ultimate-rovers-vs-opponent-fc')).toBe(
      true,
    )
  })

  it('lights up Squad on a player profile', () => {
    expect(isNavActive('/squad', '/squad/first-name-surname')).toBe(true)
  })

  it('gives Stakeholders its own item instead of The club', () => {
    expect(isNavActive('/club/stakeholders', '/club/stakeholders')).toBe(true)
    expect(isNavActive('/club', '/club/stakeholders')).toBe(false)
    expect(isNavActive('/club', '/club')).toBe(true)
  })

  it('ignores trailing slashes and unrelated prefixes', () => {
    expect(isNavActive('/news', '/news/')).toBe(true)
    expect(isNavActive('/news', '/newsletter')).toBe(false)
  })
})
