import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
  createLivePoller,
  type LiveSnapshot,
  liveLabel,
  POLL_INTERVAL_MS,
  toSnapshot,
} from '@/lib/domain/live'
import type { MatchDetail } from '@/lib/types'

import { event, match } from './fixtures'

const snap = (status: LiveSnapshot['status']): LiveSnapshot => ({
  status,
  minute: 50,
  score: { home: 1, away: 0 },
  halfTime: { home: 1, away: 0 },
  scorers: { home: [], away: [] },
  timeline: [],
})

describe('live poller', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('polls every 30 seconds while live', async () => {
    const fetchSnapshot = vi.fn(async () => snap('live'))
    const poller = createLivePoller({
      fetchSnapshot,
      onSnapshot: vi.fn(),
      onFinished: vi.fn(),
      isHidden: () => false,
    })
    poller.start()
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 3)
    expect(fetchSnapshot).toHaveBeenCalledTimes(3)
    poller.stop()
  })

  it('pauses while the tab is hidden and fetches at once when it returns', async () => {
    let hidden = false
    const fetchSnapshot = vi.fn(async () => snap('half_time'))
    const poller = createLivePoller({
      fetchSnapshot,
      onSnapshot: vi.fn(),
      onFinished: vi.fn(),
      isHidden: () => hidden,
    })
    poller.start()
    hidden = true
    poller.onVisibilityChange()
    expect(poller.running).toBe(false)
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 4)
    expect(fetchSnapshot).not.toHaveBeenCalled()
    hidden = false
    poller.onVisibilityChange()
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchSnapshot).toHaveBeenCalledTimes(1)
    expect(poller.running).toBe(true)
    poller.stop()
  })

  it('stops and asks for a refresh at full time', async () => {
    const onFinished = vi.fn()
    const onSnapshot = vi.fn()
    const poller = createLivePoller({
      fetchSnapshot: async () => snap('full_time'),
      onSnapshot,
      onFinished,
      isHidden: () => false,
    })
    poller.start()
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS)
    expect(onSnapshot).toHaveBeenCalledOnce()
    expect(onFinished).toHaveBeenCalledOnce()
    expect(poller.running).toBe(false)
  })

  it('survives a failed request', async () => {
    const fetchSnapshot = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(snap('live'))
    const onSnapshot = vi.fn()
    const poller = createLivePoller({
      fetchSnapshot,
      onSnapshot,
      onFinished: vi.fn(),
      isHidden: () => false,
    })
    poller.start()
    await vi.advanceTimersByTimeAsync(POLL_INTERVAL_MS * 2)
    expect(onSnapshot).toHaveBeenCalledOnce()
    poller.stop()
  })
})

describe('snapshot', () => {
  it('summarises a live match', () => {
    const detail = {
      ...match({ status: 'live', minute: 67, homeScore: null, awayScore: null }),
      events: [
        event({ minute: 12, side: 'home', type: 'goal', player: { name: 'Nine', slug: 'nine' } }),
      ],
    } as MatchDetail
    const s = toSnapshot(detail)
    expect(s.score).toEqual({ home: 1, away: 0 })
    expect(s.scorers.home).toEqual(["Nine 12'"])
    expect(s.timeline[0]).toMatchObject({ kind: 'marker', text: 'Kick-off' })
    expect(liveLabel('live', 67)).toBe("Live, 67'")
    expect(liveLabel('half_time', 45)).toBe('Half time')
  })
})
