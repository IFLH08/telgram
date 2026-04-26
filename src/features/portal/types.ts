export type EstadoTareaPortal =
  | 'pendiente'
  | 'en_progreso'
  | 'cancelada'
  | 'completada'

export type PrioridadTareaPortal = 'alta' | 'media' | 'baja'

export type DashboardPeriod = '7d' | '15d' | '30d' | 'sprint'

export interface PortalProject {
  id: string
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  codigoAcceso: string
}

export interface PortalSprint {
  id: string
  nombre: string
  fechaInicio: string
  fechaFin: string
  proyectoId: string
  proyectoNombre: string
}

export interface PortalTask {
  id: string
  nombre: string
  descripcion: string
  fechaCreacion: string
  fechaEntrega: string
  horasEstimadas: number
  puntosHistoria: number
  estatus: EstadoTareaPortal
  sprintId: string
  sprintNombre: string
  sprintEsActual: boolean
  proyectoId: string
  proyectoNombre: string
  personaAsignadaId: string
  personaAsignadaNombre: string
  prioridad: PrioridadTareaPortal
  eliminada: boolean
  deletedById?: string
  fechaEliminacion?: string
  horasReales: number
  fechaInicioReal?: string
  fechaFinReal?: string
  sesionesTrabajo: PortalTaskWorkSession[]
  actualizadoEn: string
}

export interface PortalTaskWorkSession {
  id: string
  iniciadaEn: string
  finalizadaEn?: string
  duracionSegundos: number
  iniciadaPorUsuarioId: string
  iniciadaPorNombre: string
  finalizadaPorUsuarioId?: string
}

export type PortalNotificationKind =
  | 'asignacion'
  | 'reasignacion'
  | 'cambio_estado'

export interface PortalNotification {
  id: string
  usuarioId: string
  tareaId: string
  mensaje: string
  tipo: PortalNotificationKind
  fechaEnvio: string
  leida: boolean
}

export type PortalAlertCategory =
  | 'nueva_tarea'
  | 'vencimiento'
  | 'timer_activo'
  | 'cambio_estado'

export type PortalAlertTone = 'info' | 'alerta' | 'success'

export interface PortalAlertItem {
  id: string
  titulo: string
  mensaje: string
  categoria: PortalAlertCategory
  tipo: PortalAlertTone
  fecha: string
  tareaId?: string
}

export interface ProjectMembership {
  usuarioId: string
  proyectoId: string
  unidoEn: string
}

export interface PortalSnapshot {
  notifications: PortalNotification[]
  memberships: ProjectMembership[]
  projects: PortalProject[]
  sprints: PortalSprint[]
  tasks: PortalTask[]
}

export interface PortalTaskInput {
  nombre: string
  descripcion: string
  estatus: EstadoTareaPortal
  personaAsignadaId: string
  fechaEntrega: string
  horasEstimadas: number
  puntosHistoria: number
  prioridad: PrioridadTareaPortal
  sprintId: string
}

export interface PortalProjectInput {
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
}

export interface TaskFilters {
  busqueda: string
  estatus: 'todos' | EstadoTareaPortal
  prioridad: 'todas' | PrioridadTareaPortal
  proyectoId: 'todos' | string
  sprintId: 'todos' | string
}

export interface ProjectFilters {
  busqueda: string
}
