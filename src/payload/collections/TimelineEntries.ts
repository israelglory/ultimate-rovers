import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { orderField } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({ tags: [tags.timeline], paths: ['/club'] }))

export const TimelineEntries: CollectionConfig = {
  slug: 'timeline-entries',
  labels: { singular: 'Timeline entry', plural: 'Timeline' },
  defaultSort: 'order',
  admin: {
    group: 'Club',
    useAsTitle: 'title',
    defaultColumns: ['year', 'title', 'order'],
    description: 'Our story on the About page.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'year',
          type: 'text',
          required: true,
          admin: { width: '25%', placeholder: 'YYYY' },
        },
        { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
      ],
    },
    { name: 'text', type: 'textarea' },
    orderField,
  ],
}
