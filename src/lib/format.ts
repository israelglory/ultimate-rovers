/** Date and time formatting in the kickoff timezone. British English, 24-hour clock. */

const fmt = (iso: string, timeZone: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone, ...options }).format(new Date(iso))

/** "15:00" */
export const formatTime = (iso: string, tz: string) =>
  fmt(iso, tz, { hour: '2-digit', minute: '2-digit', hour12: false })

/** "Sat" */
export const formatWeekdayShort = (iso: string, tz: string) => fmt(iso, tz, { weekday: 'short' })

/** "21" */
export const formatDayOfMonth = (iso: string, tz: string) => fmt(iso, tz, { day: '2-digit' })

/** "November 2026" */
export const formatMonthYear = (iso: string, tz: string) =>
  fmt(iso, tz, { month: 'long', year: 'numeric' })

/** "Sat, 21 November" */
export const formatDayMonth = (iso: string, tz: string) =>
  `${formatWeekdayShort(iso, tz)}, ${fmt(iso, tz, { day: 'numeric', month: 'long' })}`

/** "Sat, 21 November 2026" */
export const formatLongDate = (iso: string, tz: string) =>
  `${formatWeekdayShort(iso, tz)}, ${fmt(iso, tz, { day: 'numeric', month: 'long', year: 'numeric' })}`

/** "21 November 2026" */
export const formatDate = (iso: string, tz = 'Africa/Lagos') =>
  fmt(iso, tz, { day: 'numeric', month: 'long', year: 'numeric' })

/** "21 Nov" */
export const formatShortDate = (iso: string, tz: string) =>
  fmt(iso, tz, { day: 'numeric', month: 'short' })

/** "21 Nov 2026" */
export const formatShortDateYear = (iso: string, tz: string) =>
  fmt(iso, tz, { day: 'numeric', month: 'short', year: 'numeric' })

/** "November 2026" for a joined date, kept in UTC because month-only dates have no time. */
export const formatMonthYearUtc = (iso: string) =>
  fmt(iso, 'UTC', { month: 'long', year: 'numeric' })

/** "4:05" from seconds. */
export function formatDuration(seconds: number | null | undefined): string | null {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) return null
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const rest = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${rest}` : `${m}:${rest}`
}

/** Whole years between a birth date and now. */
export function ageOn(dateOfBirth: string, now: Date = new Date()): number {
  const dob = new Date(dateOfBirth)
  let age = now.getUTCFullYear() - dob.getUTCFullYear()
  const beforeBirthday =
    now.getUTCMonth() < dob.getUTCMonth() ||
    (now.getUTCMonth() === dob.getUTCMonth() && now.getUTCDate() < dob.getUTCDate())
  if (beforeBirthday) age -= 1
  return age
}

export const formatNumber = (n: number) => new Intl.NumberFormat('en-GB').format(n)
