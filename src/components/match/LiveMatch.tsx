'use client'

import { useRouter } from 'next/navigation'
import { createContext, type ReactNode, useContext, useEffect, useState } from 'react'

import { cn } from '@/lib/cn'
import { createLivePoller, liveLabel, type LiveSnapshot } from '@/lib/domain/live'
import { isLive } from '@/lib/domain/match'

import { MatchTimeline } from './MatchTimeline'

const LiveContext = createContext<LiveSnapshot | null>(null)

const useSnapshot = (): LiveSnapshot => {
  const value = useContext(LiveContext)
  if (!value) throw new Error('Live components must sit inside LiveMatchProvider')
  return value
}

/**
 * Holds the live snapshot for a match page. While the match is live or at half time it polls
 * /api/live/[slug] every 30 seconds, pauses when the tab is hidden, and refreshes the page once
 * the status leaves the live states so the full-time layout and tabs appear.
 */
export function LiveMatchProvider({
  slug,
  initial,
  children,
}: {
  slug: string
  initial: LiveSnapshot
  children: ReactNode
}) {
  const [snapshot, setSnapshot] = useState(initial)
  const router = useRouter()

  useEffect(() => {
    if (!isLive(initial.status)) return
    const poller = createLivePoller({
      fetchSnapshot: async () => {
        const res = await fetch(`/api/live/${encodeURIComponent(slug)}`, { cache: 'no-store' })
        return res.ok ? ((await res.json()) as LiveSnapshot) : null
      },
      onSnapshot: setSnapshot,
      onFinished: () => router.refresh(),
      isHidden: () => document.visibilityState === 'hidden',
    })
    const onVisibility = () => poller.onVisibilityChange()
    poller.start()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      poller.stop()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [initial.status, slug, router])

  return <LiveContext.Provider value={snapshot}>{children}</LiveContext.Provider>
}

export function LiveScore({ className }: { className?: string }) {
  const { score } = useSnapshot()
  return (
    <span className={className}>
      <span aria-hidden="true">
        {score.home} : {score.away}
      </span>
      <span className="sr-only">
        Score {score.home} {score.away}
      </span>
    </span>
  )
}

export function LiveBadge() {
  const { status, minute } = useSnapshot()
  if (!isLive(status)) return null
  return (
    <span
      className="inline-flex items-center gap-2 rounded-pill bg-cyan px-3.5 py-1.5 text-[15px] font-bold text-night"
      role="status"
    >
      <span aria-hidden="true" className="size-[9px] rounded-full bg-night" />
      {liveLabel(status, minute)}
    </span>
  )
}

export function LiveScorers({ side, className }: { side: 'home' | 'away'; className?: string }) {
  const { scorers } = useSnapshot()
  const list = scorers[side]
  if (list.length === 0) return null
  return (
    <ul
      className={cn('m-0 flex list-none flex-col gap-1 p-0 text-[14px] text-mist-text', className)}
      aria-label="Scorers"
    >
      {list.map((s, i) => (
        <li key={`${s}-${i}`}>{s}</li>
      ))}
    </ul>
  )
}

export function LiveTimeline({ homeName, awayName }: { homeName: string; awayName: string }) {
  const { timeline, status } = useSnapshot()
  return (
    <div aria-live={isLive(status) ? 'polite' : undefined} aria-relevant="additions">
      <MatchTimeline items={timeline} homeName={homeName} awayName={awayName} />
    </div>
  )
}
