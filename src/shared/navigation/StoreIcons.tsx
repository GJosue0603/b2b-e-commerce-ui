import type { SVGProps } from 'react'

type StoreIconProps = Omit<SVGProps<SVGSVGElement>, 'children'>

const sharedIconProps: StoreIconProps = {
  'aria-hidden': true,
  fill: 'none',
  focusable: 'false',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 2,
  viewBox: '0 0 24 24',
}

export function AccountIcon(props: StoreIconProps) {
  return (
    <svg {...sharedIconProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  )
}

export function CartIcon(props: StoreIconProps) {
  return (
    <svg {...sharedIconProps} {...props}>
      <path d="M6 7h15l-2 8H8L6 3H3" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  )
}

export function MenuIcon(props: StoreIconProps) {
  return (
    <svg {...sharedIconProps} {...props}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function SearchIcon(props: StoreIconProps) {
  return (
    <svg {...sharedIconProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  )
}
