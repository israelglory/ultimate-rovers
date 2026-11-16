import { brand } from '@/lib/brand'
import { clubCrestDataUrl, renderOg } from '@/lib/og'

/** Default share card (`/og.png`) for every page without its own. */
export const dynamic = 'force-static'

export async function GET() {
  const crest = await clubCrestDataUrl()
  return renderOg(
    <div
      style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '0 90px', gap: 70 }}
    >
      {/* Satori renders plain <img>; next/image does not apply inside ImageResponse. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={crest} alt="" width={300} height={341} />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 30, color: brand.cyan }}>
          Official club website
        </div>
        <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 170, lineHeight: 0.84 }}>
          ULTIMATE
        </div>
        <div style={{ display: 'flex', fontFamily: 'Display', fontSize: 170, lineHeight: 0.84 }}>
          ROVERS
        </div>
      </div>
    </div>,
  )
}
