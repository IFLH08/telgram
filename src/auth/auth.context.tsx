import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { cambiarRolDemo as cambiarRolDemoService, cambiarUsuarioActualDemo as cambiarUsuarioActualDemoService, obtenerUsuarioActual } from '../services/auth.service'
import type { AuthContextValue, EstadoAuth } from './auth.types'
import type { RolUsuario } from '../types'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

const estadoInicial: EstadoAuth = {
  usuarioActual: null,
  cargando: true,
  estaAutenticado: false,
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [estado, setEstado] = useState<EstadoAuth>(estadoInicial)

  const refrescarUsuarioActual = useCallback(async () => {
    setEstado((anterior) => ({
      ...anterior,
      cargando: true,
    }))

    try {
      const usuario = await obtenerUsuarioActual()

      setEstado({
        usuarioActual: usuario,
        cargando: false,
        estaAutenticado: Boolean(usuario),
      })
    } catch (error) {
      console.error('No se pudo obtener el usuario actual', error)

      setEstado({
        usuarioActual: null,
        cargando: false,
        estaAutenticado: false,
      })
    }
  }, [])

  const cambiarRolDemo = useCallback(async (rol: RolUsuario) => {
    setEstado((anterior) => ({
      ...anterior,
      cargando: true,
    }))

    try {
      const usuario = await cambiarRolDemoService(rol)

      setEstado({
        usuarioActual: usuario,
        cargando: false,
        estaAutenticado: true,
      })
    } catch (error) {
      console.error('No se pudo cambiar el rol demo', error)

      setEstado((anterior) => ({
        ...anterior,
        cargando: false,
      }))
    }
  }, [])

  const cambiarUsuarioActualDemo = useCallback(async (usuarioId: string) => {
    setEstado((anterior) => ({
      ...anterior,
      cargando: true,
    }))

    try {
      const usuario = await cambiarUsuarioActualDemoService(usuarioId)

      setEstado({
        usuarioActual: usuario,
        cargando: false,
        estaAutenticado: true,
      })
    } catch (error) {
      console.error('No se pudo cambiar el usuario demo', error)

      setEstado((anterior) => ({
        ...anterior,
        cargando: false,
      }))
    }
  }, [])

  useEffect(() => {
    void refrescarUsuarioActual()
  }, [refrescarUsuarioActual])

  const value = useMemo<AuthContextValue>(
    () => ({
      ...estado,
      rolActual: estado.usuarioActual?.rol ?? null,
      refrescarUsuarioActual,
      cambiarRolDemo,
      cambiarUsuarioActualDemo,
    }),
    [estado, refrescarUsuarioActual, cambiarRolDemo, cambiarUsuarioActualDemo],
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