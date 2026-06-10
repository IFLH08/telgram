import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  cambiarUsuarioActualDemo as cambiarUsuarioActualDemoService,
  iniciarSesion as iniciarSesionService,
} from '../services/auth.service'
import type { Usuario } from '../types'
import type { AuthContextValue } from './auth.types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null)

  const cambiarUsuarioActualDemo = useCallback(async (usuarioId: string) => {
    try {
      setUsuarioActual(await cambiarUsuarioActualDemoService(usuarioId))
    } catch (error) {
      console.error('No se pudo cambiar el usuario demo', error)
    }
  }, [])

  const iniciarSesion = useCallback(async (nombre: string, contrasena: string) => {
    const usuario = await iniciarSesionService(nombre, contrasena)
    setUsuarioActual(usuario)
    return usuario
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuarioActual,
      iniciarSesion,
      cambiarUsuarioActualDemo,
    }),
    [usuarioActual, iniciarSesion, cambiarUsuarioActualDemo],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
