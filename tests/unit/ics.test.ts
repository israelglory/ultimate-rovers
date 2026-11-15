import { describe, expect, it } from 'vitest'

import { buildCalendar, foldLine, icsDate } from '@/lib/ics'

describe('ICS', () => {
  it('formats UTC timestamps', () => {
    expect(icsDate('2026-11-21T15:00:00.000Z')).toBe('20261121T150000Z')
  })

  it('folds long lines at 75 octets', () => {
    const folded = foldLine(`DESCRIPTION:${'x'.repeat(200)}`)
    for (const line of folded.split('\r\n'))
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    expect(folded.replace(/\r\n /g, '')).toBe(`DESCRIPTION:${'x'.repeat(200)}`)
  })

  it('writes a valid calendar with escaped text and a two hour default', () => {
    const ics = buildCalendar({
      name: 'Ultimate Rovers fixtures',
      now: '2026-11-01T00:00:00Z',
      events: [
        {
          uid: 'match-1@rovers',
          start: '2026-11-21T15:00:00Z',
          summary: 'Ultimate Rovers vs [Opponent FC], [League]',
          location: '[Home ground name]; [City]',
          url: 'https://example.com/matches/x',
        },
      ],
    })
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true)
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true)
    expect(ics).toContain('DTSTART:20261121T150000Z')
    expect(ics).toContain('DTEND:20261121T170000Z')
    expect(ics).toContain('SUMMARY:Ultimate Rovers vs [Opponent FC]\\, [League]')
    expect(ics).toContain('LOCATION:[Home ground name]\; [City]')
    expect(ics).toContain('STATUS:CONFIRMED')
  })
})
