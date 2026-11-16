import { BlocksFeature, lexicalEditor } from '@payloadcms/richtext-lexical'
import type { Block, CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { publishedOrStaff, staff } from '../access'
import { slugField, urlValidate } from '../fields'
import { revalidateCollection, slugOf } from '../hooks/revalidate'

export const articleCategories = [
  { label: 'Match report', value: 'match-report' },
  { label: 'Match preview', value: 'match-preview' },
  { label: 'Squad news', value: 'squad-news' },
  { label: 'Club', value: 'club' },
  { label: 'Academy', value: 'academy' },
  { label: 'Community', value: 'community' },
] as const

export const VideoEmbedBlock: Block = {
  slug: 'videoEmbed',
  labels: { singular: 'Video', plural: 'Videos' },
  interfaceName: 'VideoEmbedBlock',
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      validate: urlValidate,
      admin: { description: 'YouTube, Vimeo or an MP4 link.' },
    },
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'Read out to screen reader users.' },
    },
    { name: 'caption', type: 'text' },
    { name: 'poster', type: 'upload', relationTo: 'media' },
  ],
}

const revalidation = revalidateCollection((doc, previous) => {
  const slugs = [slugOf(doc), slugOf(previous)].filter((s): s is string => Boolean(s))
  return {
    tags: [tags.articles, ...slugs.map(tags.article), tags.matches],
    paths: ['/', '/news', ...slugs.map((s) => `/news/${s}`)],
  }
})

export const Articles: CollectionConfig = {
  slug: 'articles',
  labels: { singular: 'Article', plural: 'Articles' },
  defaultSort: '-publishedAt',
  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'publishedAt', '_status'],
    listSearchableFields: ['title', 'standfirst'],
  },
  versions: { drafts: { autosave: false }, maxPerDoc: 20 },
  access: { read: publishedOrStaff, create: staff, update: staff, delete: staff },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField((d) => (typeof d.title === 'string' ? d.title : undefined)),
    {
      name: 'publishedAt',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: { position: 'sidebar', date: { pickerAppearance: 'dayAndTime' } },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'The newest featured story leads Home and News.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          required: true,
          options: [...articleCategories],
          admin: { width: '50%' },
        },
        { name: 'author', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'standfirst',
      type: 'textarea',
      required: true,
      admin: { description: 'One sentence that sums up the story.' },
    },
    { name: 'heroImage', type: 'upload', relationTo: 'media', admin: { description: '16:9.' } },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ defaultFeatures }) => [
          ...defaultFeatures,
          BlocksFeature({ blocks: [VideoEmbedBlock] }),
        ],
      }),
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
          name: 'relatedPlayers',
          type: 'relationship',
          relationTo: 'players',
          hasMany: true,
          admin: { width: '50%' },
        },
      ],
    },
  ],
}
