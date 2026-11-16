import type { LineupPlayer, Side } from '@/lib/types'

export type PitchSpot = { left: number; top: number }

/** Parses "4-3-3" into [4, 3, 3]. Invalid or missing formations fall back to 4-4-2. */
export function parseFormation(formation: string | null | undefined): number[] {
  if (formation && /^\d(-\d){1,4}$/.test(formation)) return formation.split('-').map(Number)
  return [4, 4, 2]
}

/** Vertical spread of k players across a line, in percent of pitch height. */
export function lineYs(count: number): number[] {
  if (count <= 1) return [50]
  const margin = Math.max(12, 50 - 12 * (count - 1))
  const step = (100 - 2 * margin) / (count - 1)
  return Array.from({ length: count }, (_, i) => round(margin + i * step))
}

const round = (n: number) => Math.round(n * 10) / 10

/**
 * Pitch coordinates (percent of the whole pitch) for a starting XI.
 * The home side defends the left goal; the away side is mirrored on the right.
 * Players are read in order: goalkeeper, then each line from defence to attack.
 * Manual x/y (0 = own goal line, 100 = halfway; y 0 = left touchline) override the formation.
 */
export function pitchSpots(
  players: LineupPlayer[],
  formation: string | null | undefined,
  side: Side,
): PitchSpot[] {
  const lines = parseFormation(formation)
  const total = 1 + lines.reduce((a, b) => a + b, 0)
  const lineXs = lines.map((_, i) =>
    lines.length === 1 ? 30 : 18 + (i * (43 - 18)) / (lines.length - 1),
  )

  const spots: PitchSpot[] = []
  // Goalkeeper.
  spots.push({ left: 5, top: 50 })
  lines.forEach((count, i) => {
    for (const y of lineYs(count)) spots.push({ left: round(lineXs[i] ?? 30), top: y })
  })

  return players.slice(0, Math.max(total, players.length)).map((player, i) => {
    const base = spots[i] ?? { left: 25, top: 50 }
    const left = player.x != null ? round(player.x / 2) : base.left
    const top = player.y != null ? player.y : base.top
    return side === 'home' ? { left, top } : { left: round(100 - left), top: round(100 - top) }
  })
}
