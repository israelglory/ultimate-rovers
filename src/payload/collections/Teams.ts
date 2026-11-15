import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { slugField } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({
  tags: [tags.teams, tags.matches, tags.competitions],
  paths: ['/', '/fixtures'],
}))

export const Teams: CollectionConfig = {
  slug: 'teams',
  labels: { singular: 'Team', plural: 'Teams' },
  admin: {
    group: 'Matchday',
    useAsTitle: 'name',
    defaultColumns: ['name', 'shortName', 'isUs'],
    description: 'Opponents and Ultimate Rovers itself. Exactly one team is marked as the club.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        // Only one team can be the club.
        if (data?.isUs) {
          const others = await req.payload.find({
            collection: 'teams',
            where: {
              isUs: { equals: true },
              ...(originalDoc?.id ? { id: { not_equals: originalDoc.id } } : {}),
            },
            limit: 1,
            depth: 0,
            req,
          })
          if (others.totalDocs > 0)
            throw new Error(`"${others.docs[0]?.name}" is already marked as the club.`)
        }
        return data
      },
    ],
    afterChange: [revalidation.afterChange],
    afterDelete: [revalidation.afterDelete],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
        { name: 'shortName', type: 'text', admin: { width: '40%' } },
      ],
    },
    slugField((d) => (typeof d.name === 'string' ? d.name : undefined)),
    {
      name: 'isUs',
      label: 'This is Ultimate Rovers',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'crest',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Transparent PNG or SVG.' },
    },
    { name: 'homeGround', type: 'text' },
  ],
}
