import { pitchSpots } from '@/lib/domain/formation'
import { cn } from '@/lib/cn'
import type { Lineup } from '@/lib/types'

function Side({
  lineup,
  side,
  teamName,
}: {
  lineup: Lineup
  side: 'home' | 'away'
  teamName: string
}) {
  const spots = pitchSpots(lineup.starting, lineup.formation, side)
  return (
    <ul aria-label={`${teamName} starting line-up`} className="m-0 list-none p-0">
      {lineup.starting.map((p, i) => {
        const spot = spots[i]
        if (!spot) return null
        return (
          <li
            key={`${side}-${i}`}
            // Landscape from 768px: x along the pitch, y across it. Below 768px the pitch stands upright,
            // so the same spot maps to left = y and top = 100 - x (home defends the bottom goal).
            className="absolute top-[calc(100%-var(--x))] left-(--y) flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 md:top-(--y) md:left-(--x) md:gap-1"
            style={{ '--x': `${spot.left}%`, '--y': `${spot.top}%` } as React.CSSProperties}
          >
            <span
              className={cn(
                'flex size-8 items-center justify-center rounded-full text-[13px] font-extrabold text-night md:size-[38px] md:text-[15px]',
                side === 'home' ? 'bg-cyan' : 'bg-white',
              )}
            >
              <span className="sr-only">Number </span>
              {p.number ?? ''}
            </span>
            <span className="max-w-[84px] truncate text-[11px] font-semibold text-white md:max-w-none md:overflow-visible md:text-[12px] md:whitespace-nowrap">
              {p.name}
            </span>
          </li>
        )
      })}
    </ul>
  )
}

/** Pitch markings, landscape (200 x 100) or portrait (100 x 160, home goal at the bottom). */
function Markings({ orientation }: { orientation: 'landscape' | 'portrait' }) {
  const common = { fill: 'none', className: 'stroke-cyan', strokeOpacity: 0.5, strokeWidth: 0.4 }
  if (orientation === 'portrait') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 100 160"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full md:hidden"
      >
        <g {...common}>
          <rect x="3" y="3" width="94" height="154" />
          <line x1="3" y1="80" x2="97" y2="80" />
          <circle cx="50" cy="80" r="12" />
          <rect x="24" y="3" width="52" height="21" />
          <rect x="38" y="3" width="24" height="7" />
          <rect x="24" y="136" width="52" height="21" />
          <rect x="38" y="150" width="24" height="7" />
        </g>
      </svg>
    )
  }
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 200 100"
      preserveAspectRatio="none"
      className="absolute inset-0 hidden size-full md:block"
    >
      <g {...common}>
        <rect x="3" y="3" width="194" height="94" />
        <line x1="100" y1="3" x2="100" y2="97" />
        <circle cx="100" cy="50" r="12" />
        <rect x="3" y="24" width="26" height="52" />
        <rect x="3" y="38" width="9" height="24" />
        <rect x="171" y="24" width="26" height="52" />
        <rect x="188" y="38" width="9" height="24" />
      </g>
    </svg>
  )
}

/**
 * Pitch view from each team's formation. From 768px: horizontal, home defending the left goal in cyan,
 * away the right goal in white. Below 768px the pitch stands upright (home defending the bottom goal)
 * so the whole pitch fits a phone screen without sideways scrolling.
 */
export function PitchLineup({
  home,
  away,
  homeName,
  awayName,
}: {
  home: Lineup
  away: Lineup
  homeName: string
  awayName: string
}) {
  return (
    <div
      role="region"
      aria-label="Pitch view"
      className="mx-auto w-full max-w-[440px] md:max-w-none"
    >
      <div className="relative aspect-[5/8] overflow-hidden rounded-feature bg-navy md:aspect-[2/1]">
        <Markings orientation="portrait" />
        <Markings orientation="landscape" />
        <Side lineup={away} side="away" teamName={awayName} />
        <Side lineup={home} side="home" teamName={homeName} />
      </div>
      <p
        className="m-0 mt-2 flex justify-between text-[13px] text-slate md:hidden"
        aria-hidden="true"
      >
        <span>{homeName} in cyan, defending the bottom goal</span>
      </p>
    </div>
  )
}

export function Bench({ teamName, lineup }: { teamName: string; lineup: Lineup }) {
  return (
    <div className="rounded-[14px] border border-line bg-white p-[22px]">
      <h3 className="m-0 text-[18px]">{teamName}</h3>
      {lineup.headCoach ? (
        <p className="mt-1 mb-3.5 text-[14px] text-slate">Head coach: {lineup.headCoach}</p>
      ) : (
        <div className="mb-3.5" />
      )}
      <p className="m-0 mb-2 text-[14px] font-bold">Substitutes</p>
      {lineup.substitutes.length > 0 ? (
        <ul className="m-0 grid list-none grid-cols-2 gap-2 p-0 text-[14px]">
          {lineup.substitutes.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="flex-[0_0_26px] font-bold text-navy">{s.number ?? ''}</span>
              <span>{s.name}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="m-0 text-[14px] text-slate">Not announced yet.</p>
      )}
    </div>
  )
}
