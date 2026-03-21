import type { ResumenReporte } from '../types'
import { reportesMock } from '../mocks/reports.mock'
// import { api } from './api'

export async function obtenerReportes(): Promise<ResumenReporte[]> {
  // Cuando se conecte a backend:
  // const respuesta = await api.get<{ data: ResumenReporte[] }>('/reports')
  // return respuesta.data

  return Promise.resolve(reportesMock)
}

export async function obtenerReportePorId(
  id: string
): Promise<ResumenReporte | undefined> {
  // Futuro backend:
  // const respuesta = await api.get<{ data: ResumenReporte }>(`/reports/${id}`)
  // return respuesta.data

  return Promise.resolve(reportesMock.find((reporte) => reporte.id === id))
}