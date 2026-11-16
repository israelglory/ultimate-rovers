import type { CollectionConfig } from 'payload'

import { admins, nobody } from '../access'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletter-subscribers',
  labels: { singular: 'Newsletter subscriber', plural: 'Newsletter subscribers' },
  defaultSort: '-createdAt',
  admin: { group: 'Inbox', useAsTitle: 'email', defaultColumns: ['email', 'source', 'createdAt'] },
  access: { read: admins, create: nobody, update: admins, delete: admins },
  fields: [
    { name: 'email', type: 'email', required: true, unique: true, index: true },
    { name: 'consent', type: 'checkbox', required: true, defaultValue: false },
    {
      name: 'consentText',
      type: 'text',
      admin: { description: 'The wording shown when they subscribed.' },
    },
    { name: 'source', type: 'text', defaultValue: 'footer' },
  ],
}
