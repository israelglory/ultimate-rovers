import type { ArrayField, CollectionConfig, Field, GroupField } from 'payload'

import { tags } from '@/lib/cache-tags'
import { matchSlug } from '@/lib/slug'

import { anyone, staff } from '../access'
import { urlValidate, validateSeason } from '../fields'
import { revalidateCollection, slugOf } from '../hooks/revalidate'

export const matchStatuses = [
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Live', value: 'live' },
  { label: 'Half time', value: 'half_time' },
  { label: 'Full time', value: 'full_time' },
  { label: 'Postponed', value: 'postponed' },
  { label: 'Cancelled', value: 'cancelled' },
] as const

export const eventTypes = [
  { label: 'Goal', value: 'goal' },
  { label: 'Own goal', value: 'own_goal' },
  { label: 'Penalty goal', value: 'penalty' },
  { label: 'Yellow card', value: 'yellow' },
  { label: 'Second yellow (sent off)', value: 'second_yellow' },
  { label: 'Red card', value: 'red' },
  { label: 'Substitution', value: 'substitution' },
] as const

const sideOptions = [
  { label: 'Home', value: 'home' },
  { label: 'Away', value: 'away' },
]

const lineupPlayerFields: Field[] = [
  {
    type: 'row',
    fields: [
      {
        name: 'player',
        type: 'relationship',
        relationTo: 'players',
        admin: { width: '50%', description: 'For Rovers players. Counts towards their stats.' },
      },
      {
        name: 'name',
        type: 'text',
        admin: { width: '30%', description: 'For opponents, or to override the display name.' },
      },
      { name: 'number', type: 'number', min: 0, max: 99, admin: { width: '20%' } },
    ],
  },
]

const startingXI: ArrayField = {
  name: 'starting',
  label: 'Starting XI',
  type: 'array',
  maxRows: 11,
  admin: {
    initCollapsed: true,
    description:
      'Goalkeeper first, then each line from defence to attack, listed from the left as the team attacks. Positions on the pitch follow the formation; set X and Y only to move a player by hand.',
  },
  fields: [
    ...lineupPlayerFields,
    {
      type: 'row',
      fields: [
        {
          name: 'x',
          type: 'number',
          min: 0,
          max: 100,
          admin: { width: '50%', description: 'Optional. 0 is own goal line, 100 halfway.' },
        },
        {
          name: 'y',
          type: 'number',
          min: 0,
          max: 100,
          admin: { width: '50%', description: 'Optional. 0 is the left touchline.' },
        },
      ],
    },
  ],
}

const lineupSide = (name: string, label: string): GroupField => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'formation',
          type: 'text',
          admin: { width: '50%', placeholder: '4-3-3' },
          validate: (value: unknown) =>
            value == null || value === '' || /^\d(-\d){1,4}$/.test(String(value))
              ? true
              : 'Use a formation like 4-3-3.',
        },
        { name: 'headCoach', type: 'text', admin: { width: '50%' } },
      ],
    },
    startingXI,
    {
      name: 'substitutes',
      type: 'array',
      admin: { initCollapsed: true },
      fields: lineupPlayerFields,
    },
  ],
})

const statsSide = (name: string, label: string): GroupField => ({
  name,
  label,
  type: 'group',
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'possession',
          type: 'number',
          min: 0,
          max: 100,
          admin: { width: '25%', description: '%' },
        },
        { name: 'shots', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'shotsOnTarget', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'corners', type: 'number', min: 0, admin: { width: '25%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'passesCompleted', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'fouls', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'offsides', type: 'number', min: 0, admin: { width: '25%' } },
        {
          name: 'yellowCards',
          type: 'number',
          min: 0,
          admin: { width: '25%', description: 'Leave empty to count from events.' },
        },
      ],
    },
  ],
})

const teamNews = (name: string, label: string): ArrayField => ({
  name,
  label,
  type: 'array',
  admin: { initCollapsed: false },
  fields: [
    {
      name: 'text',
      type: 'text',
      required: true,
      admin: { placeholder: 'Player name: injury or suspension' },
    },
  ],
})

const relId = (value: unknown): number | string | undefined => {
  if (value && typeof value === 'object' && 'id' in value)
    return (value as { id: number | string }).id
  if (typeof value === 'number' || typeof value === 'string') return value
  return undefined
}

