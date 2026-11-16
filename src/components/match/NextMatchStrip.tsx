import Link from 'next/link'

import { buttonClass } from '@/components/ui/Button'
import { formatDayMonth, formatTime } from '@/lib/format'
import type { MatchSummary } from '@/lib/types'

import { Countdown } from './Countdown'
import { ticketLink } from './MatchRows'
import { TeamCrest } from './TeamCrest'

/**
 * The next scheduled fixture inside the Home hero. Wide layout from 1024px (Main.dc.html),
 * the stacked card below it (MobileHome.dc.html, plus the countdown). Not rendered when nothing is scheduled.
 */
export function NextMatchStrip({ m, serverNow }: { m: MatchSummary; serverNow: number }) {
  const tickets = ticketLink(m)
  const when = `${formatDayMonth(m.kickoff, m.timezone)} at ${formatTime(m.kickoff, m.timezone)}`
  return (
    <section aria-labelledby="next-match-title" className="rounded-[14px] bg-navy text-white">
      {/* Wide */}
      <div className="hidden flex-wrap items-center gap-x-10 gap-y-6 px-7 py-6 xl:flex">
        <div className="flex-[0_1_180px]">
          <h2 id="next-match-title" className="m-0 font-display text-card-title font-extrabold">
            Next match
          </h2>
          <p className="m-0 mt-1.5 text-[14px] text-mist-text">
            {m.competition.name}
            {m.matchweek ? `, matchweek ${m.matchweek}` : ''}
          </p>
        </div>
        <div className="flex flex-[1_1_360px] flex-wrap items-center gap-[18px]">
          <div className="flex items-center gap-2.5">
            <TeamCrest team={m.home} size={44} tone="dark" />
            <span className="text-[18px] font-bold">{m.home.name}</span>
          </div>
          <span className="font-display text-[22px] font-extrabold text-cyan">vs</span>
          <div className="flex items-center gap-2.5">
            <TeamCrest team={m.away} size={44} tone="dark" />
            <span className="text-[18px] font-bold">{m.away.name}</span>
          </div>
        </div>
        <div className="flex flex-[1_1_220px] flex-col gap-1.5 text-[15px] text-text-on-navy">
          <time dateTime={m.kickoff}>{when}</time>
          {m.venue ? <span>{m.venue}</span> : null}
        </div>
        <Countdown kickoff={m.kickoff} serverNow={serverNow} />
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/matches/${m.slug}`}
            className={buttonClass({ variant: 'muted-dark', size: 'md', px: 'px-[18px]' })}
          >
            Match centre
          </Link>
          {tickets ? (
            <a
              href={tickets.href}
              rel="noopener"
              className={buttonClass({ variant: 'primary-dark', size: 'md' })}
            >
              {tickets.label}
            </a>
          ) : null}
        </div>
      </div>

      {/* Phone */}
      <div className="p-[18px] sm:p-6 xl:hidden">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="m-0 font-display text-[24px] font-extrabold">Next match</h2>
          <span className="text-[13px] text-mist-text">{m.competition.shortName}</span>
        </div>
        <Link
          href={`/matches/${m.slug}`}
          className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center text-white no-underline hover:text-white"
        >
          <span className="flex flex-col items-center gap-1.5">
            <TeamCrest team={m.home} size={44} tone="dark" />
            <span className="text-[14px] font-bold">{m.home.name}</span>
          </span>
          <time dateTime={m.kickoff} className="font-display text-[26px] font-extrabold text-cyan">
            {formatTime(m.kickoff, m.timezone)}
          </time>
          <span className="flex flex-col items-center gap-1.5">
            <TeamCrest team={m.away} size={44} tone="dark" />
            <span className="text-[14px] font-bold">{m.away.name}</span>
          </span>
        </Link>
        <p className="m-0 mt-3.5 text-center text-[14px] text-text-on-navy">
          {formatDayMonth(m.kickoff, m.timezone)}
          {m.venue ? `, ${m.venue}` : ''}
        </p>
        <div className="mt-3.5 flex justify-center">
          <Countdown kickoff={m.kickoff} serverNow={serverNow} />
        </div>
        {tickets ? (
          <a
            href={tickets.href}
            rel="noopener"
            className={buttonClass({
              variant: 'primary-dark',
              size: 'md',
              className: 'mt-3.5 flex w-full',
            })}
          >
            {tickets.label}
          </a>
        ) : (
          <Link
            href={`/matches/${m.slug}`}
            className={buttonClass({
              variant: 'primary-dark',
              size: 'md',
              className: 'mt-3.5 flex w-full',
            })}
          >
            Match centre
          </Link>
        )}
      </div>
    </section>
  )
}
