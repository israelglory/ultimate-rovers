import { describe, expect, it } from 'vitest'

import { countdownParts } from '@/lib/countdown'
import { ageOn, formatDuration, formatLongDate, formatTime } from '@/lib/format'
import {
  contactSchema,
  fieldErrors,
  isHoneypotTripped,
  newsletterSchema,
} from '@/lib/forms/schemas'
import { createRateLimiter } from '@/lib/rate-limit'
import { matchSlug, slugify } from '@/lib/slug'
import { parseVideoUrl } from '@/lib/video'

describe('slugs', () => {
  it('slugifies placeholder names and accents', () => {
    expect(slugify('[Opponent FC]')).toBe('opponent-fc')
    expect(slugify('Ševko & Sons')).toBe('sevko-and-sons')
  })

  it('dates match slugs in the kickoff timezone', () => {
    expect(
      matchSlug('2026-11-21T23:30:00Z', 'Europe/London', 'Ultimate Rovers', '[Opponent FC]'),
    ).toBe('2026-11-21-ultimate-rovers-vs-opponent-fc')
    expect(
      matchSlug('2026-11-21T23:30:00Z', 'Asia/Tokyo', 'Ultimate Rovers', '[Opponent FC]'),
    ).toBe('2026-11-22-ultimate-rovers-vs-opponent-fc')
  })
})

describe('formatting', () => {
  it('formats in the kickoff timezone', () => {
    expect(formatTime('2026-07-04T14:00:00Z', 'Europe/London')).toBe('15:00')
    expect(formatLongDate('2026-11-21T15:00:00Z', 'Europe/London')).toBe('Sat, 21 November 2026')
  })

  it('formats durations and ages', () => {
    expect(formatDuration(245)).toBe('4:05')
    expect(formatDuration(3725)).toBe('1:02:05')
    expect(formatDuration(null)).toBeNull()
    expect(ageOn('2000-11-20', new Date('2026-11-19T00:00:00Z'))).toBe(25)
    expect(ageOn('2000-11-20', new Date('2026-11-20T00:00:00Z'))).toBe(26)
  })
})

describe('countdown', () => {
  const now = Date.parse('2026-11-16T12:00:00Z')
  it('splits the remaining time', () => {
    expect(countdownParts('2026-11-21T15:00:00Z', now)).toEqual({
      days: 5,
      hours: 3,
      minutes: 0,
      done: false,
    })
    expect(countdownParts('2026-11-16T12:00:30Z', now)).toMatchObject({ minutes: 1, done: false })
  })
  it('is done at kick-off', () => {
    expect(countdownParts('2026-11-16T12:00:00Z', now).done).toBe(true)
  })
})

describe('form validation', () => {
  it('validates newsletter emails', () => {
    expect(newsletterSchema.safeParse({ email: ' fan@example.com ' }).success).toBe(true)
    const bad = newsletterSchema.safeParse({ email: 'nope' })
    expect(bad.success).toBe(false)
    if (!bad.success)
      expect(fieldErrors(bad.error)).toEqual({
        email: 'Enter an email address like name@example.com.',
      })
  })

  it('validates contact messages with one error per field', () => {
    const result = contactSchema.safeParse({
      name: '',
      email: 'x',
      phone: 'abc',
      topic: 'spam',
      message: 'hi',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(Object.keys(fieldErrors(result.error)).sort()).toEqual([
        'email',
        'message',
        'name',
        'phone',
        'topic',
      ])
    }
    expect(
      contactSchema.safeParse({
        name: 'Fan',
        email: 'fan@example.com',
        topic: 'membership',
        message: 'How do I become a member of the club?',
      }).success,
    ).toBe(true)
  })

  it('detects the honeypot', () => {
    const data = new FormData()
    expect(isHoneypotTripped(data)).toBe(false)
    data.set('website', 'http://spam.example')
    expect(isHoneypotTripped(data)).toBe(true)
  })
})

describe('rate limiter', () => {
  it('blocks after the limit and frees up after the window', () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000 })
    expect(limiter.check('ip', 0).allowed).toBe(true)
    expect(limiter.check('ip', 10).allowed).toBe(true)
    const blocked = limiter.check('ip', 20)
    expect(blocked).toEqual({ allowed: false, retryAfterSeconds: 1 })
    expect(limiter.check('other', 20).allowed).toBe(true)
    expect(limiter.check('ip', 1001).allowed).toBe(true)
  })
})

describe('video links', () => {
  it('recognises YouTube, Vimeo and files', () => {
    expect(parseVideoUrl('https://www.youtube.com/watch?v=abcdefghijk')).toMatchObject({
      kind: 'youtube',
      id: 'abcdefghijk',
    })
    expect(parseVideoUrl('https://youtu.be/abcdefghijk')).toMatchObject({
      kind: 'youtube',
      id: 'abcdefghijk',
    })
    expect(parseVideoUrl('https://vimeo.com/123456789')).toMatchObject({
      kind: 'vimeo',
      id: '123456789',
    })
    expect(parseVideoUrl('/api/media/file/clip.mp4')).toMatchObject({ kind: 'file' })
    expect(parseVideoUrl('https://example.com/page')).toBeNull()
    expect(parseVideoUrl(null)).toBeNull()
  })
})
