import type { PositionFilter } from '@/lib/search-params'
import type { PositionGroup } from '@/lib/types'

export const positionGroups: Array<{
  group: PositionGroup
  filter: PositionFilter
  title: string
  singular: string
}> = [
  { group: 'goalkeeper', filter: 'goalkeepers', title: 'Goalkeepers', singular: 'Goalkeeper' },
  { group: 'defender', filter: 'defenders', title: 'Defenders', singular: 'Defender' },
  { group: 'midfielder', filter: 'midfielders', title: 'Midfielders', singular: 'Midfielder' },
  { group: 'forward', filter: 'forwards', title: 'Forwards', singular: 'Forward' },
]

export const groupInfo = (group: PositionGroup) =>
  positionGroups.find((g) => g.group === group) ?? positionGroups[0]!
