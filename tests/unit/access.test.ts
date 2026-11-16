import type { PayloadRequest } from 'payload'
import { describe, expect, it } from 'vitest'

import { adminsOrSelf, hasRole, isAdminUser, isStaffUser, publishedOrStaff } from '@/payload/access'

const req = (user: unknown) =>
  ({ req: { user } as unknown as PayloadRequest }) as Parameters<typeof publishedOrStaff>[0]

describe('access rules', () => {
  const admin = { id: 1, roles: ['admin'] }
  const editor = { id: 2, roles: ['editor'] }

  it('recognises roles', () => {
    expect(hasRole(admin as never, ['admin'])).toBe(true)
    expect(isAdminUser(editor as never)).toBe(false)
    expect(isStaffUser(editor as never)).toBe(true)
    expect(isStaffUser(null)).toBe(false)
  })

  it('shows drafts to staff and only published articles to the public', () => {
    expect(publishedOrStaff(req(editor))).toBe(true)
    expect(publishedOrStaff(req(null))).toEqual({ _status: { equals: 'published' } })
  })

  it('lets editors read only their own user record', () => {
    expect(adminsOrSelf(req(admin))).toBe(true)
    expect(adminsOrSelf(req(editor))).toEqual({ id: { equals: 2 } })
    expect(adminsOrSelf(req(null))).toBe(false)
  })
})
