import type { GlobalConfig } from 'payload'

import { allListTags } from '@/lib/cache-tags'

import { admins, anyone } from '../access'
import { contactTopics } from '../collections/ContactSubmissions'
import { urlValidate, validateSeason } from '../fields'
import { revalidateGlobal } from '../hooks/revalidate'

const isTimezone = (value: unknown): true | string => {
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: String(value) })
    return true
  } catch {
    return 'Use an IANA timezone such as Europe/London.'
  }
}

export const ClubSettings: GlobalConfig = {
  slug: 'club-settings',
  label: 'Club settings',
  admin: {
    group: 'Club',
    description: 'Club details and page copy used across the site. Only admins can edit these.',
  },
  access: { read: anyone, update: admins },
  hooks: {
    afterChange: [revalidateGlobal({ tags: allListTags, paths: ['/'] })],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'clubName',
                  type: 'text',
                  required: true,
                  defaultValue: 'Ultimate Rovers',
                  admin: { width: '50%' },
                },
                { name: 'founded', type: 'text', admin: { width: '25%', placeholder: 'YYYY' } },
                {
                  name: 'currentSeason',
                  type: 'text',
                  required: true,
                  defaultValue: '2026/27',
                  validate: validateSeason,
                  admin: { width: '25%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'city', type: 'text', admin: { width: '33%' } },
                { name: 'country', type: 'text', admin: { width: '33%' } },
                {
                  name: 'timezone',
                  type: 'text',
                  required: true,
                  defaultValue: 'Europe/London',
                  validate: isTimezone,
                  admin: { width: '34%', description: 'Used for kick-off times and countdowns.' },
                },
              ],
            },
            {
              name: 'shortBio',
              type: 'textarea',
              admin: {
                description: 'One line about the club, shown in the footer and search results.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'ticketsUrl',
                  type: 'text',
                  validate: urlValidate,
                  admin: {
                    width: '50%',
                    description: 'Where "Get tickets" goes. Leave empty to use the Fixtures page.',
                  },
                },
                { name: 'broadcastPartner', type: 'text', admin: { width: '50%' } },
              ],
            },
            {
              name: 'crest',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Optional. The supplied crest is used when empty. Never stretch or recolour it.',
              },
            },
          ],
        },
        {
          label: 'Ground',
          fields: [
            {
              name: 'ground',
              type: 'group',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', admin: { width: '50%' } },
                    { name: 'capacity', type: 'number', min: 0, admin: { width: '25%' } },
                    {
                      name: 'surface',
                      type: 'text',
                      admin: { width: '25%', placeholder: 'Grass or artificial' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'street', type: 'text', admin: { width: '50%' } },
                    { name: 'city', type: 'text', admin: { width: '25%' } },
                    { name: 'postcode', type: 'text', admin: { width: '25%' } },
                  ],
                },
                { name: 'accessibleEntry', type: 'text' },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'mapUrl',
                      type: 'text',
                      validate: urlValidate,
                      admin: { width: '50%', description: 'Link for "Get directions".' },
                    },
                    {
                      name: 'mapEmbedUrl',
                      type: 'text',
                      validate: urlValidate,
                      admin: {
                        width: '50%',
                        description: 'Optional map embed for the Contact page.',
                      },
                    },
                  ],
                },
                {
                  name: 'photo',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { description: 'Stadium photo, 16:10.' },
                },
                {
                  name: 'guide',
                  type: 'textarea',
                  admin: {
                    description: 'Getting to the ground: parking, transport and accessible entry.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', admin: { width: '50%' } },
                {
                  name: 'replyDays',
                  type: 'number',
                  min: 1,
                  defaultValue: 2,
                  admin: {
                    width: '50%',
                    description: 'Working days to reply, shown under the form.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'officeHours',
                  type: 'text',
                  admin: { width: '50%', placeholder: 'Mon to Fri, 09:00 to 17:00' },
                },
                {
                  name: 'matchdayHours',
                  type: 'text',
                  admin: { width: '50%', placeholder: 'Matchdays, from 3 hours before kick-off' },
                },
              ],
            },
            {
              name: 'departments',
              type: 'array',
              admin: {
                description:
                  'Where Contact form messages go, by topic. Topics without a row go to the General enquiry address.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'topic',
                      type: 'select',
                      required: true,
                      options: [...contactTopics],
                      admin: { width: '40%' },
                    },
                    { name: 'email', type: 'email', required: true, admin: { width: '40%' } },
                    {
                      name: 'showCard',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { width: '20%', description: 'Show a card' },
                    },
                  ],
                },
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'text' },
              ],
            },
            {
              name: 'faqs',
              label: 'Common questions',
              type: 'array',
              fields: [
                { name: 'question', type: 'text', required: true },
                { name: 'answer', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'socials',
              type: 'group',
              admin: { description: 'Leave a field empty to hide that icon.' },
              fields: [
                { name: 'instagram', type: 'text', validate: urlValidate },
                { name: 'x', label: 'X', type: 'text', validate: urlValidate },
                { name: 'youtube', label: 'YouTube', type: 'text', validate: urlValidate },
                { name: 'tiktok', label: 'TikTok', type: 'text', validate: urlValidate },
                { name: 'facebook', type: 'text', validate: urlValidate },
              ],
            },
          ],
        },
        {
          label: 'Home',
          fields: [
            {
              name: 'heroIntro',
              type: 'textarea',
              defaultValue:
                'Fixtures, results, the squad and every story from the club, in one place.',
            },
            {
              name: 'spotlight',
              label: 'Squad spotlight',
              type: 'relationship',
              relationTo: 'players',
              hasMany: true,
              maxRows: 4,
              admin: { description: 'Four players for The squad section on Home.' },
            },
            {
              name: 'crestStory',
              type: 'textarea',
              admin: { description: 'The "More than a badge" paragraph.' },
            },
          ],
        },
        {
          label: 'About',
          fields: [
            { name: 'aboutIntro', type: 'textarea' },
            {
              name: 'story',
              type: 'array',
              admin: { description: 'Our story paragraphs.' },
              fields: [{ name: 'paragraph', type: 'textarea', required: true }],
            },
            {
              name: 'crestElements',
              type: 'array',
              maxRows: 4,
              fields: [
                { name: 'title', type: 'text', required: true },
                { name: 'text', type: 'textarea', required: true },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'mission', type: 'textarea', admin: { width: '33%' } },
                { name: 'vision', type: 'textarea', admin: { width: '33%' } },
                { name: 'values', type: 'textarea', admin: { width: '34%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'academyText', type: 'textarea', admin: { width: '50%' } },
                { name: 'communityText', type: 'textarea', admin: { width: '50%' } },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'academyImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%' },
                },
                {
                  name: 'communityImage',
                  type: 'upload',
                  relationTo: 'media',
                  admin: { width: '50%' },
                },
              ],
            },
            { name: 'membershipText', type: 'textarea' },
          ],
        },
        {
          label: 'Tickets',
          fields: [
            { name: 'seasonTicketText', type: 'textarea' },
            { name: 'matchdayTicketText', type: 'textarea' },
            {
              name: 'matchTicketText',
              type: 'textarea',
              admin: { description: 'Default text for the Tickets card on match pages.' },
            },
          ],
        },
        {
          label: 'Stakeholders',
          fields: [
            {
              name: 'partnershipText',
              type: 'textarea',
              admin: { description: 'The "Partner with us" panel.' },
            },
          ],
        },
        {
          label: 'Legal',
          fields: [
            { name: 'privacy', label: 'Privacy policy', type: 'richText' },
            { name: 'terms', label: 'Terms of use', type: 'richText' },
            { name: 'cookies', label: 'Cookie policy', type: 'richText' },
          ],
        },
      ],
    },
  ],
}
