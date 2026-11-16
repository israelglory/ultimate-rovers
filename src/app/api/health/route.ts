import { getPayloadClient } from '@/lib/payload'

export const dynamic = 'force-dynamic'

/** Liveness and database check for Docker, Coolify and uptime monitors. */
export async function GET() {
  const started = Date.now()
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'users', overrideAccess: true })
    return Response.json(
      {
        status: 'ok',
        database: 'ok',
        uptimeSeconds: Math.round(process.uptime()),
        latencyMs: Date.now() - started,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('[health] database check failed', error)
    return Response.json(
      { status: 'error', database: 'unreachable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
