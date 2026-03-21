import type { Usuario } from '../types'

export const usuariosMock: Usuario[] = [
  {
    id: 'usuario-admin',
    nombre: 'Admin',
    apellido: 'DevTask',
    nombreCompleto: 'Admin DevTask',
    correo: 'admin@devtask.local',
    rol: 'admin',
    activo: true,
    avatarUrl: '',
    iniciales: 'AD',
    creadoEn: '2026-01-01T00:00:00.000Z',
    actualizadoEn: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usuario-manager',
    nombre: 'Manager',
    apellido: 'DevTask',
    nombreCompleto: 'Manager DevTask',
    correo: 'manager@devtask.local',
    rol: 'manager',
    activo: true,
    avatarUrl: '',
    iniciales: 'MD',
    creadoEn: '2026-01-01T00:00:00.000Z',
    actualizadoEn: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'usuario-developer',
    nombre: 'Developer',
    apellido: 'DevTask',
    nombreCompleto: 'Developer DevTask',
    correo: 'developer@devtask.local',
    rol: 'developer',
    activo: true,
    avatarUrl: '',
    iniciales: 'DD',
    creadoEn: '2026-01-01T00:00:00.000Z',
    actualizadoEn: '2026-01-01T00:00:00.000Z',
  },
]

export const usuarioActualInicialMock: Usuario = usuariosMock[1]