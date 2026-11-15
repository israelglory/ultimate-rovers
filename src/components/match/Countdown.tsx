'use client'

import { useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import { countdownParts, pad2 } from '@/lib/countdown'

/**
 * Days, hours and minutes to kick-off. The server renders the numbers from `serverNow`, so hydration
 * matches; the client then ticks on each minute boundary. Hidden once the match starts.
 */
export function Countdown({
  kickoff,
  serverNow,
  variant = 'strip',
}: {
  kickoff: string
  serverNow: number
  variant?: 'strip' | 'match'
}) {
  const [now, setNow] = useState(serverNow)

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    // Align ticks to the start of each minute.
    const timeout = setTimeout(
      () => {
        setNow(Date.now())
        interval = setInterval(() => setNow(Date.now()), 60_000)
      },
      60_000 - (Date.now() % 60_000),
    )
    return () => {
      clearTimeout(timeout)
      if (interval) clearInterval(interval)
    }
  }, [])

  const parts = countdownParts(kickoff, now)
  if (parts.done) return null

  const box =
    variant === 'strip'
      ? 'min-w-12 rounded-lg bg-night px-2.5 py-2 text-center'
      : 'min-w-11 rounded-lg bg-navy px-2.5 py-1.5 text-center'
  const num = variant === 'strip' ? 'text-[28px]' : 'text-[24px]'
  const units: Array<[number, string, string]> = [
    [parts.days, 'days', parts.days === 1 ? 'day' : 'days'],
    [parts.hours, 'hrs', parts.hours === 1 ? 'hour' : 'hours'],
    [parts.minutes, 'mins', parts.minutes === 1 ? 'minute' : 'minutes'],
  ]
  return (
    <div
      role="timer"
      aria-label={`Countdown to kick-off: ${units.map(([n, , long]) => `${n} ${long}`).join(', ')}`}
      className={cn('flex', variant === 'strip' ? 'gap-2' : 'gap-1.5')}
    >
      {units.map(([n, short]) => (
        <div key={short} className={box} aria-hidden="true">
          <div className={cn('font-display leading-none font-extrabold text-white', num)}>
            {pad2(n)}
          </div>
          <div className="text-[12px] text-mist-text">{short}</div>
        </div>
      ))}
    </div>
  )
}
