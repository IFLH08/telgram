import type { RespuestaListaAPI, Tarea } from '../types'
import { tareasMock } from '../mocks/tasks.mock'
// import { api } from './api'

export async function obtenerTareas(): Promise<Tarea[]> {
  // Cuando se conecte a backend, reemplazar por:
  // const respuesta = await api.get<RespuestaListaAPI<Tarea>>('/tasks')
  // return respuesta.data

  return Promise.resolve(tareasMock)
}

export async function obtenerTareaPorId(id: string): Promise<Tarea | undefined> {
  // Futuro backend:
  // const respuesta = await api.get<{ data: Tarea }>(`/tasks/${id}`)
  // return respuesta.data

  return Promise.resolve(tareasMock.find((tarea) => tarea.id === id))
}

export async function crearTarea(payload: Partial<Tarea>): Promise<Tarea> {
  // Futuro backend:
  // return api.post<Tarea>('/tasks', payload)

  const nuevaTarea: Tarea = {
    id: `tarea-${Date.now()}`,
    titulo: payload.titulo || 'Nueva tarea',
    subtitulo: payload.subtitulo,
    descripcion: payload.descripcion,
    estado: payload.estado || 'pendiente',
    prioridad: payload.prioridad || 'media',
    categoria: payload.categoria,
    responsableId: payload.responsableId,
    responsableNombre: payload.responsableNombre,
    proyectoId: payload.proyectoId,
    proyectoNombre: payload.proyectoNombre,
    fechaLimite: payload.fechaLimite,
    horasEstimadas: payload.horasEstimadas,
    horasReales: payload.horasReales ?? 0,
    origen: payload.origen || 'manual',
    creadoEn: new Date().toISOString(),
    actualizadoEn: new Date().toISOString(),
  }

  return Promise.resolve(nuevaTarea)
}

export async function actualizarTarea(
  id: string,
  cambios: Partial<Tarea>
): Promise<Tarea | undefined> {
  // Futuro backend:
  // return api.put<Tarea>(`/tasks/${id}`, cambios)

  const tareaExistente = tareasMock.find((tarea) => tarea.id === id)

  if (!tareaExistente) {
    return Promise.resolve(undefined)
  }

  return Promise.resolve({
    ...tareaExistente,
    ...cambios,
    actualizadoEn: new Date().toISOString(),
  })
}

export async function eliminarTarea(id: string): Promise<{ ok: boolean }> {
  // Futuro backend:
  // return api.delete<{ ok: boolean }>(`/tasks/${id}`)

  const existe = tareasMock.some((tarea) => tarea.id === id)
  return Promise.resolve({ ok: existe })
}