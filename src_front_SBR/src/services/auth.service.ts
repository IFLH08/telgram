import { usuarioActualInicialMock, usuariosMock } from '../mocks/users.mock'
import type { Usuario } from '../types'

let usuarioActualDB: Usuario = { ...usuarioActualInicialMock }

const clonarUsuario = (usuario: Usuario): Usuario => ({ ...usuario })

type ApiUsuario = {
  idUsuario: number
  nombre: string
  username?: string
  rol?: {
    nombreRol?: string
  }
  fechaRegistro?: string
}

function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

function mapApiUsuario(usuario: ApiUsuario): Usuario {
  const partes = usuario.nombre.split(' ')
  const rol = usuario.rol?.nombreRol?.toLowerCase() === 'admin' ? 'admin' : 'developer'

  return {
    id: String(usuario.idUsuario),
    nombre: partes[0] ?? usuario.nombre,
    apellido: partes.slice(1).join(' '),
    nombreCompleto: usuario.nombre,
    correo: usuario.username ? `${usuario.username}@devtask.local` : `usuario-${usuario.idUsuario}@devtask.local`,
    rol,
    activo: true,
    avatarUrl: '',
    iniciales: iniciales(usuario.nombre),
    creadoEn: usuario.fechaRegistro ?? new Date().toISOString(),
    actualizadoEn: usuario.fechaRegistro ?? new Date().toISOString(),
  }
}

async function obtenerUsuariosApi(): Promise<Usuario[]> {
  const response = await fetch('/api/usuarios', {
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    throw new Error('No se pudieron cargar los usuarios desde la base de datos.')
  }

  const data = (await response.json()) as ApiUsuario[]
  return data.map(mapApiUsuario)
}

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  return Promise.resolve(clonarUsuario(usuarioActualDB))
}

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  try {
    const usuarios = await obtenerUsuariosApi()
    return usuarios.length > 0 ? usuarios : usuariosMock.map(clonarUsuario)
  } catch {
    return usuariosMock.map(clonarUsuario)
  }
}

export const cambiarUsuarioActualDemo = async (usuarioId: string): Promise<Usuario> => {
  const usuarios = await obtenerUsuarios()
  const usuarioEncontrado = usuarios.find((usuario) => usuario.id === usuarioId)

  if (!usuarioEncontrado) {
    return Promise.resolve(clonarUsuario(usuarioActualDB))
  }

  usuarioActualDB = clonarUsuario(usuarioEncontrado)
  return Promise.resolve(clonarUsuario(usuarioActualDB))
}
