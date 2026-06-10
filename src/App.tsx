import { useState } from 'react'
import type { Pagina } from './types'
import { AuthProvider } from './auth'
import { PortalProvider, usePortal } from './features/portal'
import PortalHeader from './features/portal/components/PortalHeader'
import TasksPage from './features/portal/pages/TasksPage'
import ProjectsPage from './features/portal/pages/ProjectsPage'
import AccessCodesPage from './features/portal/pages/AccessCodesPage'
import DashboardPage from './features/portal/pages/DashboardPage'
import { useAuth } from './auth'
import LoginPage from './auth/LoginPage'
import { obtenerNotificacionesUsuario } from './features/portal/selectors'
import { ALERT, LAYOUT, cx } from './constants/colors'

function AppContenido() {
  const [paginaActual, setPaginaActual] = useState<Pagina>('dashboard')
  const { usuarioActual } = useAuth()
  const { loadError, notifications, tasks } = usePortal()

  const notificaciones = obtenerNotificacionesUsuario(
    usuarioActual,
    notifications,
    tasks,
  )

  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'tareas':
        return <TasksPage />
      case 'proyectos':
        return <ProjectsPage />
      case 'codigos':
        return <AccessCodesPage />
      case 'dashboard':
        return <DashboardPage />
      default:
        return <DashboardPage />
    }
  }

  return (
    <div className="portal-visual-root min-h-screen bg-white text-[#161513]">
      <PortalHeader
        currentPage={paginaActual}
        onNavigate={setPaginaActual}
        notifications={notificaciones}
      />

      <main className="pb-10">
        {loadError && (
          <div className={cx(LAYOUT.PAGE_CONTAINER, 'pb-0')}>
            <div className={cx(ALERT.BASE, ALERT.DANGER)}>
              {loadError}
            </div>
          </div>
        )}
        {renderizarPagina()}
      </main>
    </div>
  )
}

function AppAutenticada() {
  const { usuarioActual, cargando } = useAuth()

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#161513]">
        Cargando usuarios reales...
      </div>
    )
  }

  if (!usuarioActual) {
    return <LoginPage />
  }

  return (
    <PortalProvider>
      <AppContenido />
    </PortalProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppAutenticada />
    </AuthProvider>
  )
}
