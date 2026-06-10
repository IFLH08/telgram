import type { Page, Route } from '@playwright/test'

type ApiProject = {
  idProyecto: number
  nombre: string
  descripcion: string
  fechaInicio: string
  fechaFin: string
  codigoAcceso: string
}

type ApiSprint = {
  idSprint: number
  nombre: string
  fechaInicio: string
  fechaFin: string
  proyecto: ApiProject
}

type ApiUser = {
  idUsuario: number
  nombre: string
  username: string
  rol: {
    idRol: number
    nombreRol: string
  }
}

type ApiTask = {
  idTarea: number
  nombre: string
  descripcion: string
  fechaCreacion: string
  fechaEntrega: string
  horasEstimadas: number
  horasReales: number
  puntosHistoria: number
  estado: {
    nombreEstado: string
  }
  sprint: ApiSprint
  usuarioAsignado: {
    idUsuario: number
    nombre: string
  }
  prioridad: {
    nombre: string
  }
  eliminada: boolean
}

export type PortalMockState = {
  dashboardMetricRequests: string[]
  tasks: ApiTask[]
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function normalizeStatus(status: string | undefined) {
  const value = status?.toLowerCase() ?? ''

  if (value.includes('progress') || value.includes('progreso')) return 'En progreso'
  if (value.includes('complete') || value.includes('done') || value.includes('complet')) return 'Completada'
  if (value.includes('cancel')) return 'Cancelada'
  return 'Pendiente'
}

function normalizePriority(priority: string | undefined) {
  const value = priority?.toLowerCase() ?? ''

  if (value.includes('high') || value.includes('alta')) return 'Alta'
  if (value.includes('low') || value.includes('baja')) return 'Baja'
  return 'Media'
}

export async function mockPortalApi(page: Page): Promise<PortalMockState> {
  const project: ApiProject = {
    idProyecto: 10,
    nombre: 'Proyecto Demo Final',
    descripcion: 'Proyecto usado para validar el flujo P0.',
    fechaInicio: '2026-06-01T00:00:00',
    fechaFin: '2026-06-30T00:00:00',
    codigoAcceso: 'DEMO2026',
  }

  const futureProject: ApiProject = {
    idProyecto: 11,
    nombre: 'Proyecto Posterior',
    descripcion: 'Proyecto fuera del corte del dashboard.',
    fechaInicio: '2026-06-12T00:00:00',
    fechaFin: '2026-06-30T00:00:00',
    codigoAcceso: 'FUT2026',
  }

  const users: ApiUser[] = [
    {
      idUsuario: 1,
      nombre: 'Jose Admin',
      username: 'jose_admin',
      rol: { idRol: 1, nombreRol: 'ADMIN' },
    },
    {
      idUsuario: 2,
      nombre: 'Ian Leon',
      username: 'ian',
      rol: { idRol: 2, nombreRol: 'DESARROLLADOR' },
    },
    {
      idUsuario: 3,
      nombre: 'Santiago Developer',
      username: 'santiago',
      rol: { idRol: 2, nombreRol: 'DESARROLLADOR' },
    },
  ]

  const sprints: ApiSprint[] = [
    {
      idSprint: 100,
      nombre: 'Sprint Demo',
      fechaInicio: '2026-06-01T00:00:00',
      fechaFin: '2026-06-11T00:00:00',
      proyecto: project,
    },
    {
      idSprint: 101,
      nombre: 'Sprint Posterior',
      fechaInicio: '2026-06-12T00:00:00',
      fechaFin: '2026-06-25T00:00:00',
      proyecto: futureProject,
    },
  ]

  const state: PortalMockState = {
    dashboardMetricRequests: [],
    tasks: [
      {
        idTarea: 500,
        nombre: 'Tarea inicial Ian',
        descripcion: 'Tarea visible para el developer en la demo.',
        fechaCreacion: '2026-06-08T12:00:00',
        fechaEntrega: '2026-06-11T00:00:00',
        horasEstimadas: 2,
        horasReales: 0,
        puntosHistoria: 1,
        estado: { nombreEstado: 'Pendiente' },
        sprint: sprints[0],
        usuarioAsignado: { idUsuario: 2, nombre: 'Ian Leon' },
        prioridad: { nombre: 'Alta' },
        eliminada: false,
      },
    ],
  }

  const usersById = new Map(users.map((user) => [user.idUsuario, user]))
  const sprintsById = new Map(sprints.map((sprint) => [sprint.idSprint, sprint]))

  const buildMetrics = (url: URL) => {
    const sprintFilter = url.searchParams.get('sprintId')
    const developerFilter = url.searchParams.get('developerId')
    const grouped = new Map<string, {
      sprint: ApiSprint
      user: ApiUser
      completedTasks: number
      realHours: number
    }>()

    for (const task of state.tasks.filter((item) => !item.eliminada)) {
      if (sprintFilter && String(task.sprint.idSprint) !== sprintFilter) continue
      if (developerFilter && String(task.usuarioAsignado.idUsuario) !== developerFilter) continue

      const user = usersById.get(task.usuarioAsignado.idUsuario)
      if (!user) continue

      const key = `${task.sprint.idSprint}:${user.idUsuario}`
      const current = grouped.get(key) ?? {
        sprint: task.sprint,
        user,
        completedTasks: 0,
        realHours: 0,
      }

      if (normalizeStatus(task.estado.nombreEstado) === 'Completada') {
        current.completedTasks += 1
      }
      current.realHours += Number(task.horasReales ?? 0)
      grouped.set(key, current)
    }

    return Array.from(grouped.values()).map((item) => ({
      sprintId: item.sprint.idSprint,
      sprintName: item.sprint.nombre,
      developerId: item.user.idUsuario,
      developerName: item.user.nombre,
      completedTasks: item.completedTasks,
      realHours: item.realHours,
    }))
  }

  await page.route('**/api/usuarios', (route) => json(route, users))
  await page.route('**/api/proyectos', (route) => json(route, [project, futureProject]))
  await page.route('**/api/sprints', (route) => json(route, sprints))
  await page.route('**/api/dashboard/metrics', (route) => json(route, []))
  await page.route('**/api/dashboard/sprint-developer-metrics**', (route) => {
    state.dashboardMetricRequests.push(route.request().url())
    return json(route, buildMetrics(new URL(route.request().url())))
  })

  await page.route('**/api/tareas/*', async (route) => {
    const request = route.request()
    const id = Number(new URL(request.url()).pathname.split('/').at(-1))
    const task = state.tasks.find((item) => item.idTarea === id)

    if (!task) {
      return json(route, { error: 'La tarea no existe.' }, 404)
    }

    if (request.method() === 'PUT') {
      const body = request.postDataJSON()
      const sprint = sprintsById.get(Number(body.sprint?.idSprint)) ?? task.sprint
      const user = usersById.get(Number(body.usuarioAsignado?.idUsuario))

      task.nombre = body.nombre ?? task.nombre
      task.descripcion = body.descripcion ?? task.descripcion
      task.fechaEntrega = body.fechaEntrega ?? task.fechaEntrega
      task.horasEstimadas = Number(body.horasEstimadas ?? task.horasEstimadas)
      task.horasReales = Number(body.horasReales ?? task.horasReales)
      task.puntosHistoria = Number(body.puntosHistoria ?? task.puntosHistoria)
      task.estado = { nombreEstado: normalizeStatus(body.estado?.nombreEstado) }
      task.prioridad = { nombre: normalizePriority(body.prioridad?.nombre) }
      task.sprint = sprint
      if (user) {
        task.usuarioAsignado = { idUsuario: user.idUsuario, nombre: user.nombre }
      }
      return json(route, task)
    }

    if (request.method() === 'DELETE') {
      task.eliminada = true
      return route.fulfill({ status: 204 })
    }

    return json(route, task)
  })

  await page.route('**/api/tareas', async (route) => {
    const request = route.request()

    if (request.method() === 'POST') {
      const body = request.postDataJSON()
      const sprint = sprintsById.get(Number(body.sprint?.idSprint))
      const user = usersById.get(Number(body.usuarioAsignado?.idUsuario))

      if (!sprint || !user) {
        return json(route, { error: 'Datos invalidos.' }, 400)
      }

      const task: ApiTask = {
        idTarea: Math.max(...state.tasks.map((item) => item.idTarea)) + 1,
        nombre: body.nombre,
        descripcion: body.descripcion,
        fechaCreacion: '2026-06-09T10:00:00',
        fechaEntrega: body.fechaEntrega,
        horasEstimadas: Number(body.horasEstimadas ?? 0),
        horasReales: Number(body.horasReales ?? 0),
        puntosHistoria: Number(body.puntosHistoria ?? 0),
        estado: { nombreEstado: normalizeStatus(body.estado?.nombreEstado) },
        sprint,
        usuarioAsignado: { idUsuario: user.idUsuario, nombre: user.nombre },
        prioridad: { nombre: normalizePriority(body.prioridad?.nombre) },
        eliminada: false,
      }

      state.tasks.unshift(task)
      return json(route, task)
    }

    return json(route, state.tasks)
  })

  return state
}
