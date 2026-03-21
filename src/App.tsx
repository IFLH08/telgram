import { useState } from 'react'
import type { Pagina } from './types'
import { Header } from './components'
import { AuthProvider } from './auth'
import Dashboard from './pages/Dashboard'
import Tareas from './pages/Tareas'
import Reportes from './pages/Reportes'
import Proyectos from './pages/Proyectos'

function AppContenido() {
  const [paginaActual, setPaginaActual] = useState<Pagina>('dashboard')

  const manejarCerrarSesion = () => {
    setPaginaActual('dashboard')
  }

  const renderizarPagina = () => {
    switch (paginaActual) {
      case 'dashboard':
        return <Dashboard />
      case 'tareas':
        return <Tareas />
      case 'reportes':
        return <Reportes />
      case 'proyectos':
        return <Proyectos />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        paginaActual={paginaActual}
        onNavegar={setPaginaActual}
        onCerrarSesion={manejarCerrarSesion}
        cantidadNotificaciones={3}
      />

      <main className="mx-auto max-w-7xl px-6 py-8">
        {renderizarPagina()}
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContenido />
    </AuthProvider>
  )
}