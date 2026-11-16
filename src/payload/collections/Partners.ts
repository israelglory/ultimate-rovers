import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { orderField, urlValidate } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({
  tags: [tags.partners],
  paths: ['/', '/club/stakeholders'],
}))

export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partner', plural: 'Partners' },
  defaultSort: 'order',
  admin: {
    group: 'Club',
    useAsTitle: 'name',
    defaultColumns: ['name', 'tier', 'order'],
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        {
          name: 'tier',
          type: 'select',
          required: true,
          options: [
            { label: 'Principal partner', value: 'principal' },
            { label: 'Official partner', value: 'official' },
            { label: 'Official supplier', value: 'supplier' },
            { label: 'Community partner', value: 'community' },
          ],
          admin: { width: '50%' },
        },
        { name: 'url', type: 'text', validate: urlValidate, admin: { width: '50%' } },
      ],
    },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    {
      name: 'blurb',
      type: 'textarea',
      admin: { description: 'One line, shown for the principal partner.' },
    },
    {
      name: 'showOnHome',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Include in the partner strip on Home.' },
    },
    orderField,
  ],
}
