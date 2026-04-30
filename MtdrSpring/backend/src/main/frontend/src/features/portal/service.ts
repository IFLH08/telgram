import { usuariosMock } from '../../mocks/users.mock'
import type { Usuario } from '../../types'
import type {
  PortalNotification,
  PortalNotificationKind,
  PortalProject,
  PortalProjectInput,
  PortalSnapshot,
  PortalSprint,
  PortalTask,
  PortalTaskInput,
  PortalTaskWorkSession,
  ProjectMembership,
} from './types'

function sumarDias(fechaBase: Date, dias: number) {
  const fecha = new Date(fechaBase)
  fecha.setDate(fecha.getDate() + dias)
  return fecha
}

function formatoFecha(fecha: Date) {
  return fecha.toISOString().split('T')[0]
}

function formatoFechaHora(fecha: Date) {
  return fecha.toISOString()
}

function sumarHoras(fechaBase: Date, horas: number) {
  const fecha = new Date(fechaBase)
  fecha.setTime(fecha.getTime() + horas * 60 * 60 * 1000)
  return fecha
}

function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T
}

function siguienteId(prefijo: string) {
  return `${prefijo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function obtenerUsuarioPorId(usuarioId: string): Usuario | undefined {
  return usuariosMock.find((usuario) => usuario.id === usuarioId)
}

function obtenerUsuariosAdministradores() {
  return usuariosMock.filter((usuario) => usuario.rol === 'admin')
}

function generarCodigoProyecto(nombreProyecto: string) {
  const prefijo = nombreProyecto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte.slice(0, 3).toUpperCase())
    .join('')

  const sufijo = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `${prefijo}${sufijo}`
}

function calcularDuracionSegundos(inicioIso: string, finIso: string) {
  const inicio = new Date(inicioIso)
  const fin = new Date(finIso)
  const segundos = Math.round((fin.getTime() - inicio.getTime()) / 1000)
  return Math.max(0, segundos)
}

function calcularHorasReales(segundosTrabajados: number) {
  const horas = (segundosTrabajados / 3600).toFixed(2)
  return Math.max(0, Number(horas))
}

function ordenarSesionesTrabajo(sesiones: PortalTaskWorkSession[]) {
  return [...sesiones].sort((left, right) =>
    left.iniciadaEn.localeCompare(right.iniciadaEn),
  )
}

function calcularSegundosCerrados(sesiones: PortalTaskWorkSession[]) {
  return sesiones.reduce(
    (total, sesion) => total + (sesion.finalizadaEn ? sesion.duracionSegundos : 0),
    0,
  )
}

function obtenerSesionActiva(task: PortalTask) {
  return task.sesionesTrabajo.find((sesion) => !sesion.finalizadaEn)
}

function sincronizarTimeTracking(task: PortalTask): PortalTask {
  const sesionesTrabajo = ordenarSesionesTrabajo(task.sesionesTrabajo)
  const primeraSesion = sesionesTrabajo[0]
  const sesionesCerradas = sesionesTrabajo.filter((sesion) => sesion.finalizadaEn)
  const ultimaSesionCerrada = sesionesCerradas.at(-1)

  return {
    ...task,
    sesionesTrabajo,
    horasReales: calcularHorasReales(calcularSegundosCerrados(sesionesTrabajo)),
    fechaInicioReal: primeraSesion?.iniciadaEn,
    fechaFinReal:
      task.estatus === 'completada' ? ultimaSesionCerrada?.finalizadaEn : undefined,
  }
}

function crearSesionTrabajo({
  iniciadaEn,
  iniciadaPorNombre,
  iniciadaPorUsuarioId,
  finalizadaEn,
  finalizadaPorUsuarioId,
}: {
  iniciadaEn: string
  iniciadaPorNombre: string
  iniciadaPorUsuarioId: string
  finalizadaEn?: string
  finalizadaPorUsuarioId?: string
}): PortalTaskWorkSession {
  return {
    id: siguienteId('sesion'),
    iniciadaEn,
    finalizadaEn,
    duracionSegundos: finalizadaEn
      ? calcularDuracionSegundos(iniciadaEn, finalizadaEn)
      : 0,
    iniciadaPorUsuarioId,
    iniciadaPorNombre,
    finalizadaPorUsuarioId,
  }
}

function cerrarSesionActiva(
  task: PortalTask,
  ahoraActual: string,
  usuarioId: string,
): PortalTaskWorkSession[] {
  return task.sesionesTrabajo.map((sesion) =>
    sesion.finalizadaEn
      ? sesion
      : {
          ...sesion,
          finalizadaEn: ahoraActual,
          finalizadaPorUsuarioId: usuarioId,
          duracionSegundos: calcularDuracionSegundos(sesion.iniciadaEn, ahoraActual),
        },
  )
}

function esSprintActual(sprint: Pick<PortalSprint, 'fechaInicio' | 'fechaFin'>) {
  const hoy = new Date()
  const inicio = new Date(`${sprint.fechaInicio}T00:00:00`)
  const fin = new Date(`${sprint.fechaFin}T23:59:59`)
  return hoy >= inicio && hoy <= fin
}

function enriquecerTask(
  base: Omit<
    PortalTask,
    'personaAsignadaNombre' | 'proyectoNombre' | 'sprintNombre' | 'sprintEsActual'
  >,
  sprints: PortalSprint[],
): PortalTask {
  const sprint = sprints.find((item) => item.id === base.sprintId)
  const persona = obtenerUsuarioPorId(base.personaAsignadaId)

  if (!sprint || !persona) {
    throw new Error('La tarea no pudo asociarse con un sprint o usuario valido.')
  }

  return {
    ...base,
    personaAsignadaNombre: persona.nombreCompleto,
    proyectoId: sprint.proyectoId,
    proyectoNombre: sprint.proyectoNombre,
    sprintNombre: sprint.nombre,
    sprintEsActual: esSprintActual(sprint),
  }
}

function crearNotificacion({
  mensaje,
  tareaId,
  tipo,
  usuarioId,
}: {
  mensaje: string
  tareaId: string
  tipo: PortalNotificationKind
  usuarioId: string
}): PortalNotification {
  return {
    id: siguienteId('notificacion'),
    usuarioId,
    tareaId,
    mensaje,
    tipo,
    fechaEnvio: formatoFechaHora(new Date()),
    leida: false,
  }
}

function agregarNotificaciones(
  nuevasNotificaciones: PortalNotification[],
) {
  if (nuevasNotificaciones.length === 0) {
    return
  }

  notificationsDb = [...nuevasNotificaciones, ...notificationsDb]
}

function registrarCambioEstado(task: PortalTask, estatusAnterior: PortalTask['estatus']) {
  if (estatusAnterior === task.estatus) {
    return
  }

  const destinatarios = new Set<string>([
    task.personaAsignadaId,
    ...obtenerUsuariosAdministradores().map((usuario) => usuario.id),
  ])

  agregarNotificaciones(
    [...destinatarios].map((usuarioId) =>
      crearNotificacion({
        usuarioId,
        tareaId: task.id,
        tipo: 'cambio_estado',
        mensaje: `La tarea ${task.nombre} cambio a ${task.estatus.replace('_', ' ')}.`,
      }),
    ),
  )
}

function crearSprintInicial(project: PortalProject): PortalSprint {
  const fechaInicio = new Date(`${project.fechaInicio}T00:00:00`)
  const fechaFin = new Date(`${project.fechaFin}T00:00:00`)
  const fechaFinSprint = new Date(fechaInicio)
  fechaFinSprint.setDate(Math.min(fechaInicio.getDate() + 13, fechaFin.getDate()))

  return {
    id: siguienteId('sprint'),
    nombre: 'Sprint 1',
    fechaInicio: project.fechaInicio,
    fechaFin: formatoFecha(fechaFinSprint),
    proyectoId: project.id,
    proyectoNombre: project.nombre,
  }
}

const ahora = new Date()

const initialProjects: PortalProject[] = [
  {
    id: 'proyecto-gestion-tareas',
    nombre: 'Sistema de Gestion de Tareas',
    descripcion: 'Portal administrativo conectado a Telegram para gestionar trabajo.',
    fechaInicio: formatoFecha(sumarDias(ahora, -12)),
    fechaFin: formatoFecha(sumarDias(ahora, 30)),
    codigoAcceso: 'ABC12345',
  },
  {
    id: 'proyecto-chatbot',
    nombre: 'Integracion Telegram',
    descripcion: 'Comandos remotos para crear, editar y eliminar tareas desde el bot.',
    fechaInicio: formatoFecha(sumarDias(ahora, -9)),
    fechaFin: formatoFecha(sumarDias(ahora, 24)),
    codigoAcceso: 'TEL483KD',
  },
]

const initialSprints: PortalSprint[] = [
  {
    id: 'sprint-gestion-1',
    nombre: 'Sprint 1',
    fechaInicio: formatoFecha(sumarDias(ahora, -12)),
    fechaFin: formatoFecha(sumarDias(ahora, 2)),
    proyectoId: 'proyecto-gestion-tareas',
    proyectoNombre: 'Sistema de Gestion de Tareas',
  },
  {
    id: 'sprint-gestion-2',
    nombre: 'Sprint 2',
    fechaInicio: formatoFecha(sumarDias(ahora, 3)),
    fechaFin: formatoFecha(sumarDias(ahora, 16)),
    proyectoId: 'proyecto-gestion-tareas',
    proyectoNombre: 'Sistema de Gestion de Tareas',
  },
  {
    id: 'sprint-chatbot-1',
    nombre: 'Sprint 1',
    fechaInicio: formatoFecha(sumarDias(ahora, -9)),
    fechaFin: formatoFecha(sumarDias(ahora, 5)),
    proyectoId: 'proyecto-chatbot',
    proyectoNombre: 'Integracion Telegram',
  },
]

const initialMemberships: ProjectMembership[] = [
  {
    usuarioId: 'usuario-admin-jose',
    proyectoId: 'proyecto-gestion-tareas',
    unidoEn: formatoFechaHora(sumarDias(ahora, -12)),
  },
  {
    usuarioId: 'usuario-admin-jose',
    proyectoId: 'proyecto-chatbot',
    unidoEn: formatoFechaHora(sumarDias(ahora, -12)),
  },
  {
    usuarioId: 'usuario-dev-ian',
    proyectoId: 'proyecto-gestion-tareas',
    unidoEn: formatoFechaHora(sumarDias(ahora, -7)),
  },
  {
    usuarioId: 'usuario-dev-santiago',
    proyectoId: 'proyecto-gestion-tareas',
    unidoEn: formatoFechaHora(sumarDias(ahora, -8)),
  },
  {
    usuarioId: 'usuario-dev-jose-jesus',
    proyectoId: 'proyecto-chatbot',
    unidoEn: formatoFechaHora(sumarDias(ahora, -5)),
  },
]

const initialTasks: PortalTask[] = [
  sincronizarTimeTracking(
    enriquecerTask(
      {
        id: 'tarea-1',
        nombre: 'Diseñar base de datos',
        descripcion: 'Modelo relacional inicial alineado con Oracle Autonomous Database.',
        fechaCreacion: formatoFechaHora(sumarDias(ahora, -8)),
        fechaEntrega: formatoFecha(sumarDias(ahora, 3)),
        horasEstimadas: 10,
        puntosHistoria: 5,
        estatus: 'pendiente',
        sprintId: 'sprint-gestion-1',
        proyectoId: '',
        proyectoNombre: '',
        personaAsignadaId: 'usuario-dev-ian',
        personaAsignadaNombre: '',
        prioridad: 'alta',
        eliminada: false,
        horasReales: 0,
        sesionesTrabajo: [],
        actualizadoEn: formatoFechaHora(sumarDias(ahora, -2)),
      },
      initialSprints,
    ),
  ),
  sincronizarTimeTracking(
    enriquecerTask(
      {
        id: 'tarea-2',
        nombre: 'Implementar API REST',
        descripcion: 'Endpoints para tareas, proyectos y notificaciones.',
        fechaCreacion: formatoFechaHora(sumarDias(ahora, -7)),
        fechaEntrega: formatoFecha(sumarDias(ahora, 5)),
        horasEstimadas: 15,
        puntosHistoria: 8,
        estatus: 'en_progreso',
        sprintId: 'sprint-gestion-1',
        proyectoId: '',
        proyectoNombre: '',
        personaAsignadaId: 'usuario-dev-santiago',
        personaAsignadaNombre: '',
        prioridad: 'media',
        eliminada: false,
        horasReales: 0,
        sesionesTrabajo: [
          crearSesionTrabajo({
            iniciadaEn: formatoFechaHora(sumarDias(ahora, -3)),
            finalizadaEn: formatoFechaHora(sumarHoras(sumarDias(ahora, -3), 6)),
            iniciadaPorUsuarioId: 'usuario-dev-santiago',
            iniciadaPorNombre: 'Santiago Borbolla Regato',
            finalizadaPorUsuarioId: 'usuario-dev-santiago',
          }),
        ],
        actualizadoEn: formatoFechaHora(sumarDias(ahora, -1)),
      },
      initialSprints,
    ),
  ),
  sincronizarTimeTracking(
    enriquecerTask(
      {
        id: 'tarea-3',
        nombre: 'Integracion Telegram',
        descripcion: 'Conectar el bot con el sistema administrativo.',
        fechaCreacion: formatoFechaHora(sumarDias(ahora, -6)),
        fechaEntrega: formatoFecha(sumarDias(ahora, 2)),
        horasEstimadas: 12,
        puntosHistoria: 5,
        estatus: 'completada',
        sprintId: 'sprint-chatbot-1',
        proyectoId: '',
        proyectoNombre: '',
        personaAsignadaId: 'usuario-dev-jose-jesus',
        personaAsignadaNombre: '',
        prioridad: 'alta',
        eliminada: false,
        horasReales: 0,
        sesionesTrabajo: [
          crearSesionTrabajo({
            iniciadaEn: formatoFechaHora(sumarDias(ahora, -4)),
            finalizadaEn: formatoFechaHora(sumarHoras(sumarDias(ahora, -4), 11.5)),
            iniciadaPorUsuarioId: 'usuario-dev-jose-jesus',
            iniciadaPorNombre: 'Jose de Jesus Hernandez Vergara',
            finalizadaPorUsuarioId: 'usuario-dev-jose-jesus',
          }),
        ],
        actualizadoEn: formatoFechaHora(sumarDias(ahora, -1)),
      },
      initialSprints,
    ),
  ),
  sincronizarTimeTracking(
    enriquecerTask(
      {
        id: 'tarea-4',
        nombre: 'Panel de KPIs por sprint',
        descripcion: 'Mostrar total de tareas por estado y por sprint.',
        fechaCreacion: formatoFechaHora(sumarDias(ahora, -3)),
        fechaEntrega: formatoFecha(sumarDias(ahora, 9)),
        horasEstimadas: 8,
        puntosHistoria: 3,
        estatus: 'pendiente',
        sprintId: 'sprint-gestion-2',
        proyectoId: '',
        proyectoNombre: '',
        personaAsignadaId: 'usuario-dev-omar',
        personaAsignadaNombre: '',
        prioridad: 'media',
        eliminada: false,
        horasReales: 0,
        sesionesTrabajo: [],
        actualizadoEn: formatoFechaHora(sumarDias(ahora, -1)),
      },
      initialSprints,
    ),
  ),
  sincronizarTimeTracking(
    enriquecerTask(
      {
        id: 'tarea-5',
        nombre: 'Migrar tarea descartada',
        descripcion: 'Tarea eliminada logicamente para validar soft delete.',
        fechaCreacion: formatoFechaHora(sumarDias(ahora, -9)),
        fechaEntrega: formatoFecha(sumarDias(ahora, -2)),
        horasEstimadas: 4,
        puntosHistoria: 2,
        estatus: 'cancelada',
        sprintId: 'sprint-gestion-1',
        proyectoId: '',
        proyectoNombre: '',
        personaAsignadaId: 'usuario-dev-ian',
        personaAsignadaNombre: '',
        prioridad: 'baja',
        eliminada: true,
        deletedById: 'usuario-admin-jose',
        fechaEliminacion: formatoFechaHora(sumarDias(ahora, -4)),
        horasReales: 0,
        sesionesTrabajo: [],
        actualizadoEn: formatoFechaHora(sumarDias(ahora, -4)),
      },
      initialSprints,
    ),
  ),
]

const initialNotifications: PortalNotification[] = [
  {
    id: 'notificacion-1',
    usuarioId: 'usuario-dev-santiago',
    tareaId: 'tarea-2',
    mensaje: 'Se te ha asignado la tarea: Implementar API REST',
    tipo: 'asignacion',
    fechaEnvio: formatoFechaHora(sumarDias(ahora, -2)),
    leida: false,
  },
  {
    id: 'notificacion-2',
    usuarioId: 'usuario-dev-jose-jesus',
    tareaId: 'tarea-3',
    mensaje: 'La tarea Integracion Telegram esta proxima a vencer.',
    tipo: 'asignacion',
    fechaEnvio: formatoFechaHora(sumarDias(ahora, -1)),
    leida: false,
  },
]

let projectsDb = clonar(initialProjects)
let sprintsDb = clonar(initialSprints)
let tasksDb = clonar(initialTasks)
let notificationsDb = clonar(initialNotifications)
let membershipsDb = clonar(initialMemberships)

type ApiProyecto = {
  idProyecto: number
  nombre: string
  descripcion?: string
  fechaInicio?: string
  fechaFin?: string
  codigoAcceso?: string
}

type ApiSprint = {
  idSprint: number
  nombre: string
  fechaInicio?: string
  fechaFin?: string
  proyecto?: ApiProyecto
}

type ApiUsuario = {
  idUsuario: number
  nombre: string
}

type ApiEstadoTarea = {
  idEstado?: number
  nombreEstado: string
}

type ApiPrioridad = {
  idPrioridad?: number
  nombre: string
}

type ApiTarea = {
  idTarea: number
  nombre: string
  descripcion?: string
  fechaCreacion?: string
  fechaEntrega?: string
  horasEstimadas?: number
  horasReales?: number
  puntosHistoria?: number
  estado?: ApiEstadoTarea
  sprint?: ApiSprint
  usuarioAsignado?: ApiUsuario
  prioridad?: ApiPrioridad
  eliminada?: boolean
  fechaEliminacion?: string
}

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    let message = `Error al consumir ${url} (${response.status}).`

    if (errorText) {
      try {
        const errorJson = JSON.parse(errorText) as { error?: string; message?: string }
        message = errorJson.error ?? errorJson.message ?? message
      } catch {
        message = errorText
      }
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

function fechaApiComoDia(fecha?: string) {
  return fecha ? fecha.split('T')[0] : formatoFecha(new Date())
}

function estadoDesdeApi(estado?: ApiEstadoTarea): PortalTask['estatus'] {
  const nombre = estado?.nombreEstado?.toLowerCase() ?? 'pending'

  if (nombre.includes('progress') || nombre.includes('progreso')) return 'en_progreso'
  if (nombre.includes('complete') || nombre.includes('done') || nombre.includes('complet')) return 'completada'
  if (nombre.includes('cancel')) return 'cancelada'
  return 'pendiente'
}

function estadoParaApi(estatus: PortalTask['estatus']): ApiEstadoTarea {
  const nombreEstado = {
    pendiente: 'PENDING',
    en_progreso: 'IN PROGRESS',
    completada: 'COMPLETED',
    cancelada: 'CANCELLED',
  }[estatus]

  return { nombreEstado }
}

function prioridadDesdeApi(prioridad?: ApiPrioridad): PortalTask['prioridad'] {
  const nombre = prioridad?.nombre?.toLowerCase() ?? 'media'

  if (nombre.includes('alta') || nombre.includes('high') || nombre.includes('3')) return 'alta'
  if (nombre.includes('baja') || nombre.includes('low') || nombre.includes('1')) return 'baja'
  return 'media'
}

function prioridadParaApi(prioridad: PortalTask['prioridad']): ApiPrioridad {
  return { nombre: prioridad }
}

function mapProyectoApi(proyecto: ApiProyecto): PortalProject {
  return {
    id: String(proyecto.idProyecto),
    nombre: proyecto.nombre,
    descripcion: proyecto.descripcion ?? '',
    fechaInicio: fechaApiComoDia(proyecto.fechaInicio),
    fechaFin: fechaApiComoDia(proyecto.fechaFin),
    codigoAcceso: proyecto.codigoAcceso ?? '',
  }
}

function mapSprintApi(sprint: ApiSprint): PortalSprint {
  const proyecto = sprint.proyecto

  return {
    id: String(sprint.idSprint),
    nombre: sprint.nombre,
    fechaInicio: fechaApiComoDia(sprint.fechaInicio),
    fechaFin: fechaApiComoDia(sprint.fechaFin),
    proyectoId: proyecto ? String(proyecto.idProyecto) : '',
    proyectoNombre: proyecto?.nombre ?? 'Sin proyecto',
  }
}

function mapTareaApi(tarea: ApiTarea): PortalTask {
  const sprint = tarea.sprint ? mapSprintApi(tarea.sprint) : undefined
  const personaId = tarea.usuarioAsignado?.idUsuario
    ? String(tarea.usuarioAsignado.idUsuario)
    : 'sin-asignar'

  return {
    id: String(tarea.idTarea),
    nombre: tarea.nombre,
    descripcion: tarea.descripcion ?? '',
    fechaCreacion: tarea.fechaCreacion ?? new Date().toISOString(),
    fechaEntrega: fechaApiComoDia(tarea.fechaEntrega),
    horasEstimadas: tarea.horasEstimadas ?? 0,
    puntosHistoria: tarea.puntosHistoria ?? 0,
    estatus: estadoDesdeApi(tarea.estado),
    sprintId: sprint?.id ?? '',
    sprintNombre: sprint?.nombre ?? 'Sin sprint',
    sprintEsActual: sprint ? esSprintActual(sprint) : false,
    proyectoId: sprint?.proyectoId ?? '',
    proyectoNombre: sprint?.proyectoNombre ?? 'Sin proyecto',
    personaAsignadaId: personaId,
    personaAsignadaNombre: tarea.usuarioAsignado?.nombre ?? 'Sin asignar',
    prioridad: prioridadDesdeApi(tarea.prioridad),
    eliminada: tarea.eliminada ?? false,
    fechaEliminacion: tarea.fechaEliminacion,
    horasReales: tarea.horasReales ?? 0,
    sesionesTrabajo: [],
    actualizadoEn: tarea.fechaCreacion ?? new Date().toISOString(),
  }
}

function payloadTareaApi(input: PortalTaskInput): Partial<ApiTarea> {
  const sprintId = Number(input.sprintId)
  const usuarioAsignadoId = Number(input.personaAsignadaId)

  if (!Number.isFinite(sprintId)) {
    throw new Error('El sprint seleccionado no tiene un ID valido para guardar en la base de datos.')
  }

  if (!Number.isFinite(usuarioAsignadoId)) {
    throw new Error('El responsable seleccionado no tiene un ID valido para guardar en la base de datos.')
  }

  return {
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim(),
    fechaEntrega: `${input.fechaEntrega}T00:00:00Z`,
    horasEstimadas: input.horasEstimadas,
    puntosHistoria: input.puntosHistoria,
    estado: estadoParaApi(input.estatus),
    prioridad: prioridadParaApi(input.prioridad),
    sprint: { idSprint: sprintId, nombre: '' },
    usuarioAsignado: {
      idUsuario: usuarioAsignadoId,
      nombre: '',
    },
    eliminada: false,
  }
}

async function obtenerPortalSnapshotApi(): Promise<PortalSnapshot> {
  const [projectsApi, sprintsApi, tasksApi] = await Promise.all([
    fetchJson<ApiProyecto[]>('/api/proyectos'),
    fetchJson<ApiSprint[]>('/api/sprints'),
    fetchJson<ApiTarea[]>('/api/tareas'),
  ])

  return {
    projects: projectsApi.map(mapProyectoApi),
    sprints: sprintsApi.map(mapSprintApi),
    tasks: tasksApi.filter((task) => !task.eliminada).map(mapTareaApi),
    notifications: clonar(notificationsDb),
    memberships: clonar(membershipsDb),
  }
}

function snapshotActual(): PortalSnapshot {
  return {
    projects: clonar(projectsDb),
    sprints: clonar(sprintsDb),
    tasks: clonar(tasksDb.filter((task) => !task.eliminada)),
    notifications: clonar(notificationsDb),
    memberships: clonar(membershipsDb),
  }
}

export async function obtenerPortalSnapshot(): Promise<PortalSnapshot> {
  try {
    return await obtenerPortalSnapshotApi()
  } catch (error) {
    console.warn('Usando datos mock porque no se pudo cargar el snapshot real.', error)
    return Promise.resolve(snapshotActual())
  }
}

export async function crearPortalTask(
  input: PortalTaskInput,
): Promise<PortalTask> {
  const tarea = await fetchJson<ApiTarea>('/api/tareas', {
    method: 'POST',
    body: JSON.stringify(payloadTareaApi(input)),
  })

  return mapTareaApi(tarea)
}

async function crearPortalTaskMock(
  input: PortalTaskInput,
): Promise<PortalTask> {
  const sprint = sprintsDb.find((item) => item.id === input.sprintId)
  const persona = obtenerUsuarioPorId(input.personaAsignadaId)

  if (!sprint || !persona) {
    throw new Error('La tarea necesita un sprint y una persona asignada validos.')
  }

  const ahoraActual = new Date()

  const nuevaTask = enriquecerTask(
    {
      id: siguienteId('tarea'),
      nombre: input.nombre.trim(),
      descripcion: input.descripcion.trim(),
      fechaCreacion: formatoFechaHora(ahoraActual),
      fechaEntrega: input.fechaEntrega,
      horasEstimadas: input.horasEstimadas,
      puntosHistoria: input.puntosHistoria,
      estatus: input.estatus,
      sprintId: sprint.id,
      proyectoId: sprint.proyectoId,
      proyectoNombre: sprint.proyectoNombre,
      personaAsignadaId: persona.id,
      personaAsignadaNombre: persona.nombreCompleto,
      prioridad: input.prioridad,
      eliminada: false,
      horasReales: 0,
      fechaInicioReal: undefined,
      fechaFinReal: undefined,
      sesionesTrabajo: [],
      actualizadoEn: formatoFechaHora(ahoraActual),
    },
    sprintsDb,
  )

  tasksDb = [sincronizarTimeTracking(nuevaTask), ...tasksDb]
  agregarNotificaciones([
    crearNotificacion({
      usuarioId: persona.id,
      tareaId: nuevaTask.id,
      tipo: 'asignacion',
      mensaje: `Se te ha asignado la tarea: ${nuevaTask.nombre}`,
    }),
  ])

  return Promise.resolve(clonar(nuevaTask))
}

export async function actualizarPortalTask(
  taskId: string,
  cambios: Partial<PortalTaskInput>,
): Promise<PortalTask> {
  const snapshot = await obtenerPortalSnapshot()
  const actual = snapshot.tasks.find((task) => task.id === taskId)

  if (!actual) {
    throw new Error('La tarea no existe.')
  }

  const payload = payloadTareaApi({
    nombre: cambios.nombre ?? actual.nombre,
    descripcion: cambios.descripcion ?? actual.descripcion,
    fechaEntrega: cambios.fechaEntrega ?? actual.fechaEntrega,
    horasEstimadas: cambios.horasEstimadas ?? actual.horasEstimadas,
    puntosHistoria: cambios.puntosHistoria ?? actual.puntosHistoria,
    estatus: cambios.estatus ?? actual.estatus,
    prioridad: cambios.prioridad ?? actual.prioridad,
    sprintId: cambios.sprintId ?? actual.sprintId,
    personaAsignadaId: cambios.personaAsignadaId ?? actual.personaAsignadaId,
  })

  const tarea = await fetchJson<ApiTarea>(`/api/tareas/${taskId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return mapTareaApi(tarea)
}

async function actualizarPortalTaskMock(
  taskId: string,
  cambios: Partial<PortalTaskInput>,
): Promise<PortalTask> {
  const actual = tasksDb.find((task) => task.id === taskId)

  if (!actual) {
    throw new Error('La tarea no existe.')
  }

  const sprint = cambios.sprintId
    ? sprintsDb.find((item) => item.id === cambios.sprintId)
    : sprintsDb.find((item) => item.id === actual.sprintId)
  const persona = cambios.personaAsignadaId
    ? obtenerUsuarioPorId(cambios.personaAsignadaId)
    : obtenerUsuarioPorId(actual.personaAsignadaId)

  if (!sprint || !persona) {
    throw new Error('No se pudo actualizar la tarea con la informacion proporcionada.')
  }

  const ahoraActual = formatoFechaHora(new Date())
  const estatusSiguiente = cambios.estatus ?? actual.estatus

  const actualizadaBase: PortalTask = enriquecerTask(
    {
      ...actual,
      nombre: (cambios.nombre ?? actual.nombre).trim(),
      descripcion: (cambios.descripcion ?? actual.descripcion).trim(),
      fechaEntrega: cambios.fechaEntrega ?? actual.fechaEntrega,
      horasEstimadas: cambios.horasEstimadas ?? actual.horasEstimadas,
      puntosHistoria: cambios.puntosHistoria ?? actual.puntosHistoria,
      estatus: estatusSiguiente,
      sprintId: sprint.id,
      proyectoId: sprint.proyectoId,
      proyectoNombre: sprint.proyectoNombre,
      personaAsignadaId: persona.id,
      personaAsignadaNombre: persona.nombreCompleto,
      prioridad: cambios.prioridad ?? actual.prioridad,
      sesionesTrabajo: actual.sesionesTrabajo,
      actualizadoEn: ahoraActual,
    },
    sprintsDb,
  )

  if (obtenerSesionActiva(actualizadaBase) && estatusSiguiente !== 'en_progreso') {
    actualizadaBase.sesionesTrabajo = cerrarSesionActiva(
      actualizadaBase,
      ahoraActual,
      actualizadaBase.personaAsignadaId,
    )
  }

  const sincronizada = sincronizarTimeTracking(actualizadaBase)
  tasksDb = tasksDb.map((task) => (task.id === taskId ? sincronizada : task))

  if (persona.id !== actual.personaAsignadaId) {
    agregarNotificaciones([
      crearNotificacion({
        usuarioId: persona.id,
        tareaId: sincronizada.id,
        tipo: 'reasignacion',
        mensaje: `Se te ha reasignado la tarea: ${sincronizada.nombre}`,
      }),
    ])
  }

  return Promise.resolve(clonar(sincronizada))
}

export async function actualizarPortalTaskStatus(
  taskId: string,
  estatus: PortalTask['estatus'],
): Promise<PortalTask> {
  const actual = tasksDb.find((task) => task.id === taskId)

  if (!actual) {
    throw new Error('La tarea no existe.')
  }

  const ahoraActual = formatoFechaHora(new Date())

  const actualizada: PortalTask = {
    ...actual,
    estatus,
    actualizadoEn: ahoraActual,
  }

  if (obtenerSesionActiva(actualizada) && estatus !== 'en_progreso') {
    actualizada.sesionesTrabajo = cerrarSesionActiva(
      actualizada,
      ahoraActual,
      actualizada.personaAsignadaId,
    )
  }

  const sincronizada = sincronizarTimeTracking(actualizada)
  tasksDb = tasksDb.map((task) => (task.id === taskId ? sincronizada : task))
  registrarCambioEstado(sincronizada, actual.estatus)
  return Promise.resolve(clonar(sincronizada))
}

export async function iniciarPortalTaskSession(
  taskId: string,
  userId: string,
): Promise<PortalTask> {
  const actual = tasksDb.find((task) => task.id === taskId)
  const usuario = obtenerUsuarioPorId(userId)

  if (!actual || !usuario) {
    throw new Error('No se pudo iniciar la sesion de trabajo.')
  }

  if (actual.personaAsignadaId !== userId) {
    throw new Error('Solo la persona asignada puede iniciar sesiones de trabajo.')
  }

  if (actual.estatus === 'completada' || actual.estatus === 'cancelada') {
    throw new Error('La tarea debe estar activa para iniciar una sesion de trabajo.')
  }

  if (obtenerSesionActiva(actual)) {
    throw new Error('Ya existe una sesion de trabajo activa para esta tarea.')
  }

  const ahoraActual = formatoFechaHora(new Date())
  const actualizada = sincronizarTimeTracking({
    ...actual,
    estatus: 'en_progreso',
    sesionesTrabajo: [
      ...actual.sesionesTrabajo,
      crearSesionTrabajo({
        iniciadaEn: ahoraActual,
        iniciadaPorUsuarioId: userId,
        iniciadaPorNombre: usuario.nombreCompleto,
      }),
    ],
    actualizadoEn: ahoraActual,
  })

  tasksDb = tasksDb.map((task) => (task.id === taskId ? actualizada : task))
  registrarCambioEstado(actualizada, actual.estatus)
  return Promise.resolve(clonar(actualizada))
}

export async function detenerPortalTaskSession(
  taskId: string,
  userId: string,
): Promise<PortalTask> {
  const actual = tasksDb.find((task) => task.id === taskId)

  if (!actual) {
    throw new Error('La tarea no existe.')
  }

  if (actual.personaAsignadaId !== userId) {
    throw new Error('Solo la persona asignada puede detener sesiones de trabajo.')
  }

  if (!obtenerSesionActiva(actual)) {
    throw new Error('No hay una sesion activa para detener.')
  }

  const ahoraActual = formatoFechaHora(new Date())
  const actualizada = sincronizarTimeTracking({
    ...actual,
    sesionesTrabajo: cerrarSesionActiva(actual, ahoraActual, userId),
    actualizadoEn: ahoraActual,
  })

  tasksDb = tasksDb.map((task) => (task.id === taskId ? actualizada : task))
  return Promise.resolve(clonar(actualizada))
}

export async function eliminarPortalTask(taskId: string): Promise<void> {
  await fetchJson<void>(`/api/tareas/${taskId}`, {
    method: 'DELETE',
  })
}

async function eliminarPortalTaskMock(taskId: string): Promise<void> {
  tasksDb = tasksDb.map((task) =>
    task.id === taskId
      ? {
          ...task,
          eliminada: true,
          deletedById: 'usuario-admin-jose',
          fechaEliminacion: formatoFechaHora(new Date()),
          actualizadoEn: formatoFechaHora(new Date()),
        }
      : task,
  )

  return Promise.resolve()
}

export async function crearPortalProject(
  input: PortalProjectInput,
): Promise<PortalProject> {
  const nuevoProject: PortalProject = {
    id: siguienteId('proyecto'),
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim(),
    fechaInicio: input.fechaInicio,
    fechaFin: input.fechaFin,
    codigoAcceso: generarCodigoProyecto(input.nombre),
  }

  const sprintInicial = crearSprintInicial(nuevoProject)

  projectsDb = [...projectsDb, nuevoProject]
  sprintsDb = [...sprintsDb, sprintInicial]

  return Promise.resolve(clonar(nuevoProject))
}

export async function regenerarPortalAccessCode(
  projectId: string,
): Promise<PortalProject> {
  const proyecto = projectsDb.find((project) => project.id === projectId)

  if (!proyecto) {
    throw new Error('No se encontro el proyecto para actualizar el codigo.')
  }

  const actualizado = {
    ...proyecto,
    codigoAcceso: generarCodigoProyecto(proyecto.nombre),
  }

  projectsDb = projectsDb.map((project) =>
    project.id === projectId ? actualizado : project,
  )

  return Promise.resolve(clonar(actualizado))
}

export async function unirUsuarioAProyectoConCodigo(
  code: string,
  userId: string,
): Promise<{ message: string; proyectoId: string }> {
  const proyecto = projectsDb.find(
    (item) => item.codigoAcceso.toLowerCase() === code.trim().toLowerCase(),
  )

  if (!proyecto) {
    throw new Error('El codigo de acceso no es valido.')
  }

  const yaExiste = membershipsDb.some(
    (membership) =>
      membership.usuarioId === userId && membership.proyectoId === proyecto.id,
  )

  if (yaExiste) {
    return Promise.resolve({
      message: 'El usuario ya tiene acceso a ese proyecto.',
      proyectoId: proyecto.id,
    })
  }

  membershipsDb = [
    ...membershipsDb,
    {
      usuarioId: userId,
      proyectoId: proyecto.id,
      unidoEn: formatoFechaHora(new Date()),
    },
  ]

  return Promise.resolve({
    message: `Acceso concedido a ${proyecto.nombre}.`,
    proyectoId: proyecto.id,
  })
}
