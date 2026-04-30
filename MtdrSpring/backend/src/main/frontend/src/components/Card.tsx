import type { HTMLAttributes, ReactNode } from 'react'
import { CARD_BASE, SURFACE, TYPO, cx } from '../constants/colors'

type VarianteCard = 'default' | 'hover' | 'muted'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variante?: VarianteCard
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

function obtenerClaseVariante(variante: VarianteCard) {
  switch (variante) {
    case 'default':
      return SURFACE.CARD
    case 'hover':
      return SURFACE.CARD_HOVER
    case 'muted':
      return SURFACE.CARD_MUTED
    default:
      return CARD_BASE
  }
}

function obtenerClasePadding(padding: CardProps['padding']) {
  switch (padding) {
    case 'none':
      return ''
    case 'sm':
      return 'p-4'
    case 'md':
      return 'p-5'
    case 'lg':
      return 'p-6'
    default:
      return 'p-5'
  }
}

export function Card({
  children,
  variante = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cx(
        obtenerClaseVariante(variante),
        obtenerClasePadding(padding),
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({
  children,
  className,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cx('mb-4 space-y-1', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({
  children,
  className,
  ...props
}: CardTitleProps) {
  return (
    <h3 className={cx(TYPO.H3, className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({
  children,
  className,
  ...props
}: CardDescriptionProps) {
  return (
    <p className={cx(TYPO.BODY_MUTED, className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({
  children,
  className,
  ...props
}: CardContentProps) {
  return (
    <div className={cx(className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({
  children,
  className,
  ...props
}: CardFooterProps) {
  return (
    <div
      className={cx('mt-4 flex items-center justify-between gap-3', className)}
      {...props}
    >
      {children}
    </div>
  )
}