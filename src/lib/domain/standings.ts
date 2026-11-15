import type { FormResult, StandingRow, TeamRef } from '@/lib/types'

export type RawStanding = {
  team: TeamRef
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  points: number | null
  form: string | null
}

export function parseForm(form: string | null | undefined): FormResult[] {
  return (form ?? '')
    .toUpperCase()
    .split('')
    .filter((c): c is FormResult => c === 'W' || c === 'D' || c === 'L')
    .slice(-5)
}

/** Sorted table: points, goal difference, goals scored, then name. Points default to 3W + D. */
export function buildTable(rows: RawStanding[]): StandingRow[] {
  return rows
    .map((r) => ({
      team: r.team,
      played: r.played,
      won: r.won,
      drawn: r.drawn,
      lost: r.lost,
      goalsFor: r.goalsFor,
      goalsAgainst: r.goalsAgainst,
      goalDifference: r.goalsFor - r.goalsAgainst,
      points: r.points ?? r.won * 3 + r.drawn,
      form: parseForm(r.form),
      position: 0,
    }))
    .sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.team.name.localeCompare(b.team.name),
    )
    .map((row, i) => ({ ...row, position: i + 1 }))
}

/** A window of `size` rows centred on the club's row, clamped to the ends of the table. */
export function windowAroundClub(table: StandingRow[], size = 6): StandingRow[] {
  if (table.length <= size) return table
  const index = table.findIndex((r) => r.team.isUs)
  if (index < 0) return table.slice(0, size)
  const start = Math.min(Math.max(0, index - Math.floor((size - 1) / 2)), table.length - size)
  return table.slice(start, start + size)
}
