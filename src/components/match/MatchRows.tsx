import Link from 'next/link'

import { buttonClass } from '@/components/ui/Button'
import { CalendarAddIcon } from '@/components/ui/icons'
import { Tag } from '@/components/ui/Tag'
import { cn } from '@/lib/cn'
import { isLive, resolveScore } from '@/lib/domain/match'
import { formatDayOfMonth, formatLongDate, formatTime, formatWeekdayShort } from '@/lib/format'
import type { MatchSummary } from '@/lib/types'

import { TeamCrest } from './TeamCrest'

const matchHref = (m: MatchSummary) => `/matches/${m.slug}`
const fixtureLabel = (m: MatchSummary) => `${m.home.name} vs ${m.away.name}`

/** Ticket link for a fixture, or nothing when tickets are not on sale. */
export function ticketLink(m: MatchSummary): { href: string; label: string } | null {
  if (
    !m.ticketUrl ||
    (m.ticketAvailability !== 'on_sale' && m.ticketAvailability !== 'members_only')
  )
    return null
  return { href: m.ticketUrl, label: m.home.isUs ? 'Buy tickets' : 'Away tickets' }
}

function DateBox({ m, tone }: { m: MatchSummary; tone: 'dark' | 'light' }) {
  return (
    <div
      className={cn(
        'flex-[0_0_72px] rounded-[10px] py-2.5 text-center',
        tone === 'dark' ? 'bg-night text-white' : 'bg-mist text-ink',
      )}
    >
      <div className={cn('text-[13px]', tone === 'dark' ? 'text-mist-text' : 'text-slate')}>
        {formatWeekdayShort(m.kickoff, m.timezone)}
      </div>
      <div className="font-display text-[32px] leading-none font-black">
        {formatDayOfMonth(m.kickoff, m.timezone)}
      </div>
    </div>
  )
}

function Teams({ m, centre }: { m: MatchSummary; centre: React.ReactNode }) {
  return (
    <div className="grid min-w-0 flex-[3_1_420px] grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-4">
      <div className="flex items-center justify-end gap-2.5 text-right">
        <span className="min-w-0 text-[15px] font-bold break-words sm:text-[17px]">
          {m.home.name}
        </span>
        <TeamCrest team={m.home} size={40} />
      </div>
      {centre}
      <div className="flex items-center gap-2.5">
        <TeamCrest team={m.away} size={40} />
        <span className="min-w-0 text-[15px] font-bold break-words sm:text-[17px]">
          {m.away.name}
        </span>
      </div>
    </div>
  )
}

