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

const DEMO_USER_STORAGE_KEY = 'devtracker.demo.userId'

function leerUsuarioDemoId(): string | null {
  try {
    return window.localStorage.getItem(DEMO_USER_STORAGE_KEY)
  } catch {
    return null
  }
}

function guardarUsuarioDemoId(usuarioId: string) {
  try {
    window.localStorage.setItem(DEMO_USER_STORAGE_KEY, usuarioId)
  } catch {
    // La sesion local es una ayuda de demo; si localStorage falla, seguimos en memoria.
  }
}

function limpiarUsuarioDemoId() {
  try {
    window.localStorage.removeItem(DEMO_USER_STORAGE_KEY)
  } catch {
    // No bloquea el cierre de sesion demo.
  }
}

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

export function obtenerUsuarioDemoSeleccionado(usuarios: Usuario[]): Usuario | null {
  const usuarioDemoId = leerUsuarioDemoId()

  if (!usuarioDemoId) {
    return null
  }

  return usuarios.find((usuario) => usuario.id === usuarioDemoId) ?? null
}

// Demo-only: until real authentication exists, the selector switches the active user
// among records loaded from /api/usuarios instead of using src/mocks/users.mock.ts.
export const cambiarUsuarioActualDemo = async (usuarioId: string): Promise<Usuario> => {
  const usuarios = await obtenerUsuarios()
  const usuarioEncontrado = usuarios.find((usuario) => usuario.id === usuarioId)

  if (!usuarioEncontrado) {
    limpiarUsuarioDemoId()
    throw new Error('El usuario demo seleccionado no existe en /api/usuarios.')
  }

  guardarUsuarioDemoId(usuarioEncontrado.id)
  return { ...usuarioEncontrado }
}

export const cerrarSesionDemo = async (): Promise<void> => {
  limpiarUsuarioDemoId()
}
