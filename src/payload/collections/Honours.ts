import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { orderField } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({ tags: [tags.honours], paths: ['/club'] }))

export const Honours: CollectionConfig = {
  slug: 'honours',
  labels: { singular: 'Honour', plural: 'Honours' },
  defaultSort: 'order',
  admin: {
    group: 'Club',
    useAsTitle: 'competition',
    defaultColumns: ['competition', 'count', 'years'],
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  fields: [
    { name: 'competition', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'count', type: 'number', min: 0, defaultValue: 0, admin: { width: '30%' } },
        { name: 'years', type: 'text', admin: { width: '70%', placeholder: '2019, 2024' } },
      ],
    },
    orderField,
  ],
}
