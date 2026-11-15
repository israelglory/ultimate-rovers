import 'server-only'

import { buildCalendar, type IcsEvent } from '@/lib/ics'
import { absoluteUrl } from '@/lib/site'
import type { MatchSummary } from '@/lib/types'

export function matchToIcs(m: MatchSummary): IcsEvent {
  const score =
    m.status === 'full_time' && m.homeScore != null && m.awayScore != null
      ? ` ${m.homeScore} : ${m.awayScore} `
      : ' vs '
  return {
    uid: `match-${m.id}@ultimate-rovers`,
    start: m.kickoff,
    durationMinutes: 120,
    summary: `${m.home.name}${score}${m.away.name} (${m.competition.shortName})`,
    location: m.venue,
    description: [
      m.competition.name,
      m.statusNote,
      `Match centre: ${absoluteUrl(`/matches/${m.slug}`)}`,
    ]
      .filter(Boolean)
      .join('\n'),
    url: absoluteUrl(`/matches/${m.slug}`),
    status:
      m.status === 'cancelled' ? 'CANCELLED' : m.status === 'postponed' ? 'TENTATIVE' : 'CONFIRMED',
  }
}

export function icsResponse(body: string, filename: string, cacheSeconds = 300): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': `public, max-age=${cacheSeconds}`,
    },
  })
}

export { buildCalendar }
