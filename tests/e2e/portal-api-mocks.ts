import type { Page, Route } from '@playwright/test'

type ApiRol = {
  idRol: number
  nombreRol: string
}

type ApiUsuario = {
  idUsuario: number
  telegramId: number
  nombre: string
  username: string
  rol: ApiRol
  fechaRegistro: string
}

type ApiProyecto = {
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
  proyecto: ApiProyecto
}

type ApiEstadoTarea = {
  idEstado: number
  nombreEstado: string
}

type ApiPrioridad = {
  idPrioridad: number
  nombre: string
}

type ApiTarea = {
  idTarea: number
  nombre: string
  descripcion: string
  fechaCreacion: string
  fechaEntrega: string
  horasEstimadas: number
  horasReales: number
  puntosHistoria: number
  estado: ApiEstadoTarea
  sprint: ApiSprint
  usuarioAsignado: ApiUsuario
  prioridad: ApiPrioridad
  eliminada: boolean
  fechaEliminacion?: string
}

export const portalMockIds = {
  admin: '1',
  ian: '2',
  santiago: '3',
}

const rolAdmin = { idRol: 1, nombreRol: 'ADMIN' }
const rolDeveloper = { idRol: 2, nombreRol: 'DEVELOPER' }

function todayOffset(days: number) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return `${date.toISOString().split('T')[0]}T00:00:00`
}

function json(route: Route, body: unknown, status = 200) {
  return route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

function codigoProyecto(nombre: string, idProyecto: number) {
  const prefix = nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 4)
    .toUpperCase()
    .padEnd(4, 'X')

  return `${prefix}-${idProyecto}`
}

function normalizarEstado(estado?: Partial<ApiEstadoTarea>): ApiEstadoTarea {
  const value = estado?.nombreEstado?.trim().toUpperCase() ?? 'PENDING'

  if (value === 'IN PROGRESS' || value === 'EN_PROGRESO' || value === 'EN PROGRESO') {
    return { idEstado: 2, nombreEstado: 'En progreso' }
  }

  if (value === 'COMPLETED' || value === 'DONE' || value === 'COMPLETADA') {
    return { idEstado: 3, nombreEstado: 'Completada' }
  }

  if (value === 'CANCELLED' || value === 'CANCELED' || value === 'CANCELADA') {
    return { idEstado: 4, nombreEstado: 'Cancelada' }
  }

  return { idEstado: 1, nombreEstado: 'Pendiente' }
}

function normalizarPrioridad(prioridad?: Partial<ApiPrioridad>): ApiPrioridad {
  const value = prioridad?.nombre?.trim().toUpperCase() ?? 'MEDIA'

  if (value === 'HIGH' || value === 'ALTA' || value === '3') {
    return { idPrioridad: 3, nombre: 'Alta' }
  }

  if (value === 'LOW' || value === 'BAJA' || value === '1') {
    return { idPrioridad: 1, nombre: 'Baja' }
  }

  return { idPrioridad: 2, nombre: 'Media' }
}

function tareaCompletada(tarea: ApiTarea) {
  return tarea.estado.nombreEstado.toLowerCase().includes('complet')
}

