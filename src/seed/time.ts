/** Offset of a timezone from UTC at a given instant, in milliseconds. */
function tzOffset(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instant))
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  const asUtc = Date.UTC(
    get('year'),
    get('month') - 1,
    get('day'),
    get('hour'),
    get('minute'),
    get('second'),
  )
  return asUtc - instant
}

/** UTC ISO string for a wall-clock time in a timezone. */
export function zonedTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): string {
  const guess = Date.UTC(year, month - 1, day, hour, minute)
  const first = guess - tzOffset(guess, timeZone)
  const second = guess - tzOffset(first, timeZone)
  return new Date(second).toISOString()
}

/** The Saturday `weeks` weeks from the one on or after `from`, at hh:mm local time. */
export function saturday(
  from: Date,
  weeks: number,
  hour: number,
  minute: number,
  timeZone: string,
  dayShift = 0,
): string {
  const base = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()))
  const untilSaturday = (6 - base.getUTCDay() + 7) % 7
  base.setUTCDate(base.getUTCDate() + untilSaturday + weeks * 7 + dayShift)
  return zonedTime(
    base.getUTCFullYear(),
    base.getUTCMonth() + 1,
    base.getUTCDate(),
    hour,
    minute,
    timeZone,
  )
}
