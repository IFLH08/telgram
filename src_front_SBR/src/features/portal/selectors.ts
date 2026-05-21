import type { Usuario } from '../../types'
import type {
  PortalAlertItem,
  DashboardPeriod,
  EstadoTareaPortal,
  PortalNotification,
  PortalProject,
  PortalSprint,
  PortalTask,
  PortalTaskWorkSession,
  ProjectFilters,
  ProjectMembership,
  TaskFilters,
} from './types'

function normalizarTexto(valor: string) {
  return valor.trim().toLowerCase()
}

function obtenerFechaLocal(valor: string | undefined) {
  if (!valor) {
    return null
  }

  if (valor.includes('T')) {
    return new Date(valor)
  }

  return new Date(`${valor}T00:00:00`)
}

export function formatearFechaHoraCorta(valor: string) {
  const fecha = obtenerFechaLocal(valor)

  if (!fecha) {
    return 'Sin fecha'
  }

  return fecha.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function esAdminPortal(usuario: Usuario | null | undefined) {
  return usuario?.rol === 'admin'
}

export function obtenerProyectosVisibles(
  usuario: Usuario | null | undefined,
  projects: PortalProject[],
  memberships: ProjectMembership[],
  tasks: PortalTask[],
) {
  if (!usuario) {
    return []
  }

  if (esAdminPortal(usuario)) {
    return projects
  }

  const projectIds = new Set(
    memberships
      .filter((membership) => membership.usuarioId === usuario.id)
      .map((membership) => membership.proyectoId),
  )

  tasks
    .filter((task) => task.personaAsignadaId === usuario.id)
    .forEach((task) => projectIds.add(task.proyectoId))

  return projects.filter((project) => projectIds.has(project.id))
}

export function obtenerTareasVisibles(
  usuario: Usuario | null | undefined,
  tasks: PortalTask[],
  memberships: ProjectMembership[],
  projects: PortalProject[],
) {
  if (!usuario) {
    return []
  }

  if (esAdminPortal(usuario)) {
    return tasks
  }

  const projectIds = new Set(
    obtenerProyectosVisibles(usuario, projects, memberships, tasks).map(
      (project) => project.id,
    ),
  )

  return tasks.filter(
    (task) =>
      task.personaAsignadaId === usuario.id && projectIds.has(task.proyectoId),
  )
}

export function obtenerSprintsVisibles(
  usuario: Usuario | null | undefined,
  sprints: PortalSprint[],
  projects: PortalProject[],
  memberships: ProjectMembership[],
  tasks: PortalTask[],
) {
  const visibleProjects = new Set(
    obtenerProyectosVisibles(usuario, projects, memberships, tasks).map(
      (project) => project.id,
    ),
  )

  return sprints.filter((sprint) => visibleProjects.has(sprint.proyectoId))
}

export function filtrarTareasPortal(tasks: PortalTask[], filters: TaskFilters) {
  return tasks.filter((task) => {
    const termino = normalizarTexto(filters.busqueda)
    const coincideBusqueda =
      !termino ||
      normalizarTexto(task.nombre).includes(termino) ||
      normalizarTexto(task.descripcion).includes(termino) ||
      normalizarTexto(task.personaAsignadaNombre).includes(termino) ||
      normalizarTexto(task.proyectoNombre).includes(termino) ||
      normalizarTexto(task.sprintNombre).includes(termino)

    const coincideEstatus =
      filters.estatus === 'todos' || task.estatus === filters.estatus
    const coincidePrioridad =
      filters.prioridad === 'todas' || task.prioridad === filters.prioridad
    const coincideProyecto =
      filters.proyectoId === 'todos' || task.proyectoId === filters.proyectoId
    const coincideSprint =
      filters.sprintId === 'todos' || task.sprintId === filters.sprintId

    return (
      coincideBusqueda &&
      coincideEstatus &&
      coincidePrioridad &&
      coincideProyecto &&
      coincideSprint
    )
  })
}

export function filtrarProjectsPortal(
  projects: PortalProject[],
  filters: ProjectFilters,
) {
  return projects.filter((project) => {
    const termino = normalizarTexto(filters.busqueda)

    return (
      !termino ||
      normalizarTexto(project.nombre).includes(termino) ||
      normalizarTexto(project.descripcion).includes(termino) ||
      normalizarTexto(project.codigoAcceso).includes(termino)
    )
  })
}

export function filtrarTareasPorPeriodo(
  tasks: PortalTask[],
  period: DashboardPeriod,
) {
  if (period === 'sprint') {
    return tasks.filter((task) => task.sprintEsActual)
  }

  const days = Number(period.replace('d', ''))
  const limite = new Date()
  limite.setDate(limite.getDate() - days)

  return tasks.filter((task) => new Date(task.fechaCreacion) >= limite)
}

function construirEtiquetaSprint(task: PortalTask) {
  return `${task.proyectoNombre} · ${task.sprintNombre}`
}

function obtenerMetaNotificacion(notification: PortalNotification): Pick<
  PortalAlertItem,
  'categoria' | 'tipo' | 'titulo'
> {
  const mensajeNormalizado = notification.mensaje.toLowerCase()

  if (mensajeNormalizado.includes('proxima a vencer')) {
    return {
      categoria: 'vencimiento',
      tipo: 'alerta',
      titulo: 'Entrega cercana',
    }
  }

  switch (notification.tipo) {
    case 'asignacion':
      return {
        categoria: 'nueva_tarea',
        tipo: 'success',
        titulo: 'Nueva tarea asignada',
      }
    case 'reasignacion':
      return {
        categoria: 'nueva_tarea',
        tipo: 'info',
        titulo: 'Tarea reasignada',
      }
    case 'cambio_estado':
      return {
        categoria: 'cambio_estado',
        tipo: 'info',
        titulo: 'Cambio de estado',
      }
    default:
      return {
        categoria: 'nueva_tarea',
        tipo: 'info',
        titulo: 'Actualizacion',
      }
  }
}

export function calcularKpisDashboard(tasks: PortalTask[]) {
  const totalTareas = tasks.length
  const completadas = tasks.filter((task) => task.estatus === 'completada').length
  const porcentajeCompletadas = totalTareas
    ? Number(((completadas * 100) / totalTareas).toFixed(2))
    : 0

  const estados: EstadoTareaPortal[] = [
    'pendiente',
    'en_progreso',
    'cancelada',
    'completada',
  ]

  const tareasPorEstado = estados
    .map((estado) => ({
      id: estado,
      estado,
      etiqueta: obtenerTextoEstatusTask(estado),
      total: tasks.filter((task) => task.estatus === estado).length,
    }))
    .sort((left, right) => right.total - left.total)

  const acumuladoSprint = new Map<
    string,
    { etiqueta: string; total: number; completadas: number }
  >()

  tasks.forEach((task) => {
    const actual = acumuladoSprint.get(task.sprintId) ?? {
      etiqueta: construirEtiquetaSprint(task),
      total: 0,
      completadas: 0,
    }

    actual.total += 1

    if (task.estatus === 'completada') {
      actual.completadas += 1
    }

    acumuladoSprint.set(task.sprintId, actual)
  })

  const tareasPorSprint = Array.from(acumuladoSprint.entries())
    .map(([id, value]) => ({
      id,
      etiqueta: value.etiqueta,
      total: value.total,
    }))
    .sort((left, right) => left.etiqueta.localeCompare(right.etiqueta))

  const completadasPorSprint = Array.from(acumuladoSprint.entries())
    .map(([id, value]) => ({
      id,
      etiqueta: value.etiqueta,
      total: value.completadas,
    }))
    .sort((left, right) => left.etiqueta.localeCompare(right.etiqueta))

  return {
    totalTareas,
    porcentajeCompletadas,
    tareasPorEstado,
    tareasPorSprint,
    completadasPorSprint,
  }
}

export function calcularMetricasPersonales(tasks: PortalTask[]) {
  const total = tasks.length
  const proximasAVencer = tasks.filter((task) =>
    estaPorVencer(task.fechaEntrega, 3),
  ).length

  return {
    total,
    pendientes: tasks.filter((task) => task.estatus === 'pendiente').length,
    enProgreso: tasks.filter((task) => task.estatus === 'en_progreso').length,
    completadas: tasks.filter((task) => task.estatus === 'completada').length,
    proximasAVencer,
  }
}

export function calcularResumenProyecto(
  project: PortalProject,
  tasks: PortalTask[],
  sprints: PortalSprint[],
) {
  const tareasProyecto = tasks.filter((task) => task.proyectoId === project.id)
  const sprintsProyecto = sprints.filter((sprint) => sprint.proyectoId === project.id)
  const completadas = tareasProyecto.filter((task) => task.estatus === 'completada').length
  const pendientes = tareasProyecto.filter((task) => task.estatus === 'pendiente').length
  const enProgreso = tareasProyecto.filter((task) => task.estatus === 'en_progreso').length
  const progreso = tareasProyecto.length
    ? Math.round((completadas / tareasProyecto.length) * 100)
    : 0

  return {
    ...project,
    totalTareas: tareasProyecto.length,
    tareasCompletadas: completadas,
    tareasPendientes: pendientes,
    tareasEnProgreso: enProgreso,
    totalSprints: sprintsProyecto.length,
    progreso,
  }
}

export function obtenerSprintsDisponibles(tasks: PortalTask[]) {
  const acumulado = new Map<string, { id: string; nombre: string; etiqueta: string }>()

  tasks.forEach((task) => {
    if (!acumulado.has(task.sprintId)) {
      acumulado.set(task.sprintId, {
        id: task.sprintId,
        nombre: task.sprintNombre,
        etiqueta: construirEtiquetaSprint(task),
      })
    }
  })

  return Array.from(acumulado.values()).sort((left, right) =>
    left.etiqueta.localeCompare(right.etiqueta),
  )
}

export function obtenerSprintsDeProyecto(
  sprints: PortalSprint[],
  projectId: string,
) {
  return sprints
    .filter((sprint) => sprint.proyectoId === projectId)
    .sort((left, right) => left.nombre.localeCompare(right.nombre))
}

export function obtenerNotificacionesUsuario(
  usuario: Usuario | null | undefined,
  notifications: PortalNotification[],
  tasks: PortalTask[],
): PortalAlertItem[] {
  if (!usuario) {
    return []
  }

  const notificationsRelevantes = esAdminPortal(usuario)
    ? notifications
    : notifications.filter((notification) => notification.usuarioId === usuario.id)

  const mensajesPersistidos = notificationsRelevantes.map((notification) => {
    const meta = obtenerMetaNotificacion(notification)

    return {
      id: notification.id,
      titulo: meta.titulo,
      mensaje: notification.mensaje,
      categoria: meta.categoria,
      tipo: meta.tipo,
      fecha: notification.fechaEnvio,
      tareaId: notification.tareaId,
    }
  })

  const tareasRelevantes = esAdminPortal(usuario)
    ? tasks
    : tasks.filter((task) => task.personaAsignadaId === usuario.id)

  const alertasVencimiento = tareasRelevantes
    .filter(
      (task) =>
        task.estatus !== 'completada' &&
        task.estatus !== 'cancelada' &&
        estaPorVencer(task.fechaEntrega, 3),
    )
    .map((task) => ({
      id: `alerta-${task.id}`,
      titulo: 'Entrega cercana',
      mensaje: `${task.nombre} vence el ${formatearFecha(task.fechaEntrega)}.`,
      categoria: 'vencimiento' as const,
      tipo: 'alerta' as const,
      fecha: task.fechaEntrega,
      tareaId: task.id,
    }))

  const alertasTimerActivo = tareasRelevantes
    .filter((task) => Boolean(obtenerSesionActivaTask(task)))
    .map((task) => ({
      id: `timer-${task.id}`,
      titulo: 'Timer activo',
      mensaje: esAdminPortal(usuario)
        ? `${task.personaAsignadaNombre} tiene una sesion activa en ${task.nombre}.`
        : `Tu timer esta corriendo en ${task.nombre}.`,
      categoria: 'timer_activo' as const,
      tipo: 'success' as const,
      fecha: task.actualizadoEn,
      tareaId: task.id,
    }))

  return [...alertasTimerActivo, ...mensajesPersistidos, ...alertasVencimiento]
    .sort((left, right) => right.fecha.localeCompare(left.fecha))
    .slice(0, 8)
}

export function estaPorVencer(fechaEntrega: string, days = 3) {
  const fecha = obtenerFechaLocal(fechaEntrega)

  if (!fecha) {
    return false
  }

  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)

  const limite = new Date(hoy)
  limite.setDate(limite.getDate() + days)

  return fecha >= hoy && fecha <= limite
}

