export type CountdownParts = { days: number; hours: number; minutes: number; done: boolean }

/** Whole days, hours and minutes until kickoff. Rounds minutes up so 00:00:30 still shows 1 minute. */
export function countdownParts(kickoffIso: string, now: number = Date.now()): CountdownParts {
  const diff = new Date(kickoffIso).getTime() - now
  if (!(diff > 0)) return { days: 0, hours: 0, minutes: 0, done: true }
  const totalMinutes = Math.ceil(diff / 60_000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
    done: false,
  }
}

export const pad2 = (n: number) => String(n).padStart(2, '0')