/** The kick-off chip, or the state when a fixture is not simply scheduled. */
function KickoffChip({ m }: { m: MatchSummary }) {
  if (m.status === 'postponed' || m.status === 'cancelled') {
    return (
      <div className="rounded-lg border border-line-strong bg-white px-3 py-2 text-center text-[14px] font-bold text-ink">
        {m.status === 'postponed' ? 'Postponed' : 'Cancelled'}
      </div>
    )
  }
  if (isLive(m.status)) {
    const score = resolveScore(m, [])
    return (
      <div className="flex flex-col items-center gap-1">
        <div className="rounded-lg bg-night px-4 py-2 font-display text-[26px] leading-none font-black text-white">
          {score.home} : {score.away}
        </div>
        <span className="rounded-pill bg-cyan px-2 py-0.5 text-[12px] font-bold text-night">
          {m.status === 'half_time' ? 'Half time' : `Live${m.minute ? `, ${m.minute}'` : ''}`}
        </span>
      </div>
    )
  }
  return (
    <div className="rounded-lg border border-line bg-chalk px-3.5 py-2 font-display text-[26px] leading-none font-extrabold text-navy">
      <time dateTime={m.kickoff}>{formatTime(m.kickoff, m.timezone)}</time>
    </div>
  )
}

export function FixtureRow({ m }: { m: MatchSummary }) {
  const tickets = ticketLink(m)
  const where = m.home.isUs ? 'Home' : 'Away'
  return (
    <article
      aria-label={`${fixtureLabel(m)}, ${formatLongDate(m.kickoff, m.timezone)}`}
      className="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-card border border-line bg-white px-4 py-4 sm:px-5"
    >
      <DateBox m={m} tone="dark" />
      <div className="flex flex-[1_1_170px] flex-col gap-1.5">
        <Tag>{m.competition.shortName}</Tag>
        <span className="text-[14px] text-slate">
          {where}
          {m.venue ? `, ${m.venue}` : ''}
        </span>
        {m.statusNote && (m.status === 'postponed' || m.status === 'cancelled') ? (
          <span className="text-[14px] text-ink">{m.statusNote}</span>
        ) : null}
      </div>
      <Teams m={m} centre={<KickoffChip m={m} />} />
      <div className="ml-auto flex flex-wrap gap-2">
        <Link href={matchHref(m)} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
          Match centre<span className="sr-only">: {fixtureLabel(m)}</span>
        </Link>
        {tickets ? (
          <a
            href={tickets.href}
            rel="noopener"
            className={buttonClass({ variant: 'primary-light', size: 'sm', px: 'px-[18px]' })}
          >
            {tickets.label}
            <span className="sr-only">: {fixtureLabel(m)}</span>
          </a>
        ) : m.ticketAvailability === 'sold_out' ? (
          <span className="inline-flex min-h-touch items-center px-2 text-[14px] font-bold text-slate">
            Sold out
          </span>
        ) : null}
        {m.status !== 'cancelled' ? (
          <a
            href={`${matchHref(m)}/calendar.ics`}
            download
            aria-label={`Add ${fixtureLabel(m)} to calendar`}
            className="inline-flex size-touch items-center justify-center rounded-button border border-line bg-white text-navy hover:border-navy"
          >
            <CalendarAddIcon />
          </a>
        ) : null}
      </div>
    </article>
  )
}

export function ResultRow({ m }: { m: MatchSummary }) {
  const score = resolveScore(m, [])
  return (
    <article
      aria-label={`${m.home.name} ${score.home}, ${m.away.name} ${score.away}, ${formatLongDate(m.kickoff, m.timezone)}`}
      className="flex flex-wrap items-center gap-x-7 gap-y-4 rounded-card border border-line bg-white px-4 py-4 sm:px-5"
    >
      <DateBox m={m} tone="light" />
      <div className="flex flex-[1_1_170px] flex-col gap-1.5">
        <Tag>{m.competition.shortName}</Tag>
        <span className="text-[14px] text-slate">Full time</span>
      </div>
      <Teams
        m={m}
        centre={
          <div className="rounded-lg bg-night px-4 py-2 font-display text-[28px] leading-none font-black whitespace-nowrap text-white">
            {score.home} : {score.away}
          </div>
        }
      />
      <div className="ml-auto flex flex-wrap gap-2">
        <Link href={matchHref(m)} className={buttonClass({ variant: 'secondary', size: 'sm' })}>
          Match centre<span className="sr-only">: {fixtureLabel(m)}</span>
        </Link>
        {m.hasHighlights ? (
          <Link
            href={`${matchHref(m)}#highlights`}
            className={buttonClass({ variant: 'primary-light', size: 'sm' })}
          >
            Highlights<span className="sr-only">: {fixtureLabel(m)}</span>
          </Link>
        ) : null}
      </div>
    </article>
  )
}

/** Result card on Home: competition and date, crests either side of the score. */
export function ResultCard({ m }: { m: MatchSummary }) {
  const score = resolveScore(m, [])
  return (
    <article className="flex flex-col gap-4 rounded-card border border-line bg-white p-5">
      <div className="flex justify-between text-[13px] text-slate">
        <span>{m.competition.shortName}</span>
        <time dateTime={m.kickoff}>
          {new Intl.DateTimeFormat('en-GB', {
            timeZone: m.timezone,
            day: 'numeric',
            month: 'short',
          }).format(new Date(m.kickoff))}
        </time>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <TeamCrest team={m.home} size={40} />
          <span className="text-[14px] font-semibold">{m.home.name}</span>
        </div>
        <div className="font-display text-[40px] leading-none font-black whitespace-nowrap text-navy">
          <span className="sr-only">Score: </span>
          {score.home} : {score.away}
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <TeamCrest team={m.away} size={40} />
          <span className="text-[14px] font-semibold">{m.away.name}</span>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line pt-3 text-[14px]">
        <span className="text-slate">Full time</span>
        <Link href={matchHref(m)} className="font-semibold">
          Match centre<span className="sr-only">: {fixtureLabel(m)}</span>
        </Link>
      </div>
    </article>
  )
}

/** Compact result card in the horizontal scroller on phones (MobileHome.dc.html). */
export function ResultCardCompact({ m }: { m: MatchSummary }) {
  const score = resolveScore(m, [])
  const opponent = m.home.isUs ? m.away : m.home
  return (
    <Link
      href={matchHref(m)}
      className="relative block flex-[0_0_250px] snap-start rounded-card border border-line bg-white p-4 text-ink no-underline hover:border-navy hover:text-ink"
    >
      <p className="m-0 text-[12px] text-slate">{m.competition.shortName}, full time</p>
      <div className="mt-3 flex items-center justify-between">
        <TeamCrest team={m.home} size={36} />
        <span className="font-display text-[36px] leading-none font-black text-navy">
          <span className="sr-only">{m.home.name} </span>
          {score.home} : {score.away}
          <span className="sr-only"> {m.away.name}</span>
        </span>
        <TeamCrest team={m.away} size={36} />
      </div>
      <p className="m-0 mt-2.5 text-[14px] font-semibold">vs {opponent.name}</p>
    </Link>
  )
}
