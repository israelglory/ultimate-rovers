import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { orderField } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({
  tags: [tags.people],
  paths: ['/club/stakeholders'],
}))

export const People: CollectionConfig = {
  slug: 'people',
  labels: { singular: 'Person', plural: 'People' },
  defaultSort: 'order',
  admin: {
    group: 'Club',
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'group', 'order'],
    description: 'Board, management, technical staff and investors on the Stakeholders page.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'role', type: 'text', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'group',
          type: 'select',
          required: true,
          options: [
            { label: 'Board of directors', value: 'board' },
            { label: 'Club management', value: 'management' },
            { label: 'Technical and medical staff', value: 'technical' },
            { label: 'Investors and patrons', value: 'investors' },
          ],
          admin: { width: '50%' },
        },
        {
          name: 'sinceYear',
          type: 'number',
          min: 1850,
          max: 2100,
          admin: { width: '50%', placeholder: 'YYYY' },
        },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Square crop works best.' },
    },
    orderField,
  ],
}
