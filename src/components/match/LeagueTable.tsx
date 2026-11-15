import type { StandingRow } from '@/lib/types'
import { cn } from '@/lib/cn'

import { FormDots } from './Form'

const rowClass = (row: StandingRow) =>
  cn('border-t border-line', row.team.isUs && 'bg-cyan-tint font-bold')

/** Pos, Team, P, GD, Pts. Used on Home. */
export function CompactTable({ rows, caption }: { rows: StandingRow[]; caption: string }) {
  return (
    <table className="w-full border-collapse text-[14px]">
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="text-left text-slate">
          <th scope="col" className="px-1 py-2 font-semibold">
            Pos
          </th>
          <th scope="col" className="px-1 py-2 font-semibold">
            Team
          </th>
          <th scope="col" className="px-1 py-2 text-right font-semibold">
            <abbr title="Played" className="no-underline">
              P
            </abbr>
          </th>
          <th scope="col" className="px-1 py-2 text-right font-semibold">
            <abbr title="Goal difference" className="no-underline">
              GD
            </abbr>
          </th>
          <th scope="col" className="px-1 py-2 text-right font-semibold">
            <abbr title="Points" className="no-underline">
              Pts
            </abbr>
          </th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.team.id}
            className={rowClass(row)}
            aria-current={row.team.isUs ? 'true' : undefined}
          >
            <td className="px-1 py-2.5">{row.position}</td>
            <th
              scope="row"
              className={cn('px-1 py-2.5 text-left', row.team.isUs ? 'font-bold' : 'font-normal')}
            >
              {row.team.name}
            </th>
            <td className="px-1 py-2.5 text-right">{row.played}</td>
            <td className="px-1 py-2.5 text-right">
              {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
            </td>
            <td className="px-1 py-2.5 text-right font-bold">{row.points}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** Full standings with W D L GF GA and the last five. Scrolls inside its own container on phones. */
export function FullTable({ rows, title }: { rows: StandingRow[]; title: string }) {
  const num = 'px-3 py-3 text-right'
  return (
    <div className="rounded-card border border-line bg-white py-2">
      <div
        className="relative overflow-x-auto scrollbar-thin"
        role="region"
        aria-label={title}
        tabIndex={0}
      >
        <table className="w-full min-w-[760px] border-collapse text-[15px]">
          <caption className="px-5 py-4 text-left font-display text-card-title font-extrabold">
            {title}
          </caption>
          <thead>
            <tr className="text-right text-slate">
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                Pos
              </th>
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                Club
              </th>
              {(
                [
                  ['P', 'Played'],
                  ['W', 'Won'],
                  ['D', 'Drawn'],
                  ['L', 'Lost'],
                  ['GF', 'Goals for'],
                  ['GA', 'Goals against'],
                  ['GD', 'Goal difference'],
                  ['Pts', 'Points'],
                ] as const
              ).map(([short, long]) => (
                <th key={short} scope="col" className="px-3 py-2.5 font-semibold">
                  <abbr title={long} className="no-underline">
                    {short}
                  </abbr>
                </th>
              ))}
              <th scope="col" className="px-3 py-2.5 text-left font-semibold">
                Last 5
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.team.id}
                className={rowClass(row)}
                aria-current={row.team.isUs ? 'true' : undefined}
              >
                <td className="p-3 text-left">{row.position}</td>
                <th
                  scope="row"
                  className={cn('p-3 text-left', row.team.isUs ? 'font-bold' : 'font-normal')}
                >
                  {row.team.name}
                </th>
                <td className={num}>{row.played}</td>
                <td className={num}>{row.won}</td>
                <td className={num}>{row.drawn}</td>
                <td className={num}>{row.lost}</td>
                <td className={num}>{row.goalsFor}</td>
                <td className={num}>{row.goalsAgainst}</td>
                <td className={num}>
                  {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
                </td>
                <td className={cn(num, 'font-bold')}>{row.points}</td>
                <td className="p-3">
                  <FormDots form={row.form} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="m-0 border-t border-line px-5 py-3.5 text-[13px] text-slate">
        Form dots fill in as results come in: navy for a win, mid grey for a draw, outlined for a
        loss.
      </p>
    </div>
  )
}
