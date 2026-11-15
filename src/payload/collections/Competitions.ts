import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { validateSeason } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({
  tags: [tags.competitions, tags.matches],
  paths: ['/', '/fixtures'],
}))

export const Competitions: CollectionConfig = {
  slug: 'competitions',
  labels: { singular: 'Competition', plural: 'Competitions' },
  admin: {
    group: 'Matchday',
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'season'],
    description:
      'Leagues, cups and friendlies, one entry per season. League standings are entered here.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'shortName', type: 'text', admin: { width: '25%', description: 'Used on tags.' } },
        {
          name: 'type',
          type: 'select',
          required: true,
          options: [
            { label: 'League', value: 'league' },
            { label: 'Cup', value: 'cup' },
            { label: 'Friendly', value: 'friendly' },
          ],
          admin: { width: '25%' },
        },
      ],
    },
    {
      name: 'season',
      type: 'text',
      required: true,
      validate: validateSeason,
      admin: { placeholder: '2026/27' },
    },
    {
      name: 'standings',
      type: 'array',
      admin: {
        condition: (data) => data?.type === 'league',
        initCollapsed: true,
        description:
          'One row per club. The table is sorted by points, then goal difference, then goals scored. Leave points empty to calculate 3 for a win and 1 for a draw.',
      },
      fields: [
        { name: 'team', type: 'relationship', relationTo: 'teams', required: true },
        {
          type: 'row',
          fields: [
            { name: 'played', type: 'number', min: 0, defaultValue: 0, admin: { width: '14%' } },
            { name: 'won', type: 'number', min: 0, defaultValue: 0, admin: { width: '14%' } },
            { name: 'drawn', type: 'number', min: 0, defaultValue: 0, admin: { width: '14%' } },
            { name: 'lost', type: 'number', min: 0, defaultValue: 0, admin: { width: '14%' } },
            {
              name: 'goalsFor',
              label: 'GF',
              type: 'number',
              min: 0,
              defaultValue: 0,
              admin: { width: '14%' },
            },
            {
              name: 'goalsAgainst',
              label: 'GA',
              type: 'number',
              min: 0,
              defaultValue: 0,
              admin: { width: '14%' },
            },
            { name: 'points', type: 'number', admin: { width: '16%' } },
          ],
        },
        {
          name: 'form',
          type: 'text',
          admin: { description: 'Last five results, oldest first, for example WDLWW.' },
          validate: (value: unknown) =>
            value == null || value === '' || /^[WDL]{1,5}$/.test(String(value))
              ? true
              : 'Up to five letters: W, D or L.',
        },
      ],
    },
  ],
}