const matchTargets = (doc: Record<string, unknown>, previous?: Record<string, unknown>) => {
  const slugs = [slugOf(doc), slugOf(previous)].filter((s): s is string => Boolean(s))
  return {
    tags: [tags.matches, tags.players, ...slugs.map(tags.match)],
    paths: ['/', '/fixtures', ...slugs.map((s) => `/matches/${s}`)],
  }
}

const revalidation = revalidateCollection(matchTargets)

export const Matches: CollectionConfig = {
  slug: 'matches',
  labels: { singular: 'Match', plural: 'Matches' },
  defaultSort: '-kickoff',
  admin: {
    group: 'Matchday',
    useAsTitle: 'title',
    defaultColumns: ['title', 'kickoff', 'status', 'competition'],
    listSearchableFields: ['title', 'slug'],
    description:
      'Fixtures and results. During a match, update the Live tab and save: the match page, Home and Fixtures refresh straight away.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        if (!data) return data
        const merged = { ...(originalDoc ?? {}), ...data }
        const homeId = relId(merged.homeTeam)
        const awayId = relId(merged.awayTeam)
        if (homeId == null || awayId == null || !merged.kickoff) return data
        const [home, away] = await Promise.all([
          req.payload.findByID({ collection: 'teams', id: homeId, depth: 0, req }),
          req.payload.findByID({ collection: 'teams', id: awayId, depth: 0, req }),
        ])
        const title = `${home.name} vs ${away.name}`
        const next: Record<string, unknown> = { ...data, title }
        if (!merged.slug) {
          const tz = typeof merged.kickoff_tz === 'string' ? merged.kickoff_tz : 'Africa/Lagos'
          next.slug = matchSlug(String(merged.kickoff), tz, home.name, away.name)
        }
        if (!merged.venue && home.homeGround) next.venue = home.homeGround
        return next
      },
    ],
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: { readOnly: true, description: 'Set from the two teams.' },
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description:
          'Address of the match page. Generated from date and teams; clear it to regenerate.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Match',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'competition',
                  type: 'relationship',
                  relationTo: 'competitions',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'season',
                  type: 'text',
                  required: true,
                  index: true,
                  validate: validateSeason,
                  admin: { width: '25%', placeholder: '2026/27' },
                },
                { name: 'matchweek', type: 'number', min: 1, admin: { width: '25%' } },
              ],
            },
            {
              name: 'kickoff',
              type: 'date',
              required: true,
              index: true,
              timezone: true,
              admin: { date: { pickerAppearance: 'dayAndTime', timeIntervals: 15 } },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'homeTeam',
                  type: 'relationship',
                  relationTo: 'teams',
                  required: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'awayTeam',
                  type: 'relationship',
                  relationTo: 'teams',
                  required: true,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'venue',
              type: 'text',
              admin: { description: "Defaults to the home team's ground." },
            },
            {
              type: 'row',
              fields: [
                { name: 'referee', type: 'text', admin: { width: '33%' } },
                {
                  name: 'broadcast',
                  type: 'text',
                  admin: { width: '33%', description: 'Channel or stream name.' },
                },
                {
                  name: 'watchUrl',
                  type: 'text',
                  validate: urlValidate,
                  admin: { width: '34%', description: 'Link for "Watch live".' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ticketAvailability',
                  type: 'select',
                  defaultValue: 'not_on_sale',
                  options: [
                    { label: 'Not on sale yet', value: 'not_on_sale' },
                    { label: 'On sale', value: 'on_sale' },
                    { label: 'Members only', value: 'members_only' },
                    { label: 'Sold out', value: 'sold_out' },
                  ],
                  admin: { width: '50%' },
                },
                { name: 'ticketUrl', type: 'text', validate: urlValidate, admin: { width: '50%' } },
              ],
            },
            {
              name: 'ticketInfo',
              type: 'textarea',
              admin: {
                description: 'Shown in the Tickets card, for example prices and member priority.',
              },
            },
          ],
        },
        {
          label: 'Live',
          description: 'Score, minute and key moments. Save after each change.',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  required: true,
                  defaultValue: 'scheduled',
                  options: [...matchStatuses],
                  admin: { width: '34%' },
                },
                {
                  name: 'minute',
                  type: 'number',
                  min: 0,
                  max: 130,
                  admin: { width: '33%', description: 'Shown next to the live badge.' },
                },
                { name: 'attendance', type: 'number', min: 0, admin: { width: '33%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'homeScore', type: 'number', min: 0, admin: { width: '25%' } },
                { name: 'awayScore', type: 'number', min: 0, admin: { width: '25%' } },
                {
                  name: 'halfTimeHomeScore',
                  label: 'HT home',
                  type: 'number',
                  min: 0,
                  admin: { width: '25%' },
                },
                {
                  name: 'halfTimeAwayScore',
                  label: 'HT away',
                  type: 'number',
                  min: 0,
                  admin: { width: '25%' },
                },
              ],
            },
            {
              name: 'statusNote',
              type: 'text',
              admin: {
                description:
                  'Postponed or cancelled: the reason or new date, shown in place of the score.',
                condition: (data) => data?.status === 'postponed' || data?.status === 'cancelled',
              },
            },
            {
              name: 'events',
              type: 'array',
              admin: {
                initCollapsed: true,
                description:
                  'Goals, cards and substitutions. Kick-off, half time and full time markers are added automatically.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'minute',
                      type: 'number',
                      required: true,
                      min: 0,
                      max: 130,
                      admin: { width: '20%' },
                    },
                    {
                      name: 'addedTime',
                      type: 'number',
                      min: 0,
                      max: 30,
                      admin: { width: '20%', description: '+ minutes' },
                    },
                    {
                      name: 'side',
                      type: 'select',
                      required: true,
                      options: sideOptions,
                      admin: { width: '25%' },
                    },
                    {
                      name: 'type',
                      type: 'select',
                      required: true,
                      options: [...eventTypes],
                      admin: { width: '35%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'player',
                      type: 'relationship',
                      relationTo: 'players',
                      admin: {
                        width: '50%',
                        description: 'Scorer, booked player, or player coming on.',
                      },
                    },
                    {
                      name: 'playerName',
                      type: 'text',
                      admin: { width: '50%', description: 'For opponents.' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'relatedPlayer',
                      type: 'relationship',
                      relationTo: 'players',
                      admin: { width: '50%', description: 'Assist, or player going off.' },
                    },
                    {
                      name: 'relatedPlayerName',
                      type: 'text',
                      admin: { width: '50%', description: 'For opponents.' },
                    },
                  ],
                },
                {
                  name: 'note',
                  type: 'text',
                  admin: { description: 'Optional, for example "Foul" or "Header".' },
                },
              ],
            },
          ],
        },
        {
          label: 'Line-ups',
          fields: [
            {
              name: 'lineupsConfirmed',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Until ticked the page says "Predicted line-ups".' },
            },
            lineupSide('homeLineup', 'Home line-up'),
            lineupSide('awayLineup', 'Away line-up'),
          ],
        },
        {
          label: 'Stats',
          fields: [statsSide('homeStats', 'Home'), statsSide('awayStats', 'Away')],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'preview',
              type: 'textarea',
              admin: { description: 'Match preview shown before kick-off.' },
            },
            teamNews('homeTeamNews', 'Home team news'),
            teamNews('awayTeamNews', 'Away team news'),
            {
              type: 'row',
              fields: [
                {
                  name: 'playerOfTheMatch',
                  type: 'relationship',
                  relationTo: 'players',
                  admin: { width: '50%' },
                },
                {
                  name: 'highlights',
                  type: 'relationship',
                  relationTo: 'videos',
                  admin: { width: '50%' },
                },
              ],
            },
            {
              name: 'report',
              type: 'group',
              admin: {
                description:
                  'Match report for the Report tab. If left empty, the latest match report article linked to this match is shown.',
              },
              fields: [
                { name: 'headline', type: 'text' },
                { name: 'standfirst', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'author', type: 'text', admin: { width: '50%' } },
                    {
                      name: 'heroImage',
                      type: 'upload',
                      relationTo: 'media',
                      admin: { width: '50%' },
                    },
                  ],
                },
                { name: 'body', type: 'richText' },
                { name: 'coachQuote', type: 'textarea' },
              ],
            },
          ],
        },
      ],
    },
  ],
}
