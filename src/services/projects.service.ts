import type { Proyecto } from '../types'
import { proyectosMock } from '../mocks/projects.mock'
// import { api } from './api'

export async function obtenerProyectos(): Promise<Proyecto[]> {
  // Cuando se conecte a backend:
  // const respuesta = await api.get<{ data: Proyecto[] }>('/projects')
  // return respuesta.data

  return Promise.resolve(proyectosMock)
}

export async function obtenerProyectoPorId(
  id: string
): Promise<Proyecto | undefined> {
  // Futuro backend:
  // const respuesta = await api.get<{ data: Proyecto }>(`/projects/${id}`)
  // return respuesta.data

  return Promise.resolve(proyectosMock.find((proyecto) => proyecto.id === id))
}

export async function crearProyecto(
  payload: Partial<Proyecto>
): Promise<Proyecto> {
  // Futuro backend:
  // return api.post<Proyecto>('/projects', payload)

  const nuevoProyecto: Proyecto = {
    id: `proyecto-${Date.now()}`,
    nombre: payload.nombre || 'Nuevo proyecto',
    descripcion: payload.descripcion,
    estado: payload.estado || 'activo',
    responsableId: payload.responsableId,
    responsableNombre: payload.responsableNombre,
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  }

  return Promise.resolve(nuevoProyecto)
}

export async function actualizarProyecto(
  id: string,
  cambios: Partial<Proyecto>
): Promise<Proyecto | undefined> {
  // Futuro backend:
  // return api.put<Proyecto>(`/projects/${id}`, cambios)

  const proyectoExistente = proyectosMock.find((proyecto) => proyecto.id === id)

  if (!proyectoExistente) {
    return Promise.resolve(undefined)
  }

  return Promise.resolve({
    ...proyectoExistente,
    ...cambios,
    actualizadoEn: new Date().toISOString(),
  })
}

export async function eliminarProyecto(id: string): Promise<{ ok: boolean }> {
  // Futuro backend:
  // return api.delete<{ ok: boolean }>(`/projects/${id}`)

  const existe = proyectosMock.some((proyecto) => proyecto.id === id)
  return Promise.resolve({ ok: existe })
}