import type { Access, FieldAccess, PayloadRequest } from 'payload'

export type Role = 'admin' | 'editor'

type MaybeUser = PayloadRequest['user'] | null | undefined

export const hasRole = (user: MaybeUser, roles: readonly Role[]): boolean => {
  if (!user || !('roles' in user) || !Array.isArray(user.roles)) return false
  return user.roles.some((role) => roles.includes(role as Role))
}

export const isAdminUser = (user: MaybeUser): boolean => hasRole(user, ['admin'])
export const isStaffUser = (user: MaybeUser): boolean => hasRole(user, ['admin', 'editor'])

/** Anyone, including anonymous visitors. */
export const anyone: Access = () => true

/** Nobody through the API. Server code uses the local API with overrideAccess. */
export const nobody: Access = () => false

export const admins: Access = ({ req }) => isAdminUser(req.user)

/** Admins and matchday editors. */
export const staff: Access = ({ req }) => isStaffUser(req.user)

export const adminsOrSelf: Access = ({ req }) => {
  if (isAdminUser(req.user)) return true
  if (!req.user) return false
  return { id: { equals: req.user.id } }
}

/** Public sees published documents only; staff see drafts too. For collections with drafts enabled. */
export const publishedOrStaff: Access = ({ req }) => {
  if (isStaffUser(req.user)) return true
  return { _status: { equals: 'published' } }
}

export const adminFieldAccess: FieldAccess = ({ req }) => isAdminUser(req.user)
