import type { RolUsuario, Usuario } from '../types'

export interface EstadoAuth {
  usuarioActual: Usuario | null
  cargando: boolean
  estaAutenticado: boolean
}

export interface AuthContextValue extends EstadoAuth {
  rolActual: RolUsuario | null
  refrescarUsuarioActual: () => Promise<void>
  cambiarRolDemo: (rol: RolUsuario) => Promise<void>
  cambiarUsuarioActualDemo: (usuarioId: string) => Promise<void>
}