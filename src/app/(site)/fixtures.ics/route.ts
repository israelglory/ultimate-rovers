import { buildCalendar, icsResponse, matchToIcs } from '@/lib/calendar'
import { getClub } from '@/lib/data/club'
import { getSeasonMatches } from '@/lib/data/matches'

/** Subscribable calendar of the current season's fixtures and results. */
export async function GET() {
  const club = await getClub()
  const matches = await getSeasonMatches(club.currentSeason)
  const body = buildCalendar({
    name: `${club.name} fixtures ${club.currentSeason}`,
    events: matches.map(matchToIcs),
  })
  return icsResponse(body, 'ultimate-rovers-fixtures.ics', 900)
}
