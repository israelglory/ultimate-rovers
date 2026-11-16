import type { SVGProps } from 'react'

type IconProps = Omit<SVGProps<SVGSVGElement>, 'children'> & { size?: number }

function base({ size = 20, ...rest }: IconProps, strokeWidth = 1.8): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth,
    'aria-hidden': true,
    focusable: false,
    ...rest,
  }
}

export const InstagramIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.8" />
  </svg>
)

export const XIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p }, 2)}>
    <path d="M4 4l16 16M20 4L4 20" />
  </svg>
)

export const YouTubeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="2" y="5" width="20" height="14" rx="4" />
    <path d="M10 9l5 3-5 3z" />
  </svg>
)

export const TikTokIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
    <path d="M14 3c.5 2.5 2.5 4.5 5 4.5" />
  </svg>
)

export const FacebookIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M15 3h-2a4 4 0 0 0-4 4v3H7v4h2v7h4v-7h3l1-4h-4V7.5a.5.5 0 0 1 .5-.5H15z" />
  </svg>
)

export const CalendarIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p })}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const CalendarAddIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p })}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5" />
  </svg>
)

export const MenuIcon = (p: IconProps) => (
  <svg {...base({ size: 22, ...p }, 2)}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
)

export const CloseIcon = (p: IconProps) => (
  <svg {...base({ size: 22, ...p }, 2)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p }, 2)}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base({ size: 18, ...p }, 2)}>
    <path d="M9 6l6 6-6 6" />
  </svg>
)

export const ImageIcon = (p: IconProps) => (
  <svg {...base({ size: 28, ...p })}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="2" />
    <path d="M21 16l-5-5-8 9" />
  </svg>
)

export const DocumentIcon = (p: IconProps) => (
  <svg {...base({ size: 22, ...p })}>
    <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
    <path d="M14 3v6h6" />
  </svg>
)

export const TrophyIcon = (p: IconProps) => (
  <svg {...base({ size: 36, ...p }, 1.6)}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
  </svg>
)

export const PinIcon = (p: IconProps) => (
  <svg {...base({ size: 40, ...p })}>
    <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
)

export const CheckCircleIcon = (p: IconProps) => (
  <svg {...base({ size: 40, ...p }, 2)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M7.5 12.5l3 3 6-6.5" />
  </svg>
)

export const PlayIcon = ({ size = 30, ...rest }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable={false}
    {...rest}
  >
    <path d="M8 5v14l11-7z" />
  </svg>
)