export function formatearFecha(valor: string) {
  const fecha = obtenerFechaLocal(valor)

  if (!fecha) {
    return 'Sin fecha'
  }

  return fecha.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function obtenerSesionActivaTask(task: PortalTask) {
  return task.sesionesTrabajo.find((sesion) => !sesion.finalizadaEn) ?? null
}

export function calcularSegundosRegistradosTask(
  task: PortalTask,
  includeActive = false,
  now = new Date(),
) {
  return task.sesionesTrabajo.reduce((total, sesion) => {
    if (sesion.finalizadaEn) {
      return total + sesion.duracionSegundos
    }

    if (includeActive) {
      return total + Math.max(0, Math.round((now.getTime() - new Date(sesion.iniciadaEn).getTime()) / 1000))
    }

    return total
  }, 0)
}

export function formatearDuracionSegundos(segundos: number) {
  const segundosNormalizados = Math.max(0, Math.floor(segundos))
  const horas = Math.floor(segundosNormalizados / 3600)
  const minutos = Math.floor((segundosNormalizados % 3600) / 60)
  const segundosRestantes = segundosNormalizados % 60

  return [horas, minutos, segundosRestantes]
    .map((valor) => String(valor).padStart(2, '0'))
    .join(':')
}

export function formatearMomentoSesion(sesion: PortalTaskWorkSession) {
  const inicio = formatearFechaHoraCorta(sesion.iniciadaEn)
  const fin = sesion.finalizadaEn ? formatearFechaHoraCorta(sesion.finalizadaEn) : 'En curso'

  return `${inicio} → ${fin}`
}

export function formatearTiempoRestanteEntrega(fechaEntrega: string, now = new Date()) {
  const fecha = obtenerFechaLocal(fechaEntrega)

  if (!fecha) {
    return 'Sin fecha limite'
  }

  const finDelDia = new Date(fecha)
  finDelDia.setHours(23, 59, 59, 999)

  const diferenciaMs = finDelDia.getTime() - now.getTime()

  if (diferenciaMs < 0) {
    return 'Fecha vencida'
  }

  const horas = Math.ceil(diferenciaMs / (1000 * 60 * 60))

  if (horas <= 24) {
    return `Quedan ${horas} h`
  }

  const dias = Math.ceil(horas / 24)
  return dias === 1 ? 'Queda 1 dia' : `Quedan ${dias} dias`
}

export function obtenerTextoEstatusTask(status: EstadoTareaPortal) {
  switch (status) {
    case 'pendiente':
      return 'Pendiente'
    case 'en_progreso':
      return 'En progreso'
    case 'completada':
      return 'Completada'
    case 'cancelada':
      return 'Cancelada'
    default:
      return status
  }
}

export function obtenerVarianteEstatusTask(status: EstadoTareaPortal) {
  switch (status) {
    case 'pendiente':
      return 'warning' as const
    case 'en_progreso':
      return 'info' as const
    case 'completada':
      return 'success' as const
    case 'cancelada':
      return 'danger' as const
    default:
      return 'neutral' as const
  }
}

export function obtenerTextoPrioridadTask(priority: PortalTask['prioridad']) {
  switch (priority) {
    case 'alta':
      return 'Alta'
    case 'media':
      return 'Media'
    case 'baja':
      return 'Baja'
    default:
      return priority
  }
}

export function obtenerVariantePrioridadTask(priority: PortalTask['prioridad']) {
  switch (priority) {
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