export async function mockPortalApi(page: Page) {
  const usuarios: ApiUsuario[] = [
    {
      idUsuario: 1,
      telegramId: 501,
      nombre: 'Jose Angel Aleman',
      username: 'joseangel',
      rol: rolAdmin,
      fechaRegistro: todayOffset(-30),
    },
    {
      idUsuario: 2,
      telegramId: 502,
      nombre: 'Ian Leon',
      username: 'ian',
      rol: rolDeveloper,
      fechaRegistro: todayOffset(-30),
    },
    {
      idUsuario: 3,
      telegramId: 503,
      nombre: 'Santiago Borbolla Regato',
      username: 'santiago',
      rol: rolDeveloper,
      fechaRegistro: todayOffset(-30),
    },
  ]

  const proyectos: ApiProyecto[] = []
  const sprints: ApiSprint[] = []
  const tareas: ApiTarea[] = []

  let nextProjectId = 100
  let nextSprintId = 1000
  let nextTaskId = 5000

  const metricasPorSprintDeveloper = () => {
    const grouped = new Map<
      string,
      {
        sprintId: number
        sprintName: string
        developerId: number
        developerName: string
        completedTasks: number
        realHours: number
      }
    >()

    tareas
      .filter((tarea) => !tarea.eliminada && tareaCompletada(tarea))
      .forEach((tarea) => {
        const key = `${tarea.sprint.idSprint}:${tarea.usuarioAsignado.idUsuario}`
        const current = grouped.get(key) ?? {
          sprintId: tarea.sprint.idSprint,
          sprintName: tarea.sprint.nombre,
          developerId: tarea.usuarioAsignado.idUsuario,
          developerName: tarea.usuarioAsignado.nombre,
          completedTasks: 0,
          realHours: 0,
        }

        current.completedTasks += 1
        current.realHours += tarea.horasReales ?? 0
        grouped.set(key, current)
      })

    return Array.from(grouped.values())
  }

  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const method = request.method()
    const path = new URL(request.url()).pathname

    if (path === '/api/usuarios' && method === 'GET') {
      await json(route, usuarios)
      return
    }

    if (path === '/api/proyectos' && method === 'GET') {
      await json(route, proyectos)
      return
    }

    if (path === '/api/proyectos' && method === 'POST') {
      const payload = request.postDataJSON() as Partial<ApiProyecto>
      const proyecto: ApiProyecto = {
        idProyecto: nextProjectId++,
        nombre: payload.nombre?.trim() ?? 'Proyecto sin nombre',
        descripcion: payload.descripcion?.trim() ?? '',
        fechaInicio: payload.fechaInicio ?? todayOffset(0),
        fechaFin: payload.fechaFin ?? todayOffset(14),
        codigoAcceso: '',
      }
      proyecto.codigoAcceso = codigoProyecto(proyecto.nombre, proyecto.idProyecto)
      proyectos.push(proyecto)
      sprints.push({
        idSprint: nextSprintId++,
        nombre: 'Sprint 1',
        fechaInicio: proyecto.fechaInicio,
        fechaFin: proyecto.fechaFin,
        proyecto,
      })

      await json(route, proyecto)
      return
    }

    if (path === '/api/sprints' && method === 'GET') {
      await json(route, sprints)
      return
    }

    if (path === '/api/tareas' && method === 'GET') {
      await json(route, tareas)
      return
    }

    if (path === '/api/tareas' && method === 'POST') {
      const payload = request.postDataJSON() as Partial<ApiTarea>
      const sprint = sprints.find((item) => item.idSprint === payload.sprint?.idSprint)
      const usuario = usuarios.find(
        (item) => item.idUsuario === payload.usuarioAsignado?.idUsuario,
      )
      const estado = normalizarEstado(payload.estado)
      const prioridad = normalizarPrioridad(payload.prioridad)
      const horasReales = payload.horasReales ?? 0

      if (!sprint || !usuario) {
        await json(route, { error: 'La tarea necesita sprint y responsable reales.' }, 400)
        return
      }

      if (estado.nombreEstado === 'Completada' && horasReales <= 0) {
        await json(route, { error: 'Para completar la tarea debes registrar horas reales mayores a cero.' }, 400)
        return
      }

      const tarea: ApiTarea = {
        idTarea: nextTaskId++,
        nombre: payload.nombre?.trim() ?? 'Tarea sin nombre',
        descripcion: payload.descripcion?.trim() ?? '',
        fechaCreacion: new Date().toISOString(),
        fechaEntrega: payload.fechaEntrega ?? todayOffset(7),
        horasEstimadas: payload.horasEstimadas ?? 1,
        horasReales,
        puntosHistoria: payload.puntosHistoria ?? 1,
        estado,
        sprint,
        usuarioAsignado: usuario,
        prioridad,
        eliminada: false,
      }
      tareas.unshift(tarea)

      await json(route, tarea)
      return
    }

    const tareaMatch = path.match(/^\/api\/tareas\/(\d+)$/)
    if (tareaMatch && method === 'PUT') {
      const taskId = Number(tareaMatch[1])
      const index = tareas.findIndex((item) => item.idTarea === taskId)
      const payload = request.postDataJSON() as Partial<ApiTarea>

      if (index < 0) {
        await json(route, { error: 'La tarea no existe.' }, 404)
        return
      }

      const sprint = sprints.find((item) => item.idSprint === payload.sprint?.idSprint)
      const usuario = usuarios.find(
        (item) => item.idUsuario === payload.usuarioAsignado?.idUsuario,
      )
      const estado = normalizarEstado(payload.estado)
      const prioridad = normalizarPrioridad(payload.prioridad)
      const horasReales = payload.horasReales ?? tareas[index].horasReales

      if (!sprint || !usuario) {
        await json(route, { error: 'La tarea necesita sprint y responsable reales.' }, 400)
        return
      }

      if (estado.nombreEstado === 'Completada' && horasReales <= 0) {
        await json(route, { error: 'Para completar la tarea debes registrar horas reales mayores a cero.' }, 400)
        return
      }

      tareas[index] = {
        ...tareas[index],
        nombre: payload.nombre?.trim() ?? tareas[index].nombre,
        descripcion: payload.descripcion?.trim() ?? tareas[index].descripcion,
        fechaEntrega: payload.fechaEntrega ?? tareas[index].fechaEntrega,
        horasEstimadas: payload.horasEstimadas ?? tareas[index].horasEstimadas,
        horasReales,
        puntosHistoria: payload.puntosHistoria ?? tareas[index].puntosHistoria,
        estado,
        sprint,
        usuarioAsignado: usuario,
        prioridad,
      }

      await json(route, tareas[index])
      return
    }

    if (tareaMatch && method === 'DELETE') {
      const taskId = Number(tareaMatch[1])
      const tarea = tareas.find((item) => item.idTarea === taskId)

      if (!tarea) {
        await json(route, { error: 'La tarea no existe.' }, 404)
        return
      }

      tarea.eliminada = true
      tarea.fechaEliminacion = new Date().toISOString()
      await route.fulfill({ status: 204 })
      return
    }

    if (path === '/api/dashboard/sprint-developer-metrics' && method === 'GET') {
      await json(route, metricasPorSprintDeveloper())
      return
    }

    if (path === '/api/dashboard/metrics' && method === 'GET') {
      const completedTasks = tareas.filter((tarea) => !tarea.eliminada && tareaCompletada(tarea))
      const realHours = completedTasks.reduce((total, tarea) => total + tarea.horasReales, 0)
      await json(route, [
        {
          idMetrica: 1,
          proyecto: proyectos[0],
          sprint: sprints[0],
          nombreKpi: 'completed_tasks',
          valor: completedTasks.length,
          fechaCalculo: new Date().toISOString(),
        },
        {
          idMetrica: 2,
          proyecto: proyectos[0],
          sprint: sprints[0],
          nombreKpi: 'total_real_hours',
          valor: realHours,
          fechaCalculo: new Date().toISOString(),
        },
      ])
      return
    }

    await json(route, { error: `Ruta mock no implementada: ${method} ${path}` }, 404)
  })
}
