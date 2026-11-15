import type { CollectionConfig } from 'payload'

import { adminFieldAccess, admins, adminsOrSelf, isStaffUser } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'User', plural: 'Users' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'roles'],
    group: 'Admin',
    description:
      'Admins manage everything. Editors are matchday staff who update matches, players and news.',
  },
  auth: {
    tokenExpiration: 60 * 60 * 12,
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
  },
  access: {
    admin: ({ req }) => isStaffUser(req.user),
    read: adminsOrSelf,
    create: admins,
    update: adminsOrSelf,
    delete: admins,
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // The first account created through /admin becomes an admin.
        if (operation === 'create') {
          const { totalDocs } = await req.payload.count({
            collection: 'users',
            overrideAccess: true,
          })
          if (totalDocs === 0) return { ...data, roles: ['admin'] }
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      required: true,
      defaultValue: ['editor'],
      saveToJWT: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor (matchday staff)', value: 'editor' },
      ],
      access: { create: adminFieldAccess, update: adminFieldAccess },
      admin: { description: 'Only admins can change roles.' },
    },
  ],
}
