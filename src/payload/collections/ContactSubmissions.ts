import type { CollectionConfig } from 'payload'

import { admins, nobody } from '../access'

export const contactTopics = [
  { label: 'General enquiry', value: 'general' },
  { label: 'Membership', value: 'membership' },
  { label: 'Partnerships and sponsorship', value: 'partnerships' },
  { label: 'Media and press', value: 'media' },
  { label: 'Trials and academy', value: 'academy' },
] as const

/** Messages from the Contact form. Created only by the server action through the local API. */
export const ContactSubmissions: CollectionConfig = {
  slug: 'contact-submissions',
  labels: { singular: 'Contact message', plural: 'Contact messages' },
  defaultSort: '-createdAt',
  admin: {
    group: 'Inbox',
    useAsTitle: 'name',
    defaultColumns: ['name', 'topic', 'status', 'createdAt'],
    description: 'Every message sent through the Contact page, with where it was routed.',
  },
  access: { read: admins, create: nobody, update: admins, delete: admins },
  fields: [
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      options: [
        { label: 'New', value: 'new' },
        { label: 'Handled', value: 'handled' },
      ],
      admin: { position: 'sidebar' },
    },
    { name: 'name', type: 'text', required: true, admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', required: true, admin: { readOnly: true, width: '50%' } },
        { name: 'phone', type: 'text', admin: { readOnly: true, width: '50%' } },
      ],
    },
    {
      name: 'topic',
      type: 'select',
      required: true,
      options: [...contactTopics],
      admin: { readOnly: true },
    },
    { name: 'message', type: 'textarea', required: true, admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'routedTo', type: 'email', admin: { readOnly: true, width: '50%' } },
        {
          name: 'emailStatus',
          type: 'select',
          options: [
            { label: 'Sent', value: 'sent' },
            { label: 'Failed', value: 'failed' },
          ],
          admin: { readOnly: true, width: '50%' },
        },
      ],
    },
    { name: 'ipHash', type: 'text', admin: { readOnly: true, hidden: true } },
  ],
}
