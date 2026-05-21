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

export default function App() {
  if (window.location.pathname === '/dashboard' || window.location.pathname === '/dashboard/') {
    return <DashboardPage />
  }


  return (
    <AuthProvider>
      <PortalProvider>
        <AppContenido />
      </PortalProvider>
    </AuthProvider>
  )
}
