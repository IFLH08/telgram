import type { Usuario } from '../types'

export interface AuthContextValue {
  usuarioActual: Usuario | null
  cambiarUsuarioActualDemo: (usuarioId: string) => Promise<void>
}
