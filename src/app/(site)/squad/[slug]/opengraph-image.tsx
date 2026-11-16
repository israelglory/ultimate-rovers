import { brand } from '@/lib/brand'
import { getClub } from '@/lib/data/club'
import { getPlayerProfile } from '@/lib/data/players'
import { clubCrestDataUrl, ogSize, renderOg, uploadDataUrl } from '@/lib/og'
import { groupInfo } from '@/lib/squad'

export const size = ogSize
export const contentType = 'image/png'
export const alt = 'Player card with squad number, surname and position'

/** Player share card: outlined number, surname and position. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const club = await getClub()
  const p = await getPlayerProfile(slug, club.currentSeason, club.name)
  const crest = await clubCrestDataUrl()
  if (!p)
    return renderOg(
      <div style={{ display: 'flex', margin: 'auto', fontFamily: 'Display', fontSize: 120 }}>
        ULTIMATE ROVERS
      </div>,
    )
  const photo = await uploadDataUrl(p.photo?.url)

  return renderOg(
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div
        style={{
          display: 'flex',
          position: 'relative',
          width: 470,
          height: '100%',
          background: brand.navy,
          alignItems: 'flex-end',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {p.squadNumber != null ? (
          <div
            style={{
              position: 'absolute',
              top: -30,
              left: 30,
              fontFamily: 'Display',
              fontSize: 380,
              lineHeight: 1,
              // Satori cannot draw text strokes, so the outlined number becomes a solid cyan numeral here.
              color: brand.cyan,
            }}
          >
            {String(p.squadNumber)}
          </div>
        ) : null}
        {photo ? (
          <img src={photo} alt="" width={420} height={525} style={{ objectFit: 'contain' }} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 170,
                height: 170,
                borderRadius: 999,
                background: brand.navySilhouette,
                display: 'flex',
              }}
            />
            <div
              style={{
                width: 340,
                height: 220,
                marginTop: 20,
                borderRadius: '170px 170px 0 0',
                background: brand.navySilhouette,
                display: 'flex',
              }}
            />
          </div>
        )}
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '0 60px',
          flex: 1,
        }}
      >
        <img src={crest} alt="" width={90} height={102} />
        <div
          style={{
            display: 'flex',
            fontFamily: 'Display',
            fontSize: 52,
            color: brand.mistText,
            marginTop: 30,
          }}
        >
          {p.firstName}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Display',
            fontSize: 120,
            lineHeight: 0.9,
            textTransform: 'uppercase',
          }}
        >
          {p.surname}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 28,
            fontSize: 30,
            color: brand.night,
            background: brand.cyan,
            padding: '8px 22px',
            borderRadius: 999,
            alignSelf: 'flex-start',
          }}
        >
          {`${groupInfo(p.positionGroup).singular}${p.squadNumber != null ? `, No. ${p.squadNumber}` : ''}`}
        </div>
      </div>
    </div>,
  )
}
