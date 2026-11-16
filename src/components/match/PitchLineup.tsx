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
            className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1"
            style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
          >
            <span
              className={cn(
                'flex size-[38px] items-center justify-center rounded-full text-[15px] font-extrabold text-night',
                side === 'home' ? 'bg-cyan' : 'bg-white',
              )}
            >
              <span className="sr-only">Number </span>
              {p.number ?? ''}
            </span>
            <span className="text-[12px] font-semibold whitespace-nowrap text-white">{p.name}</span>
          </li>
        )
      })}
    </ul>
  )
}

/**
 * Horizontal pitch: home defends the left goal in cyan, away the right goal in white. Positions come
 * from each formation. Scrolls sideways inside its own container below 720px.
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
      className="relative overflow-x-auto scrollbar-thin"
      role="region"
      aria-label="Pitch view"
      tabIndex={0}
    >
      <div className="relative aspect-[2/1] min-w-[720px] overflow-hidden rounded-feature bg-navy">
        <svg
          aria-hidden="true"
          viewBox="0 0 200 100"
          className="absolute inset-0 size-full"
          preserveAspectRatio="none"
        >
          <g fill="none" className="stroke-cyan" strokeOpacity="0.5" strokeWidth="0.4">
            <rect x="3" y="3" width="194" height="94" />
            <line x1="100" y1="3" x2="100" y2="97" />
            <circle cx="100" cy="50" r="12" />
            <rect x="3" y="24" width="26" height="52" />
            <rect x="3" y="38" width="9" height="24" />
            <rect x="171" y="24" width="26" height="52" />
            <rect x="188" y="38" width="9" height="24" />
          </g>
        </svg>
        <Side lineup={home} side="home" teamName={homeName} />
        <Side lineup={away} side="away" teamName={awayName} />
      </div>
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
