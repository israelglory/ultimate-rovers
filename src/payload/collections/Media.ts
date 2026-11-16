import path from 'node:path'

import type { CollectionConfig } from 'payload'

import { allListTags } from '@/lib/cache-tags'

import { anyone, staff } from '../access'
import { revalidateCollection } from '../hooks/revalidate'

// Images are embedded in most cached data, so an edit (alt text, focal point) clears everything.
const revalidation = revalidateCollection(() => ({
  tags: allListTags,
  paths: [],
}))

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media item', plural: 'Media' },
  admin: {
    group: 'Content',
    defaultColumns: ['filename', 'alt', 'updatedAt'],
    description:
      'Images and video files. Player cut-outs: transparent PNG, 4:5. News: 16:9. Stadium: 16:10.',
  },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  hooks: { afterChange: [revalidation.afterChange], afterDelete: [revalidation.afterDelete] },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*', 'video/mp4', 'video/webm'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumb', width: 320 },
      { name: 'card', width: 720 },
      { name: 'hero', width: 1600 },
    ],
    adminThumbnail: 'thumb',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description:
          'Describe the image for screen reader users. Write "Decorative" if it adds nothing.',
      },
    },
    { name: 'credit', type: 'text' },
  ],
}
