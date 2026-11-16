/**
 * Sliding-window rate limiter kept in memory. The site runs as a single container, so
 * per-process memory is enough to stop form floods. With several replicas, move this to Postgres.
 */
export type RateLimiter = {
  check: (key: string, now?: number) => { allowed: boolean; retryAfterSeconds: number }
}

export function createRateLimiter({
  limit,
  windowMs,
}: {
  limit: number
  windowMs: number
}): RateLimiter {
  const hits = new Map<string, number[]>()
  return {
    check(key, now = Date.now()) {
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs)
      if (recent.length >= limit) {
        hits.set(key, recent)
        const oldest = recent[0] ?? now
        return { allowed: false, retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000) }
      }
      recent.push(now)
      hits.set(key, recent)
      // Keep memory bounded.
      if (hits.size > 10_000) {
        for (const [k, times] of hits) if (times.every((t) => now - t >= windowMs)) hits.delete(k)
      }
      return { allowed: true, retryAfterSeconds: 0 }
    },
  }
}
