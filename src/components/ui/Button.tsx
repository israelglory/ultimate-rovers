import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/cn'

/**
 * Button variants from StyleGuide.dc.html and the page designs.
 * - primary-light: navy fill on light surfaces
 * - primary-dark: cyan fill on dark surfaces
 * - secondary: navy outline on light surfaces
 * - outline-dark: 2px white outline on dark surfaces
 * - ghost-dark: 1px border-dark outline on dark surfaces (Share, Sync calendar)
 * - muted-dark: 1px placeholder outline on navy panels (Match centre in the next match strip)
 * - outline-cyan: cyan outline on night (Visit partner)
 * - night: night fill on cyan panels (Join the club)
 */
export type ButtonVariant =
  | 'primary-light'
  | 'primary-dark'
  | 'secondary'
  | 'outline-dark'
  | 'ghost-dark'
  | 'muted-dark'
  | 'outline-cyan'
  | 'night'

export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  'primary-light': 'bg-navy font-bold text-white hover:bg-night hover:text-white',
  'primary-dark': 'bg-cyan font-bold text-night hover:bg-white hover:text-night',
  secondary: 'border border-navy bg-transparent font-bold text-navy hover:bg-navy hover:text-white',
  'outline-dark':
    'border-2 border-white bg-transparent font-bold text-white hover:bg-white hover:text-night',
  'ghost-dark':
    'border border-border-dark bg-transparent font-semibold text-white hover:border-cyan hover:text-white',
  'muted-dark':
    'border border-placeholder-on-dark bg-transparent font-bold text-white hover:border-cyan hover:text-white',
  'outline-cyan':
    'border border-cyan bg-transparent font-bold text-cyan hover:bg-cyan hover:text-night',
  night: 'bg-night font-bold text-white hover:bg-navy hover:text-white',
}

/** Font size per size. Height and padding defaults below can be replaced, never stacked. */
const sizes: Record<ButtonSize, { text: string; minH: string; px: string }> = {
  sm: { text: 'text-[14px]', minH: 'min-h-touch', px: 'px-4' },
  md: { text: 'text-[15px]', minH: 'min-h-12', px: 'px-[22px]' },
  lg: { text: 'text-[16px]', minH: 'min-h-[52px]', px: 'px-[26px]' },
}

export type ButtonStyleOptions = {
  variant?: ButtonVariant
  size?: ButtonSize
  /** Replaces the size's horizontal padding, for the few buttons drawn with other padding. */
  px?: string
  /** Replaces the size's min height. */
  minH?: string
  /** Layout only (margins, width). Must not set padding, height, colour or font size. */
  className?: string
}

export function buttonClass({
  variant = 'primary-light',
  size = 'md',
  px,
  minH,
  className,
}: ButtonStyleOptions): string {
  const s = sizes[size]
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-button no-underline transition-colors box-border disabled:cursor-not-allowed disabled:opacity-60',
    variants[variant],
    s.text,
    minH ?? s.minH,
    px ?? s.px,
    className,
  )
}

type CommonProps = Omit<ButtonStyleOptions, 'className'> & {
  className?: string
  children: ReactNode
}

export function ButtonLink({
  href,
  variant,
  size,
  px,
  minH,
  className,
  children,
  ...rest
}: CommonProps & Omit<ComponentProps<typeof Link>, 'className' | 'children'>) {
  const external = typeof href === 'string' && /^(https?:|mailto:|tel:)/.test(href)
  if (external) {
    return (
      <a
        href={href as string}
        className={buttonClass({ variant, size, px, minH, className })}
        {...(rest as ComponentProps<'a'>)}
      >
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={buttonClass({ variant, size, px, minH, className })} {...rest}>
      {children}
    </Link>
  )
}

export function Button({
  variant,
  size,
  px,
  minH,
  className,
  children,
  type = 'button',
  ...rest
}: CommonProps & Omit<ComponentProps<'button'>, 'className' | 'children'>) {
  return (
    <button type={type} className={buttonClass({ variant, size, px, minH, className })} {...rest}>
      {children}
    </button>
  )
}

/** Icon-only button. Always pass an aria-label. */
export function IconButton({
  className,
  children,
  type = 'button',
  ...rest
}: Omit<ComponentProps<'button'>, 'aria-label'> & { 'aria-label': string }) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex size-touch items-center justify-center rounded-button border border-line bg-white text-navy hover:border-navy',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
