import type { MatchDetail, MatchStatus } from '@/lib/types'

import {
  buildTimeline,
  halfTimeScore,
  isLive,
  resolveScore,
  scorers,
  type TimelineItem,
} from './match'

/** What the live JSON endpoint returns and the match page renders. */
export type LiveSnapshot = {
  status: MatchStatus
  minute: number | null
  score: { home: number; away: number }
  halfTime: { home: number; away: number }
  scorers: { home: string[]; away: string[] }
  timeline: TimelineItem[]
}

export function toSnapshot(match: MatchDetail): LiveSnapshot {
  return {
    status: match.status,
    minute: match.minute,
    score: resolveScore(match, match.events),
    halfTime: halfTimeScore(match, match.events),
    scorers: { home: scorers(match.events, 'home'), away: scorers(match.events, 'away') },
    timeline: buildTimeline(match, match.events),
  }
}

export const POLL_INTERVAL_MS = 30_000

/** Live badge text: "Live, 67'" or "Half time". */
export const liveLabel = (status: MatchStatus, minute: number | null) =>
  status === 'half_time' ? 'Half time' : `Live${minute != null ? `, ${minute}'` : ''}`

/**
 * Polls while the match is live and the tab is visible. Pauses when hidden, fetches straight away
 * when the tab comes back, and stops for good once the status leaves the live states.
 */
export function createLivePoller({
  intervalMs = POLL_INTERVAL_MS,
  fetchSnapshot,
  onSnapshot,
  onFinished,
  isHidden,
  // Arrow functions: browsers throw "Illegal invocation" if setInterval is called as a method of another object.
  timers = {
    setInterval: (fn, ms) => setInterval(fn, ms),
    clearInterval: (id) => clearInterval(id),
  },
}: {
  intervalMs?: number
  fetchSnapshot: () => Promise<LiveSnapshot | null>
  onSnapshot: (s: LiveSnapshot) => void
  onFinished: () => void
  isHidden: () => boolean
  timers?: {
    setInterval: (fn: () => void, ms: number) => ReturnType<typeof setInterval>
    clearInterval: (id: ReturnType<typeof setInterval>) => void
  }
}) {
  let handle: ReturnType<typeof setInterval> | null = null
  let stopped = false

  const stop = () => {
    stopped = true
    if (handle) timers.clearInterval(handle)
    handle = null
  }

  const tick = async () => {
    if (stopped || isHidden()) return
    try {
      const next = await fetchSnapshot()
      if (!next || stopped) return
      onSnapshot(next)
      if (!isLive(next.status)) {
        stop()
        onFinished()
      }
    } catch {
      // Network blip: try again on the next tick.
    }
  }

  const schedule = () => {
    if (handle || stopped) return
    handle = timers.setInterval(() => void tick(), intervalMs)
  }

  return {
    start() {
      if (!isHidden()) schedule()
    },
    onVisibilityChange() {
      if (stopped) return
      if (isHidden()) {
        if (handle) timers.clearInterval(handle)
        handle = null
      } else {
        void tick()
        schedule()
      }
    },
    stop,
    get running() {
      return handle !== null
    },
  }
}
