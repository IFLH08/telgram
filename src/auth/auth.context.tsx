import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  cambiarUsuarioActualDemo as cambiarUsuarioActualDemoService,
  cerrarSesionDemo as cerrarSesionDemoService,
  obtenerUsuarioDemoSeleccionado,
  obtenerUsuarios,
} from '../services/auth.service'
import type { Usuario } from '../types'
import type { AuthContextValue } from './auth.types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(null)
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refrescarUsuarioActual = useCallback(async () => {
    setCargando(true)
    setError(null)

    try {
      const usuariosReales = await obtenerUsuarios()
      setUsuarios(usuariosReales)
      setUsuarioActual(obtenerUsuarioDemoSeleccionado(usuariosReales))
    } catch (caughtError) {
      console.error('No se pudieron cargar los usuarios reales', caughtError)
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudieron cargar los usuarios reales.',
      )
      setUsuarios([])
      setUsuarioActual(null)
    } finally {
      setCargando(false)
    }
  }, [])

  const cambiarUsuarioActualDemo = useCallback(async (usuarioId: string) => {
    try {
      setUsuarioActual(await cambiarUsuarioActualDemoService(usuarioId))
      setError(null)
    } catch (caughtError) {
      console.error('No se pudo cambiar el usuario demo', caughtError)
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'No se pudo cambiar el usuario demo.',
      )
    }
  }, [])

  const cerrarSesionDemo = useCallback(async () => {
    await cerrarSesionDemoService()
    setUsuarioActual(null)
  }, [])

  useEffect(() => {
    void refrescarUsuarioActual()
  }, [refrescarUsuarioActual])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuarioActual,
      usuarios,
      cargando,
      error,
      cambiarUsuarioActualDemo,
      cerrarSesionDemo,
      refrescarUsuarioActual,
    }),
    [
      usuarioActual,
      usuarios,
      cargando,
      error,
      cambiarUsuarioActualDemo,
      cerrarSesionDemo,
      refrescarUsuarioActual,
    ],
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
