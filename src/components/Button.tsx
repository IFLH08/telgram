import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { BUTTON, cx } from '../constants/colors'

type VarianteBoton =
  | 'primario'
  | 'secundario'
  | 'terciario'
  | 'oscuro'
  | 'exito'
  | 'advertencia'
  | 'peligro'
  | 'ghost'
  | 'link'

type TamanoBoton = 'sm' | 'md' | 'lg'

interface BotonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variante?: VarianteBoton
  tamano?: TamanoBoton
  iconoIzquierdo?: ReactNode
  iconoDerecho?: ReactNode
  anchoCompleto?: boolean
}

interface BotonIconoProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icono: ReactNode
  label: string
  variante?: Exclude<VarianteBoton, 'link'>
}

function obtenerClaseVariante(variante: VarianteBoton) {
  switch (variante) {
    case 'primario':
      return BUTTON.PRIMARY
    case 'secundario':
      return BUTTON.SECONDARY
    case 'terciario':
      return BUTTON.TERTIARY
    case 'oscuro':
      return BUTTON.DARK
    case 'exito':
      return BUTTON.SUCCESS
    case 'advertencia':
      return BUTTON.WARNING
    case 'peligro':
      return BUTTON.DANGER
    case 'ghost':
      return BUTTON.GHOST
    case 'link':
      return BUTTON.LINK
    default:
      return BUTTON.PRIMARY
  }
}

function obtenerClaseTamano(tamano: TamanoBoton) {
  switch (tamano) {
    case 'sm':
      return BUTTON.SM
    case 'md':
      return BUTTON.MD
    case 'lg':
      return BUTTON.LG
    default:
      return BUTTON.MD
  }
}

export function Boton({
  children,
  variante = 'primario',
  tamano = 'md',
  iconoIzquierdo,
  iconoDerecho,
  anchoCompleto = false,
  className,
  type = 'button',
  ...props
}: BotonProps) {
  return (
    <button
      type={type}
      className={cx(
        BUTTON.BASE,
        obtenerClaseVariante(variante),
        variante !== 'link' && obtenerClaseTamano(tamano),
        anchoCompleto && 'w-full',
        className
      )}
      {...props}
    >
      {iconoIzquierdo}
      {children}
      {iconoDerecho}
    </button>
  )
}

export function BotonIcono({
  icono,
  label,
  variante = 'secundario',
  className,
  type = 'button',
  ...props
}: BotonIconoProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        BUTTON.BASE,
        BUTTON.ICON,
        obtenerClaseVariante(variante),
        className
      )}
      {...props}
    >
      {icono}
    </button>
  )
}

export function BotonIconoPequeno({
  icono,
  label,
  variante = 'secundario',
  className,
  type = 'button',
  ...props
}: BotonIconoProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cx(
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border transition',
        variante === 'primario' && 'bg-[#C74634] text-white hover:bg-[#A93B2C] border-transparent',
        variante === 'secundario' && 'border-gray-200 bg-white text-[#312D2A] hover:bg-gray-50',
        variante === 'terciario' && 'border-transparent bg-transparent text-[#312D2A] hover:bg-gray-50',
        variante === 'oscuro' && 'border-transparent bg-[#312D2A] text-white hover:bg-[#262220]',
        variante === 'exito' && 'border-transparent bg-[#12B76A] text-white hover:bg-[#039855]',
        variante === 'advertencia' && 'border-transparent bg-[#F79009] text-white hover:bg-[#DC6803]',
        variante === 'peligro' && 'border-transparent bg-[#F04438] text-white hover:bg-[#D92D20]',
        variante === 'ghost' && 'border-transparent bg-transparent text-[#C74634] hover:bg-[#F9EEEB]',
        className
      )}
      {...props}
    >
      {icono}
    </button>
  )
}