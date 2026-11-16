import { buildCalendar, matchToIcs } from '@/lib/calendar'
import { getMatchDetail } from '@/lib/data/matches'

/** Single-match calendar download. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const match = await getMatchDetail(slug)
  if (!match) return new Response('Match not found', { status: 404 })
  const body = buildCalendar({ name: match.title, events: [matchToIcs(match)] })
  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  })
}
