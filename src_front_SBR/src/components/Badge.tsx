import type { HTMLAttributes, ReactNode } from 'react'
import { BADGE, cx } from '../constants/colors'

type VarianteBadge =
  | 'brand'
  | 'dark'
  | 'neutral'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode
  variante?: VarianteBadge
}

function obtenerClaseVariante(variante: VarianteBadge) {
  switch (variante) {
    case 'brand':
      return BADGE.BRAND
    case 'dark':
      return BADGE.DARK
    case 'neutral':
      return BADGE.NEUTRAL
    case 'success':
      return BADGE.SUCCESS
    case 'warning':
      return BADGE.WARNING
    case 'danger':
      return BADGE.DANGER
    case 'info':
      return BADGE.INFO
    default:
      return BADGE.NEUTRAL
  }
}

export function Badge({
  children,
  variante = 'neutral',
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cx(
        BADGE.BASE,
        obtenerClaseVariante(variante),
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}