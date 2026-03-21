export type Pagina = 'dashboard' | 'tareas' | 'reportes' | 'proyectos'

export type ID = string

export interface ConTimestamps {
  creadoEn: string
  actualizadoEn: string
}

export interface PropsIconoSVG {
  className?: string
}

export type RolUsuario = 'admin' | 'manager' | 'developer'

export interface Usuario extends ConTimestamps {
  id: ID
  nombre: string
  apellido: string
  nombreCompleto: string
  correo: string
  rol: RolUsuario
  avatarUrl?: string
  iniciales?: string
  activo: boolean
}

export type EstadoTarea = 'pendiente' | 'en_progreso' | 'completada' | 'bloqueada'
export type PrioridadTarea = 'alta' | 'media' | 'baja'

export interface Tarea extends ConTimestamps {
  id: ID
  titulo: string
  subtitulo?: string
  descripcion?: string

  estado: EstadoTarea
  prioridad: PrioridadTarea

  categoria?: string

  responsableId?: ID
  responsableNombre?: string

  proyectoId?: ID
  proyectoNombre?: string

  fechaLimite?: string
  horasEstimadas?: number
  horasReales?: number

  origen?: 'manual' | 'ia' | 'importada'
}

export type EstadoProyecto = 'activo' | 'pausado' | 'completado' | 'archivado'

export interface Proyecto extends ConTimestamps {
  id: ID
  nombre: string
  descripcion?: string
  estado: EstadoProyecto
  responsableId?: ID
  responsableNombre?: string
}

export interface IndicadorKPI {
  id: ID
  etiqueta: string
  valor: string | number
  tendencia?: string
  direccionTendencia?: 'sube' | 'baja' | 'estable'
}

export interface ResumenReporte {
  id: ID
  titulo: string
  descripcion?: string
  periodo?: string
  generadoEn: string
}

export type TipoNotificacion = 'info' | 'success' | 'warning' | 'danger'

export interface Notificacion {
  id: ID
  titulo: string
  mensaje: string
  tipo: TipoNotificacion
  leida: boolean
  fechaHora: string
  irA?: Pagina
}

export interface RespuestaListaAPI<T> {
  data: T[]
  total: number
}

export interface RespuestaItemAPI<T> {
  data: T
}

export interface ParametrosPaginacion {
  pagina?: number
  tamanoPagina?: number
  busqueda?: string
}

export interface FiltrosTareas extends ParametrosPaginacion {
  estado?: EstadoTarea
  prioridad?: PrioridadTarea
  responsableId?: ID
  proyectoId?: ID
  categoria?: string
}