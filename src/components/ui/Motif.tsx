import { cn } from '@/lib/cn'

/**
 * The centre circle and halfway line, the only decoration in the system (DESIGN_SPEC section 2).
 * Drawn in cyan at about 35% opacity. Purely decorative, hidden from assistive tech.
 */
type Variant = 'page' | 'home' | 'match' | 'about' | 'mobile'

export function Motif({ variant, className }: { variant: Variant; className?: string }) {
  const common = { 'aria-hidden': true, focusable: false } as const
  switch (variant) {
    case 'home':
      return (
        <svg {...common} viewBox="0 0 460 460" className={className}>
          <circle
            cx="230"
            cy="230"
            r="200"
            fill="none"
            className="stroke-cyan"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <circle cx="230" cy="230" r="5" className="fill-cyan" fillOpacity="0.5" />
          <line
            x1="0"
            y1="230"
            x2="460"
            y2="230"
            className="stroke-cyan"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
        </svg>
      )
    case 'mobile':
      return (
        <svg {...common} viewBox="0 0 300 300" className={className}>
          <circle
            cx="150"
            cy="150"
            r="130"
            fill="none"
            className="stroke-cyan"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
          <line
            x1="0"
            y1="150"
            x2="300"
            y2="150"
            className="stroke-cyan"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
        </svg>
      )
    case 'match':
      return (
        <svg {...common} viewBox="0 0 800 400" className={cn('opacity-30', className)}>
          <circle cx="400" cy="200" r="170" fill="none" className="stroke-cyan" strokeWidth="2" />
          <line x1="400" y1="0" x2="400" y2="400" className="stroke-cyan" strokeWidth="2" />
        </svg>
      )
    case 'about':
      return (
        <svg {...common} viewBox="0 0 340 340" className={className}>
          <circle
            cx="170"
            cy="170"
            r="160"
            fill="none"
            className="stroke-cyan"
            strokeOpacity="0.35"
            strokeWidth="2"
          />
        </svg>
      )
    case 'page':
    default:
      return (
        <svg {...common} viewBox="0 0 600 300" className={cn('opacity-35', className)}>
          <circle cx="300" cy="150" r="140" fill="none" className="stroke-cyan" strokeWidth="2" />
          <line x1="300" y1="0" x2="300" y2="300" className="stroke-cyan" strokeWidth="2" />
        </svg>
      )
  }
}
