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
          className="absolute top-2.5 right-2.5 h-auto w-6 sm:top-3.5 sm:right-3.5 sm:w-[34px]"
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
        sizes="(max-width: 640px) 50vw, 300px"
        numberClass="top-1 left-2.5 text-[72px] [-webkit-text-stroke-width:1.5px] lg:top-2.5 lg:left-4 lg:text-[128px] lg:[-webkit-text-stroke-width:2px]"
      />
      <div className="px-3 pt-2.5 pb-3 lg:px-[18px] lg:pt-4 lg:pb-5">
        <p className="m-0 font-display text-[22px] leading-none font-extrabold uppercase lg:text-card-title">
          <span className="sr-only">{p.firstName} </span>
          {p.surname}
        </p>
        <p className="m-0 mt-1 text-[13px] text-slate lg:mt-1.5 lg:text-[14px]">
          <span className="hidden lg:inline">
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
      className="flex w-full flex-col overflow-hidden rounded-card border border-line bg-white text-ink no-underline hover:border-navy hover:text-ink"
    >
      {/* Two per row on phones (42 players in one column was 30 screens long), so everything scales down. */}
      <Panel
        p={p}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
        numberClass="top-1.5 left-2.5 text-[72px] [-webkit-text-stroke-width:1.5px] lg:top-2.5 lg:left-4 lg:text-[128px] lg:[-webkit-text-stroke-width:2px]"
        showCrest
      />
      <div className="flex flex-auto flex-col gap-1 px-3 pt-3 pb-3 lg:px-[18px] lg:pt-4 lg:pb-[18px]">
        <p className="m-0 text-[13px] leading-snug text-slate lg:text-[14px]">{p.firstName}</p>
        <p className="m-0 font-display text-[22px] leading-none font-extrabold break-words uppercase lg:text-[30px]">
          {p.surname}
        </p>
        <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-2 text-[13px] lg:mt-2.5 lg:pt-2.5 lg:text-[14px]">
          <span className="text-slate">
            {p.position ?? positionLabel[p.positionGroup]}
            {p.nationality ? `, ${p.nationality}` : ''}
          </span>
          <span className="hidden font-bold text-navy lg:inline" aria-hidden="true">
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
