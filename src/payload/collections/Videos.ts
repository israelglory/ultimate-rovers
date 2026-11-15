import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { urlValidate } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({
  tags: [tags.videos, tags.matches],
  paths: ['/'],
}))

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos' },
  defaultSort: '-publishedAt',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt'],
    description: 'Highlights, interviews and features. The three newest appear in Watch on Home.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, context }) => {
        // The seed creates placeholder entries without a source; the site shows them as "coming soon".
        if (context.skipVideoValidation) return data
        const merged = { ...(originalDoc ?? {}), ...(data ?? {}) }
        if (!merged.url && !merged.file) throw new Error('Add a video link or upload a file.')
        return data
      },
    ],
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    {
      name: 'url',
      type: 'text',
      validate: urlValidate,
      admin: { description: 'YouTube or Vimeo link, or a direct MP4 link.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
          admin: { width: '50%', description: 'Or upload an MP4.' },
        },
        { name: 'poster', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'durationSeconds',
          label: 'Duration (seconds)',
          type: 'number',
          min: 0,
          admin: { width: '50%' },
        },
        {
          name: 'publishedAt',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: { width: '50%', date: { pickerAppearance: 'dayAndTime' } },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'relatedMatch',
          type: 'relationship',
          relationTo: 'matches',
          admin: { width: '50%' },
        },
        {
          name: 'relatedPlayer',
          type: 'relationship',
          relationTo: 'players',
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
