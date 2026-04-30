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
        'inline-flex h-9 w-9 items-center justify-center rounded-[4px] border transition',
        variante === 'primario' && 'border-[#33553C] bg-[#33553C] text-white hover:bg-[#2B4732]',
        variante === 'secundario' && 'border-[#D3CDC5] bg-white text-[#161513] hover:bg-[#FBFAF8] hover:text-[#33553C]',
        variante === 'terciario' && 'border-transparent bg-transparent text-[#161513] hover:bg-[#FBFAF8] hover:text-[#33553C]',
        variante === 'oscuro' && 'border-[#161513] bg-[#161513] text-white hover:bg-[#2B2A27]',
        variante === 'exito' && 'border-[#33553C] bg-[#33553C] text-white hover:bg-[#2B4732]',
        variante === 'advertencia' && 'border-[#F0CC71] bg-[#F0CC71] text-[#161513] hover:bg-[#CAA94B]',
        variante === 'peligro' && 'border-[#C15B52] bg-[#C15B52] text-white hover:bg-[#A24A43]',
        variante === 'ghost' && 'border-transparent bg-transparent text-[#8C7126] hover:bg-[#FFF7DE] hover:text-[#33553C]',
        className
      )}
      {...props}
    >
      {icono}
    </button>
  )
}
