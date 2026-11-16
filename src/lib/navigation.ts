export type NavItem = { href: string; label: string }

export const mainNav: readonly NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/fixtures', label: 'Fixtures & results' },
  { href: '/squad', label: 'Squad' },
  { href: '/news', label: 'News' },
  { href: '/club', label: 'The club' },
  { href: '/club/stakeholders', label: 'Stakeholders' },
  { href: '/contact', label: 'Contact' },
]

/** Sections that belong to a nav item without sharing its path prefix. */
const aliases: Record<string, readonly string[]> = {
  '/fixtures': ['/matches'],
}

/**
 * Whether a nav item is the current section. Home only matches exactly, and
 * "The club" does not light up on its Stakeholders child, which has its own item.
 */
export function isNavActive(href: string, pathname: string): boolean {
  const path = pathname.replace(/\/+$/, '') || '/'
  if (href === '/') return path === '/'
  const prefixes = [href, ...(aliases[href] ?? [])]
  const matches = prefixes.some((p) => path === p || path.startsWith(`${p}/`))
  if (!matches) return false
  // A more specific nav item wins, e.g. /club/stakeholders over /club.
  return !mainNav.some(
    (item) =>
      item.href !== href &&
      item.href.startsWith(`${href}/`) &&
      (path === item.href || path.startsWith(`${item.href}/`)),
  )
}

export const footerClubLinks: readonly NavItem[] = [
  { href: '/club', label: 'About us' },
  { href: '/club/stakeholders', label: 'Stakeholders' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
]

export const footerMatchdayLinks: readonly NavItem[] = [
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/fixtures?view=results', label: 'Results' },
  { href: '/fixtures?view=table', label: 'League table' },
  { href: '/squad', label: 'Squad' },
]

/** Compact two-column footer on phones, in the order drawn in MobileHome.dc.html. */
export const footerMobileLinks: readonly NavItem[] = [
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/club', label: 'About us' },
  { href: '/squad', label: 'Squad' },
  { href: '/club/stakeholders', label: 'Stakeholders' },
  { href: '/news', label: 'News' },
  { href: '/contact', label: 'Contact' },
]

export const legalLinks: readonly NavItem[] = [
  { href: '/privacy', label: 'Privacy policy' },
  { href: '/terms', label: 'Terms of use' },
  { href: '/cookies', label: 'Cookie settings' },
]
