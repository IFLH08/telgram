import { useState } from 'react'
import type { Pagina } from './types'
import { AuthProvider } from './auth'
import { PortalProvider, usePortal } from './features/portal'
import PortalHeader from './features/portal/components/PortalHeader'
import DashboardPage from './features/portal/pages/DashboardPage'
import TasksPage from './features/portal/pages/TasksPage'
import ProjectsPage from './features/portal/pages/ProjectsPage'
import AccessCodesPage from './features/portal/pages/AccessCodesPage'
import { useAuth } from './auth'
import { obtenerNotificacionesUsuario } from './features/portal/selectors'

function AppContenido() {
  const [paginaActual, setPaginaActual] = useState<Pagina>('dashboard')
  const { usuarioActual } = useAuth()
  const { notifications, tasks } = usePortal()

  const notificaciones = obtenerNotificacionesUsuario(
    usuarioActual,
    notifications,
    tasks,
  )

  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'dashboard':
        return <DashboardPage />
      case 'tareas':
        return <TasksPage />
      case 'proyectos':
        return <ProjectsPage />
      case 'codigos':
        return <AccessCodesPage />
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
        {renderizarPagina()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <PortalProvider>
        <AppContenido />
      </PortalProvider>
    </AuthProvider>
  )
}
