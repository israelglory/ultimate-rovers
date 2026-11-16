import type { CollectionConfig, GroupField } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { slugField, urlValidate } from '../fields'
import { revalidateCollection, slugOf } from '../hooks/revalidate'

export const positionGroups = [
  { label: 'Goalkeeper', value: 'goalkeeper' },
  { label: 'Defender', value: 'defender' },
  { label: 'Midfielder', value: 'midfielder' },
  { label: 'Forward', value: 'forward' },
] as const

const statNumbers = (name: string, label: string, description: string): GroupField => ({
  name,
  label,
  type: 'group',
  admin: { description },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'appearances', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'starts', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'goals', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'assists', type: 'number', min: 0, admin: { width: '25%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'minutes', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'shotsOnTarget', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'yellowCards', type: 'number', min: 0, admin: { width: '25%' } },
        { name: 'redCards', type: 'number', min: 0, admin: { width: '25%' } },
      ],
    },
  ],
})

const revalidation = revalidateCollection((doc, previous) => {
  const slugs = [slugOf(doc), slugOf(previous)].filter((s): s is string => Boolean(s))
  return {
    tags: [tags.players, tags.matches, ...slugs.map(tags.player)],
    paths: ['/', '/squad', ...slugs.map((s) => `/squad/${s}`)],
  }
})

export const Players: CollectionConfig = {
  slug: 'players',
  labels: { singular: 'Player', plural: 'Players' },
  defaultSort: 'squadNumber',
  admin: {
    group: 'Squad',
    useAsTitle: 'displayName',
    defaultColumns: ['displayName', 'squadNumber', 'positionGroup', 'status'],
    listSearchableFields: ['firstName', 'surname', 'displayName'],
    description:
      'Season stats are counted from match line-ups and events. Use the override fields only for figures events do not capture.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        const merged = { ...(originalDoc ?? {}), ...data }
        return { ...data, displayName: `${merged.firstName ?? ''} ${merged.surname ?? ''}`.trim() }
      },
    ],
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
  },
  fields: [
    { name: 'displayName', type: 'text', admin: { hidden: true } },
    slugField((d) => [d.firstName, d.surname].filter(Boolean).join(' ')),
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'On loan', value: 'on_loan' },
        { label: 'Left the club', value: 'left' },
      ],
      admin: { position: 'sidebar', description: 'Only active players appear on the squad page.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Profile',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'firstName', type: 'text', required: true, admin: { width: '50%' } },
                { name: 'surname', type: 'text', required: true, admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'squadNumber', type: 'number', min: 1, max: 99, admin: { width: '20%' } },
                {
                  name: 'positionGroup',
                  type: 'select',
                  required: true,
                  options: [...positionGroups],
                  admin: { width: '40%' },
                },
                {
                  name: 'position',
                  type: 'text',
                  admin: { width: '40%', placeholder: 'Centre-forward' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'dateOfBirth',
                  type: 'date',
                  admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } },
                },
                { name: 'nationality', type: 'text', admin: { width: '33%' } },
                {
                  name: 'heightCm',
                  label: 'Height (cm)',
                  type: 'number',
                  min: 120,
                  max: 230,
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'preferredFoot',
                  type: 'select',
                  options: [
                    { label: 'Right', value: 'right' },
                    { label: 'Left', value: 'left' },
                    { label: 'Both', value: 'both' },
                  ],
                  admin: { width: '25%' },
                },
                {
                  name: 'joined',
                  type: 'date',
                  admin: { width: '25%', date: { pickerAppearance: 'monthOnly' } },
                },
                { name: 'previousClub', type: 'text', admin: { width: '25%' } },
                {
                  name: 'contractUntil',
                  type: 'number',
                  min: 2000,
                  max: 2100,
                  admin: { width: '25%', placeholder: 'YYYY' },
                },
              ],
            },
            {
              name: 'photo',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Cut-out on a transparent background, PNG, 4:5. A silhouette shows when empty.',
              },
            },
            { name: 'biography', type: 'richText' },
            { name: 'quote', type: 'textarea' },
            {
              name: 'socials',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'instagram',
                      type: 'text',
                      validate: urlValidate,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'x',
                      label: 'X',
                      type: 'text',
                      validate: urlValidate,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'tiktok',
                      label: 'TikTok',
                      type: 'text',
                      validate: urlValidate,
                      admin: { width: '34%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Videos',
          fields: [
            {
              name: 'videos',
              type: 'array',
              maxRows: 2,
              admin: {
                description: 'Up to two videos. Paste a YouTube or Vimeo link, or upload an MP4.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'title', type: 'text', required: true, admin: { width: '60%' } },
                    {
                      name: 'durationSeconds',
                      label: 'Duration (seconds)',
                      type: 'number',
                      min: 0,
                      admin: { width: '40%' },
                    },
                  ],
                },
                { name: 'caption', type: 'text' },
                { name: 'url', type: 'text', validate: urlValidate },
                {
                  type: 'row',
                  fields: [
                    { name: 'file', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
                    {
                      name: 'poster',
                      type: 'upload',
                      relationTo: 'media',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Career and stats',
          fields: [
            {
              name: 'career',
              type: 'array',
              admin: {
                description:
                  'Newest first. Leave apps, goals and assists empty on Rovers seasons to count them from matches.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'season',
                      type: 'text',
                      required: true,
                      admin: { width: '20%', placeholder: '2026/27' },
                    },
                    { name: 'club', type: 'text', required: true, admin: { width: '35%' } },
                    { name: 'apps', type: 'number', min: 0, admin: { width: '15%' } },
                    { name: 'goals', type: 'number', min: 0, admin: { width: '15%' } },
                    { name: 'assists', type: 'number', min: 0, admin: { width: '15%' } },
                  ],
                },
              ],
            },
            statNumbers(
              'seasonOverrides',
              'This season overrides',
              'Any figure entered here replaces the one counted from matches this season. Shots on target only come from here.',
            ),
            statNumbers(
              'careerBeforeClub',
              'Career before Ultimate Rovers',
              'Totals from previous clubs, added to Rovers figures for the career view.',
            ),
          ],
        },
      ],
    },
  ],
}
