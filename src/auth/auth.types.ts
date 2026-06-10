import type { Usuario } from '../types'

export interface AuthContextValue {
  usuarioActual: Usuario | null
  usuarios: Usuario[]
  cargando: boolean
  error: string | null
  cambiarUsuarioActualDemo: (usuarioId: string) => Promise<void>
  cerrarSesionDemo: () => Promise<void>
  refrescarUsuarioActual: () => Promise<void>
}
