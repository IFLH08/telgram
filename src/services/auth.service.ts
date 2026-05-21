import type { Usuario } from '../types'

type ApiRol = {
  idRol?: number
  nombreRol?: string
}

type ApiUsuario = {
  idUsuario: number
  telegramId?: number
  nombre?: string
  username?: string
  rol?: ApiRol
  fechaRegistro?: string
}

let usuarioActualDemoId: string | null = null

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const errorText = await response.text()
    let message = `Error al consumir ${url} (${response.status}).`

    if (errorText) {
      try {
        const errorJson = JSON.parse(errorText) as { error?: string; message?: string }
        message = errorJson.error ?? errorJson.message ?? message
      } catch {
        message = errorText
      }
    }

    throw new Error(message)
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

function normalizarRol(rol?: ApiRol): Usuario['rol'] {
  const nombreRol = rol?.nombreRol?.trim().toLowerCase() ?? ''
  return nombreRol.includes('admin') ? 'admin' : 'developer'
}

function obtenerIniciales(nombreCompleto: string) {
  return nombreCompleto
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? '')
    .join('')
}

function mapUsuarioApi(usuario: ApiUsuario): Usuario {
  const nombreCompleto =
    usuario.nombre?.trim() || usuario.username?.trim() || `Usuario ${usuario.idUsuario}`
  const fechaRegistro = usuario.fechaRegistro ?? new Date().toISOString()

  return {
    id: String(usuario.idUsuario),
    nombre: nombreCompleto,
    apellido: '',
    nombreCompleto,
    correo: usuario.username ?? '',
    rol: normalizarRol(usuario.rol),
    activo: true,
    avatarUrl: '',
    iniciales: obtenerIniciales(nombreCompleto),
    creadoEn: fechaRegistro,
    actualizadoEn: fechaRegistro,
  }
}

export const obtenerUsuarios = async (): Promise<Usuario[]> => {
  const usuarios = await fetchJson<ApiUsuario[]>('/api/usuarios')
  return usuarios.map(mapUsuarioApi)
}

export const obtenerUsuarioActual = async (): Promise<Usuario> => {
  const usuarios = await obtenerUsuarios()
  const usuarioSeleccionado = usuarios.find((usuario) => usuario.id === usuarioActualDemoId)
  const usuarioInicial =
    usuarioSeleccionado ??
    usuarios.find((usuario) => usuario.rol === 'admin') ??
    usuarios[0]

  if (!usuarioInicial) {
    throw new Error('No hay usuarios reales disponibles en /api/usuarios.')
  }

  usuarioActualDemoId = usuarioInicial.id
  return { ...usuarioInicial }
}

// Demo-only: until real authentication exists, the selector switches the active user
// among records loaded from /api/usuarios instead of using src/mocks/users.mock.ts.
export const cambiarUsuarioActualDemo = async (usuarioId: string): Promise<Usuario> => {
  const usuarios = await obtenerUsuarios()
  const usuarioEncontrado = usuarios.find((usuario) => usuario.id === usuarioId)

  if (!usuarioEncontrado) {
    return obtenerUsuarioActual()
  }

  usuarioActualDemoId = usuarioEncontrado.id
  return { ...usuarioEncontrado }
}
