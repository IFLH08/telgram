import type { Usuario } from '../types'

export interface AuthContextValue {
  usuarioActual: Usuario | null
  iniciarSesion: (nombre: string, contrasena: string) => Promise<Usuario>
  cambiarUsuarioActualDemo: (usuarioId: string) => Promise<void>
  cerrarSesion: () => void
}
