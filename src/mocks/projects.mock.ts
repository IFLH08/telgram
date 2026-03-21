import type { Proyecto } from '../types'

export const proyectosMock: Proyecto[] = [
  {
    id: 'proyecto-1',
    nombre: 'Dev Admin',
    descripcion: 'Portal administrativo para gestión interna del equipo.',
    estado: 'activo',
    responsableId: 'usuario-3',
    responsableNombre: 'José Ángel Alemán',
    creadoEn: '2026-03-01T09:00:00Z',
    actualizadoEn: '2026-03-14T10:00:00Z',
  },
  {
    id: 'proyecto-2',
    nombre: 'Portal Comercial',
    descripcion: 'Módulo comercial para propuestas y seguimiento con clientes.',
    estado: 'activo',
    responsableId: 'usuario-1',
    responsableNombre: 'Omar Caballero',
    creadoEn: '2026-02-20T11:30:00Z',
    actualizadoEn: '2026-03-13T16:45:00Z',
  },
  {
    id: 'proyecto-3',
    nombre: 'Automatización Reportes',
    descripcion: 'Automatización de generación y consulta de reportes ejecutivos.',
    estado: 'pausado',
    responsableId: 'usuario-2',
    responsableNombre: 'Nicolás Alfaro',
    creadoEn: '2026-02-10T14:15:00Z',
    actualizadoEn: '2026-03-12T12:20:00Z',
  },
]