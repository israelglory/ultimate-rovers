import { getLiveSnapshot } from '@/lib/data/matches'
import { toSnapshot } from '@/lib/domain/live'

export const dynamic = 'force-dynamic'

/** Small uncached JSON snapshot the match page polls every 30 seconds while a match is live. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const match = await getLiveSnapshot(slug)
  if (!match) return Response.json({ error: 'Match not found' }, { status: 404 })
  return Response.json(toSnapshot(match), { headers: { 'Cache-Control': 'no-store' } })
}
