import { getMatchDetail } from '@/lib/data/matches'
import { brand } from '@/lib/brand'
import { hasStarted, resolveScore } from '@/lib/domain/match'
import { formatLongDate, formatTime } from '@/lib/format'
import { clubCrestDataUrl, OgCrest, ogSize, renderOg, uploadDataUrl } from '@/lib/og'

export const size = ogSize
export const contentType = 'image/png'
export const alt = 'Match card with both crests, the teams and the score or kick-off time'

/** Match share card: crests, teams, and the score or kick-off. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const m = await getMatchDetail(slug)
  const club = await clubCrestDataUrl()
  if (!m)
    return renderOg(
      <div style={{ display: 'flex', margin: 'auto', fontFamily: 'Display', fontSize: 120 }}>
        ULTIMATE ROVERS
      </div>,
    )

  const crest = async (t: typeof m.home) =>
    t.isUs && !t.crest ? club : await uploadDataUrl(t.crest?.url)
  const [homeCrest, awayCrest] = await Promise.all([crest(m.home), crest(m.away)])
  const started = hasStarted(m.status)
  const score = resolveScore(m, m.events)
  const centre =
    m.status === 'postponed' || m.status === 'cancelled'
      ? m.status === 'postponed'
        ? 'P-P'
        : 'OFF'
      : started
        ? `${score.home} : ${score.away}`
        : formatTime(m.kickoff, m.timezone)
  const label =
    m.status === 'full_time'
      ? 'Full time'
      : started
        ? 'Live'
        : m.status === 'postponed'
          ? 'Postponed'
          : m.status === 'cancelled'
            ? 'Cancelled'
            : formatLongDate(m.kickoff, m.timezone)

  const team = (name: string, src: string | null) => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 360,
        gap: 20,
      }}
    >
      <OgCrest src={src} size={170} />
      <div
        style={{
          fontFamily: 'Display',
          fontSize: 52,
          lineHeight: 1,
          textAlign: 'center',
          textTransform: 'uppercase',
        }}
      >
        {name}
      </div>
    </div>
  )

  return renderOg(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        padding: '48px 60px',
        alignItems: 'center',
      }}
    >
      <div style={{ display: 'flex', fontSize: 28, color: brand.mistText }}>
        {m.competition.name}
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          marginTop: 40,
        }}
      >
        {team(m.home.name, homeCrest)}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              fontFamily: 'Display',
              fontSize: started ? 150 : 120,
              lineHeight: 1,
              color: started ? brand.white : brand.cyan,
            }}
          >
            {centre}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 26,
              color: brand.night,
              background: brand.cyan,
              padding: '6px 18px',
              borderRadius: 999,
            }}
          >
            {label}
          </div>
        </div>
        {team(m.away.name, awayCrest)}
      </div>
    </div>,
  )
}
