import Link from 'next/link'

import { EmptyState } from '@/components/ui/EmptyState'
import { resolveScore, type HeadToHead as H2H } from '@/lib/domain/match'
import { formatShortDateYear } from '@/lib/format'

export function HeadToHead({ record, opponentName }: { record: H2H; opponentName: string }) {
  const tile = 'rounded-[14px] p-4 sm:p-5'
  const number = 'font-display text-[44px] leading-none font-black sm:text-[56px]'
  if (record.meetings.length === 0) {
    return <EmptyState>No previous meetings with {opponentName} in our records.</EmptyState>
  }
  return (
    <>
      <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0 text-center">
        <li className={`${tile} bg-night text-white`}>
          <span className={`block ${number}`}>{record.wins}</span>
          <span className="text-[14px] text-mist-text">Rovers wins</span>
        </li>
        <li className={`${tile} border border-line bg-white`}>
          <span className={`block ${number}`}>{record.draws}</span>
          <span className="text-[14px] text-slate">Draws</span>
        </li>
        <li className={`${tile} border border-line bg-white`}>
          <span className={`block ${number}`}>{record.losses}</span>
          <span className="text-[14px] text-slate">{opponentName} wins</span>
        </li>
      </ul>
      <h3 className="mt-8 mb-3 text-[18px]">Last meetings</h3>
      <ul className="m-0 list-none rounded-[14px] border border-line bg-white p-0 [&>li+li]:border-t [&>li+li]:border-line">
        {record.meetings.map((m) => {
          const score = resolveScore(m, [])
          return (
            <li key={m.id}>
              <Link
                href={`/matches/${m.slug}`}
                className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1 px-4 py-3.5 text-[15px] text-ink no-underline hover:bg-chalk hover:text-ink sm:grid-cols-[140px_minmax(0,1fr)_auto_minmax(0,1fr)] sm:px-5"
              >
                <span className="col-span-3 text-[14px] text-slate sm:col-span-1">
                  {formatShortDateYear(m.kickoff, m.timezone)}
                </span>
                <span className="text-right font-semibold">{m.home.name}</span>
                <span className="rounded-button bg-mist px-2.5 py-1 font-display text-[20px] font-extrabold whitespace-nowrap">
                  {score.home} : {score.away}
                </span>
                <span className="font-semibold">{m.away.name}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </>
  )
}
