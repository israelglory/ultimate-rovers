/** Minimal RFC 5545 calendar writer for fixtures. */

export type IcsEvent = {
  uid: string
  start: string
  durationMinutes?: number
  summary: string
  location?: string | null
  description?: string | null
  url?: string | null
  status?: 'CONFIRMED' | 'TENTATIVE' | 'CANCELLED'
  updated?: string | null
}

const escapeText = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/** UTC timestamp in basic format: 20261121T150000Z */
export const icsDate = (iso: string) =>
  new Date(iso)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

/** Lines longer than 75 octets are folded with CRLF and a space, as the RFC requires. */
export function foldLine(line: string): string {
  const encoder = new TextEncoder()
  if (encoder.encode(line).length <= 75) return line
  const parts: string[] = []
  let current = ''
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74
    if (encoder.encode(current + char).length > limit) {
      parts.push(current)
      current = char
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function buildCalendar({
  name,
  events,
  now = new Date().toISOString(),
}: {
  name: string
  events: IcsEvent[]
  now?: string
}): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ultimate Rovers//Fixtures//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${escapeText(name)}`,
    'X-PUBLISHED-TTL:PT6H',
  ]
  for (const e of events) {
    const end = new Date(
      new Date(e.start).getTime() + (e.durationMinutes ?? 120) * 60_000,
    ).toISOString()
    lines.push(
      'BEGIN:VEVENT',
      `UID:${e.uid}`,
      `DTSTAMP:${icsDate(e.updated ?? now)}`,
      `DTSTART:${icsDate(e.start)}`,
      `DTEND:${icsDate(end)}`,
      `SUMMARY:${escapeText(e.summary)}`,
    )
    if (e.location) lines.push(`LOCATION:${escapeText(e.location)}`)
    if (e.description) lines.push(`DESCRIPTION:${escapeText(e.description)}`)
    if (e.url) lines.push(`URL:${e.url}`)
    lines.push(`STATUS:${e.status ?? 'CONFIRMED'}`, 'END:VEVENT')
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join('\r\n') + '\r\n'
}
