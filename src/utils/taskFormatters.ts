import type { EstadoTarea, PrioridadTarea } from '../types'

export function obtenerTextoEstado(estado: EstadoTarea) {
  switch (estado) {
    case 'pendiente':
      return 'Pendiente'
    case 'en_progreso':
      return 'En progreso'
    case 'completada':
      return 'Completada'
    case 'bloqueada':
      return 'Bloqueada'
    default:
      return estado
  }
}

export function obtenerVarianteEstado(estado: EstadoTarea) {
  switch (estado) {
    case 'pendiente':
      return 'warning' as const
    case 'en_progreso':
      return 'info' as const
    case 'completada':
      return 'success' as const
    case 'bloqueada':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

export function obtenerTextoPrioridad(prioridad: PrioridadTarea) {
  switch (prioridad) {
    case 'alta':
      return 'Alta'
    case 'media':
      return 'Media'
    case 'baja':
      return 'Baja'
    default:
      return prioridad
  }
}

export function obtenerVariantePrioridad(prioridad: PrioridadTarea) {
  switch (prioridad) {
    case 'alta':
      return 'danger' as const
    case 'media':
      return 'warning' as const
    case 'baja':
      return 'info' as const
    default:
      return 'neutral' as const
  }
}

export function redondearHoras(valor: number) {
  return Math.round(valor * 100) / 100
}

export function formatearSegundos(segundos: number) {
  const horas = Math.floor(segundos / 3600)
  const minutos = Math.floor((segundos % 3600) / 60)
  const restantes = segundos % 60

  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(
    restantes,
  ).padStart(2, '0')}`
}