import Link from 'next/link'

import { buttonClass } from '@/components/ui/Button'
import { Motif } from '@/components/ui/Motif'
import { ShareButton } from '@/components/ui/ShareButton'
import { hasStarted, isCalledOff, isLive } from '@/lib/domain/match'
import { formatLongDate, formatTime } from '@/lib/format'
import type { MatchDetail } from '@/lib/types'

import { Countdown } from './Countdown'
import { LiveBadge, LiveScore, LiveScorers } from './LiveMatch'
import { ticketLink } from './MatchRows'
import { TeamCrest } from './TeamCrest'

function TeamColumn({
  team,
  side,
  showScorers,
}: {
  team: MatchDetail['home']
  side: 'home' | 'away'
  showScorers: boolean
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-3 text-center">
      <TeamCrest team={team} size={120} tone="dark" fluid priority className="w-16 sm:w-[120px]" />
      <p className="m-0 font-display text-[22px] leading-none font-black break-words uppercase sm:text-[clamp(28px,3.4vw,44px)]">
        {team.name}
      </p>
      {showScorers ? <LiveScorers side={side} /> : null}
    </div>
  )
}

/** Scoreboard for every match state: upcoming, live, half time, full time, postponed, cancelled. */
export function MatchHero({
  match,
  city,
  serverNow,
}: {
  match: MatchDetail
  city: string | null
  serverNow: number
}) {
  const started = hasStarted(match.status)
  const calledOff = isCalledOff(match.status)
  const tickets = ticketLink(match)
  const btn = { size: 'md' as const, minH: 'min-h-[50px]', px: 'px-6' }
  const place = [match.venue, match.home.isUs ? city : null].filter(Boolean).join(', ')

  return (
    <section aria-labelledby="mc-title" className="relative overflow-hidden bg-night text-white">
      <Motif
        variant="match"
        className="pointer-events-none absolute top-1/2 left-1/2 h-auto w-[900px] -translate-x-1/2 -translate-y-1/2"
      />
      <div className="wrap relative pt-9 pb-11">
        <h1 id="mc-title" className="m-0 text-center text-[15px] font-semibold text-mist-text">
          <span className="sr-only">{match.title}. </span>
          {match.competition.name}
          {match.matchweek ? `, matchweek ${match.matchweek}` : ''}
        </h1>
        <p className="m-0 mt-1.5 text-center text-[14px] text-mist-text">
          <time dateTime={match.kickoff}>
            {formatLongDate(match.kickoff, match.timezone)},{' '}
            {formatTime(match.kickoff, match.timezone)}
          </time>
          {place ? ` at ${place}` : ''}
        </p>

        <div className="mt-8 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6">
          <TeamColumn team={match.home} side="home" showScorers={started} />

          <div className="flex min-w-0 flex-col items-center gap-3 sm:min-w-[200px]">
            {calledOff ? (
              <>
                <span className="rounded-pill border border-border-dark px-3.5 py-1.5 text-[15px] font-bold">
                  {match.status === 'postponed' ? 'Postponed' : 'Cancelled'}
                </span>
                {match.statusNote ? (
                  <p className="m-0 max-w-[260px] text-center text-[14px] text-mist-text">
                    {match.statusNote}
                  </p>
                ) : null}
              </>
            ) : started ? (
              <>
                <LiveScore className="font-display text-[56px] leading-[0.9] font-black whitespace-nowrap sm:text-[112px]" />
                <LiveBadge />
                {match.status === 'full_time' ? (
                  <>
                    <span className="rounded-pill border border-border-dark px-3.5 py-1.5 text-[15px] font-bold">
                      Full time
                    </span>
                    <span className="text-[13px] text-mist-text">
                      Half time {match.halfTimeHomeScore ?? 0} : {match.halfTimeAwayScore ?? 0}
                    </span>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <time
                  dateTime={match.kickoff}
                  className="font-display text-[48px] leading-[0.9] font-black text-cyan sm:text-[88px]"
                >
                  {formatTime(match.kickoff, match.timezone)}
                </time>
                <Countdown kickoff={match.kickoff} serverNow={serverNow} variant="match" />
              </>
            )}
          </div>

          <TeamColumn team={match.away} side="away" showScorers={started} />
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {calledOff ? (
            <Link href="/fixtures" className={buttonClass({ variant: 'primary-dark', ...btn })}>
              Back to fixtures
            </Link>
          ) : null}
          {match.status === 'scheduled' ? (
            <>
              {tickets ? (
                <a
                  href={tickets.href}
                  rel="noopener"
                  className={buttonClass({ variant: 'primary-dark', ...btn })}
                >
                  {tickets.label}
                </a>
              ) : null}
              <a
                href={`/matches/${match.slug}/calendar.ics`}
                download
                className={buttonClass({ variant: 'outline-dark', ...btn })}
              >
                Add to calendar
              </a>
            </>
          ) : null}
          {isLive(match.status) && match.watchUrl ? (
            <a
              href={match.watchUrl}
              rel="noopener"
              className={buttonClass({ variant: 'primary-dark', ...btn })}
            >
              Watch live{match.broadcast ? ` on ${match.broadcast}` : ''}
            </a>
          ) : null}
          {match.status === 'full_time' && match.highlights ? (
            <a
              href={`/matches/${match.slug}#highlights`}
              className={buttonClass({ variant: 'primary-dark', ...btn })}
            >
              Watch highlights
            </a>
          ) : null}
          <ShareButton title={match.title} style={{ variant: 'ghost-dark', ...btn, px: 'px-5' }} />
        </div>
      </div>
    </section>
  )
}
