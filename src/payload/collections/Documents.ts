import path from 'node:path'

import type { CollectionConfig } from 'payload'

import { tags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { orderField } from '../fields'
import { revalidateCollection } from '../hooks/revalidate'

const revalidation = revalidateCollection(() => ({
  tags: [tags.documents],
  paths: ['/club/stakeholders'],
}))

export const Documents: CollectionConfig = {
  slug: 'documents',
  labels: { singular: 'Document', plural: 'Documents' },
  defaultSort: 'order',
  admin: {
    group: 'Club',
    useAsTitle: 'title',
    defaultColumns: ['title', 'filename', 'order'],
    description: 'Governance PDFs.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  upload: {
    staticDir: process.env.DOCUMENTS_DIR || path.resolve(process.cwd(), 'documents-uploads'),
    mimeTypes: ['application/pdf'],
  },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  fields: [{ name: 'title', type: 'text', required: true }, orderField],
}
