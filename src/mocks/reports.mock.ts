import type { ResumenReporte } from '../types'

export const reportesMock: ResumenReporte[] = [
  {
    id: 'reporte-1',
    titulo: 'Reporte semanal de productividad',
    descripcion: 'Resumen del avance semanal de tareas, tiempos y cumplimiento.',
    periodo: 'Semana 11',
    generadoEn: '2026-03-14T08:00:00Z',
  },
  {
    id: 'reporte-2',
    titulo: 'Resumen mensual de tareas',
    descripcion: 'Concentrado mensual de tareas creadas, completadas y bloqueadas.',
    periodo: 'Marzo 2026',
    generadoEn: '2026-03-13T18:30:00Z',
  },
  {
    id: 'reporte-3',
    titulo: 'Desviación tiempo estimado vs real',
    descripcion: 'Comparativo entre horas estimadas y horas reales por proyecto.',
    periodo: 'Q1 2026',
    generadoEn: '2026-03-10T12:15:00Z',
  },
]