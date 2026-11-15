import { statShare } from '@/lib/domain/match'
import type { TeamStats } from '@/lib/types'

const rows: Array<{ key: keyof TeamStats; label: string; suffix?: string }> = [
  { key: 'possession', label: 'Possession', suffix: '%' },
  { key: 'shots', label: 'Shots' },
  { key: 'shotsOnTarget', label: 'Shots on target' },
  { key: 'corners', label: 'Corners' },
  { key: 'passesCompleted', label: 'Passes completed' },
  { key: 'fouls', label: 'Fouls' },
  { key: 'offsides', label: 'Offsides' },
  { key: 'yellowCards', label: 'Yellow cards' },
]

/** Two values and a bar split by share, Rovers' side in navy. */
export function StatsComparison({
  home,
  away,
  homeName,
  awayName,
}: {
  home: TeamStats
  away: TeamStats
  homeName: string
  awayName: string
}) {
  return (
    <>
      <div className="mb-3 flex justify-between gap-4 font-bold" aria-hidden="true">
        <span>{homeName}</span>
        <span className="text-right">{awayName}</span>
      </div>
      <ul className="m-0 list-none rounded-[14px] border border-line bg-white px-4 py-2 sm:px-6">
        {rows.map(({ key, label, suffix = '' }) => {
          const h = home[key]
          const a = away[key]
          const share = statShare(h, a)
          const show = (v: number | null) => (v == null ? '-' : `${v}${suffix}`)
          return (
            <li key={key} className="border-line py-4 [&:not(:first-child)]:border-t">
              <span className="sr-only">
                {label}: {homeName} {show(h)}, {awayName} {show(a)}
              </span>
              <div
                className="grid grid-cols-[60px_minmax(0,1fr)_60px] items-center text-[15px]"
                aria-hidden="true"
              >
                <span className="font-display text-[24px] font-extrabold">{show(h)}</span>
                <span className="text-center text-slate">{label}</span>
                <span className="text-right font-display text-[24px] font-extrabold">
                  {show(a)}
                </span>
              </div>
              <div className="mt-2 flex gap-1" aria-hidden="true">
                <span className="h-2 rounded bg-navy" style={{ flexGrow: share, flexBasis: 0 }} />
                <span
                  className="h-2 rounded bg-line-strong"
                  style={{ flexGrow: 100 - share, flexBasis: 0 }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
