import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import {
  cambiarUsuarioActualDemo as cambiarUsuarioActualDemoService,
  iniciarSesion as iniciarSesionService,
} from '../services/auth.service'
import type { Usuario } from '../types'
import type { AuthContextValue } from './auth.types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)
const AUTH_STORAGE_KEY = 'devtracker.usuarioActual'

interface AuthProviderProps {
  children: ReactNode
}

function obtenerUsuarioGuardado() {
  try {
    const rawValue = window.localStorage.getItem(AUTH_STORAGE_KEY)

    return rawValue ? (JSON.parse(rawValue) as Usuario) : null
  } catch {
    return null
  }
}

function guardarUsuario(usuario: Usuario) {
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(usuario))
}

function limpiarUsuarioGuardado() {
  window.localStorage.removeItem(AUTH_STORAGE_KEY)
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [usuarioActual, setUsuarioActual] = useState<Usuario | null>(() => obtenerUsuarioGuardado())

  const cambiarUsuarioActualDemo = useCallback(async (usuarioId: string) => {
    try {
      const usuario = await cambiarUsuarioActualDemoService(usuarioId)
      guardarUsuario(usuario)
      setUsuarioActual(usuario)
    } catch (error) {
      console.error('No se pudo cambiar el usuario demo', error)
    }
  }, [])

  const iniciarSesion = useCallback(async (nombre: string, contrasena: string) => {
    const usuario = await iniciarSesionService(nombre, contrasena)
    guardarUsuario(usuario)
    setUsuarioActual(usuario)
    return usuario
  }, [])

  const cerrarSesion = useCallback(() => {
    limpiarUsuarioGuardado()
    setUsuarioActual(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      usuarioActual,
      iniciarSesion,
      cambiarUsuarioActualDemo,
      cerrarSesion,
    }),
    [usuarioActual, iniciarSesion, cambiarUsuarioActualDemo, cerrarSesion],
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
