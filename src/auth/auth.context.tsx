import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cambiarUsuarioActualDemo as cambiarUsuarioActualDemoService, obtenerUsuarioActual } from '../services/auth.service'
import type { Usuario } from '../types'
import type { AuthContextValue } from './auth.types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null)

  const refrescarUsuarioActual = useCallback(async () => {
    try {
      setUsuarioActual(await obtenerUsuarioActual())
    } catch (error) {
      console.error('No se pudo obtener el usuario actual', error)
      setUsuarioActual(null)
    }
  }, [])

  const cambiarUsuarioActualDemo = useCallback(async (usuarioId: string) => {
    try {
      setUsuarioActual(await cambiarUsuarioActualDemoService(usuarioId))
    } catch (error) {
      console.error('No se pudo cambiar el usuario demo', error)
    }
  }, [])

  useEffect(() => {
    void refrescarUsuarioActual()
  }, [refrescarUsuarioActual])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuarioActual,
      cambiarUsuarioActualDemo,
    }),
    [usuarioActual, cambiarUsuarioActualDemo],
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
