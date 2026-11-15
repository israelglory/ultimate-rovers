import Image from 'next/image'
import Link from 'next/link'

import { cn } from '@/lib/cn'
import type { PlayerRef, PositionGroup } from '@/lib/types'

import { PlayerSilhouette } from './PlayerSilhouette'

export const positionLabel: Record<PositionGroup, string> = {
  goalkeeper: 'Goalkeeper',
  defender: 'Defender',
  midfielder: 'Midfielder',
  forward: 'Forward',
}

const href = (p: PlayerRef) => `/squad/${p.slug}`

function Panel({
  p,
  numberClass,
  sizes,
  showCrest,
}: {
  p: PlayerRef
  numberClass: string
  sizes: string
  showCrest?: boolean
}) {
  return (
    <div className="relative flex aspect-[4/5] items-end justify-center overflow-hidden bg-navy">
      {p.squadNumber != null ? (
        <span
          aria-hidden="true"
          className={cn(
            'number-outline absolute font-display leading-none font-black',
            numberClass,
          )}
        >
          {p.squadNumber}
        </span>
      ) : null}
      {showCrest ? (
        <Image
          src="/crest.png"
          alt=""
          width={34}
          height={39}
          className="absolute top-3.5 right-3.5 h-auto w-[34px]"
          style={{ height: 'auto' }}
        />
      ) : null}
      <PlayerSilhouette photo={p.photo} sizes={sizes} className={p.photo ? 'w-full' : 'w-[74%]'} />
    </div>
  )
}

/** Home spotlight card: number, photo, SURNAME, number and position. */
export function PlayerCardSpotlight({ p }: { p: PlayerRef }) {
  return (
    <Link
      href={href(p)}
      className="flex flex-col overflow-hidden rounded-card bg-white text-ink no-underline hover:text-ink"
    >
      <Panel
        p={p}
        sizes="(max-width: 768px) 50vw, 300px"
        numberClass="top-1 left-2.5 text-[72px] [-webkit-text-stroke-width:1.5px] md:top-2.5 md:left-4 md:text-[128px] md:[-webkit-text-stroke-width:2px]"
      />
      <div className="px-3 pt-2.5 pb-3 md:px-[18px] md:pt-4 md:pb-5">
        <p className="m-0 font-display text-[22px] leading-none font-extrabold uppercase md:text-card-title">
          <span className="sr-only">{p.firstName} </span>
          {p.surname}
        </p>
        <p className="m-0 mt-1 text-[13px] text-slate md:mt-1.5 md:text-[14px]">
          <span className="hidden md:inline">
            {p.squadNumber != null ? `No. ${p.squadNumber}, ` : ''}
          </span>
          {positionLabel[p.positionGroup]}
        </p>
      </div>
    </Link>
  )
}

/** Squad page card. */
export function PlayerCardSquad({ p }: { p: PlayerRef }) {
  return (
    <Link
      href={href(p)}
      className="flex flex-col overflow-hidden rounded-card border border-line bg-white text-ink no-underline hover:border-navy hover:text-ink"
    >
      <Panel
        p={p}
        sizes="(max-width: 600px) 100vw, 300px"
        numberClass="top-2.5 left-4 text-[128px]"
        showCrest
      />
      <div className="flex flex-col gap-1 px-[18px] pt-4 pb-[18px]">
        <p className="m-0 text-[14px] text-slate">{p.firstName}</p>
        <p className="m-0 font-display text-[30px] leading-none font-extrabold uppercase">
          {p.surname}
        </p>
        <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-line pt-2.5 text-[14px]">
          <span className="text-slate">
            {p.position ?? positionLabel[p.positionGroup]}
            {p.nationality ? `, ${p.nationality}` : ''}
          </span>
          <span className="font-bold text-navy" aria-hidden="true">
            Profile
          </span>
        </div>
      </div>
    </Link>
  )
}

/** Small row card: "More forwards" on a profile. */
export function PlayerCardCompact({ p }: { p: PlayerRef }) {
  return (
    <Link
      href={href(p)}
      className="flex items-center gap-4 overflow-hidden rounded-card border border-line bg-white p-3 text-ink no-underline hover:border-navy hover:text-ink"
    >
      <div className="flex aspect-square flex-[0_0_88px] items-end justify-center overflow-hidden rounded-lg bg-navy">
        <PlayerSilhouette photo={p.photo} sizes="88px" className={p.photo ? 'w-full' : 'w-[80%]'} />
      </div>
      <div>
        <p className="m-0 font-display text-[26px] leading-none font-extrabold uppercase">
          <span className="sr-only">{p.firstName} </span>
          {p.surname}
        </p>
        <p className="m-0 mt-1.5 text-[14px] text-slate">
          {p.squadNumber != null ? `No. ${p.squadNumber}, ` : ''}
          {positionLabel[p.positionGroup]}
        </p>
      </div>
    </Link>
  )
}
