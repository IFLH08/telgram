import { usuarioActualInicialMock, usuariosMock } from '../mocks/users.mock'
import type { RolUsuario, Usuario } from '../types'

let usuarioActualDB: Usuario = { ...usuarioActualInicialMock }

const clonarUsuario = (usuario: Usuario): Usuario => ({ ...usuario })

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  return Promise.resolve(clonarUsuario(usuarioActualDB))
}

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  return Promise.resolve(usuariosMock.map(clonarUsuario))
}

export const cambiarRolDemo = async (rol: RolUsuario): Promise<Usuario> => {
  const usuarioEncontrado = usuariosMock.find((usuario) => usuario.rol === rol)

  if (usuarioEncontrado) {
    usuarioActualDB = clonarUsuario(usuarioEncontrado)
    return Promise.resolve(clonarUsuario(usuarioActualDB))
  }

  usuarioActualDB = {
    ...usuarioActualDB,
    rol,
  }

  return Promise.resolve(clonarUsuario(usuarioActualDB))
}

export const cambiarUsuarioActualDemo = async (usuarioId: string): Promise<Usuario> => {
  const usuarioEncontrado = usuariosMock.find((usuario) => usuario.id === usuarioId)

  if (!usuarioEncontrado) {
    return Promise.resolve(clonarUsuario(usuarioActualDB))
  }

  usuarioActualDB = clonarUsuario(usuarioEncontrado)
  return Promise.resolve(clonarUsuario(usuarioActualDB))
}