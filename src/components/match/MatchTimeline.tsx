import Link from 'next/link'

import { cn } from '@/lib/cn'
import type { BadgeKind, TimelineItem } from '@/lib/domain/match'

const badgeClass: Record<BadgeKind, string> = {
  G: 'flex-[0_0_30px] h-[30px] rounded-full bg-cyan text-night',
  Y: 'flex-[0_0_22px] h-[30px] rounded bg-card-yellow text-night',
  R: 'flex-[0_0_22px] h-[30px] rounded bg-card-red text-white',
  S: 'flex-[0_0_30px] h-[30px] rounded-full bg-mist text-night',
}

function Badge({ kind, label }: { kind: BadgeKind; label: string }) {
  return (
    <span
      className={cn(
        'flex items-center justify-center text-[13px] font-extrabold',
        badgeClass[kind],
      )}
    >
      <span aria-hidden="true">{kind}</span>
      <span className="sr-only">{label}</span>
    </span>
  )
}

function Description({
  item,
  align,
}: {
  item: Extract<TimelineItem, { kind: 'event' }>
  align: 'left' | 'right'
}) {
  return (
    <div className={align === 'right' ? 'text-right' : undefined}>
      <p className="m-0 text-[15px] font-bold sm:text-[16px]">
        {item.playerSlug ? (
          <Link
            href={`/squad/${item.playerSlug}`}
            className="text-ink no-underline hover:underline"
          >
            {item.text}
          </Link>
        ) : (
          item.text
        )}
      </p>
      {item.sub ? <p className="m-0 mt-0.5 text-[13px] text-slate">{item.sub}</p> : null}
    </div>
  )
}

/** Key moments: home events on the left, away on the right, minute in the middle. */
export function MatchTimeline({
  items,
  homeName,
  awayName,
}: {
  items: TimelineItem[]
  homeName: string
  awayName: string
}) {
  return (
    <ol className="m-0 list-none rounded-[14px] border border-line bg-white p-0 [&>li+li]:border-t [&>li+li]:border-line">
      {items.map((item) =>
        item.kind === 'marker' ? (
          <li
            key={item.id}
            className="bg-mist px-5 py-3 text-center text-[14px] font-bold text-night first:rounded-t-[14px] last:rounded-b-[14px]"
          >
            {item.text}
          </li>
        ) : (
          <li
            key={item.id}
            className="grid grid-cols-[minmax(0,1fr)_56px_minmax(0,1fr)] items-center gap-2 px-3 py-3.5 sm:grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] sm:gap-3 sm:px-5"
          >
            <span className="sr-only">{item.side === 'home' ? homeName : awayName}, </span>
            <div className="flex items-center justify-end gap-3">
              {item.side === 'home' ? (
                <>
                  <Description item={item} align="right" />
                  <Badge kind={item.badge} label={item.badgeLabel} />
                </>
              ) : null}
            </div>
            <span className="justify-self-center rounded-pill bg-night px-2.5 py-1 text-[14px] font-bold whitespace-nowrap text-white">
              {item.minute}
            </span>
            <div className="flex items-center gap-3">
              {item.side === 'away' ? (
                <>
                  <Badge kind={item.badge} label={item.badgeLabel} />
                  <Description item={item} align="left" />
                </>
              ) : null}
            </div>
          </li>
        ),
      )}
    </ol>
  )
}
