import { useState } from 'react'
import { useAuth } from '../../../auth'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components'
import { PAGE_CONTAINER, TYPO } from '../../../constants/colors'
import { usePortal } from '../context'
import { esAdminPortal } from '../selectors'
import { VelocityChart } from '../components/dashboard/VelocityChart'
import { ThroughputKPI } from '../components/dashboard/ThroughputKPI'
import { BurndownChart } from '../components/dashboard/BurndownChart'
import { CumulativeFlowDiagram } from '../components/dashboard/CumulativeFlowDiagram'
import { CycleTimeScatter } from '../components/dashboard/CycleTimeScatter'
import { BugsHeatmap } from '../components/dashboard/BugsHeatmap'
import { OkrProgress } from '../components/dashboard/OkrProgress'
import { BacklogChart } from '../components/dashboard/BacklogChart'

export default function TequiDashboardPage() {
  const { usuarioActual } = useAuth()
  const { tasks } = usePortal()
  const isAdmin = esAdminPortal(usuarioActual)

  // Métricas derivadas de las tareas del portal
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.estatus === 'completada').length
  const inProgressTasks = tasks.filter(t => t.estatus === 'en_progreso').length
  const pendingTasks = tasks.filter(t => t.estatus === 'pendiente').length

  // Datos para gráficos (simulados basados en tareas)
  const velocityData = [
    { sprint: 'Sprint 1', completed: 12, planned: 15 },
    { sprint: 'Sprint 2', completed: 18, planned: 16 },
    { sprint: 'Sprint 3', completed: 14, planned: 14 },
    { sprint: 'Sprint 4', completed: 20, planned: 18 },
  ]

  const burndownData = [
    { day: 'Día 1', remaining: 20, ideal: 20 },
    { day: 'Día 2', remaining: 18, ideal: 18 },
    { day: 'Día 3', remaining: 15, ideal: 16 },
    { day: 'Día 4', remaining: 12, ideal: 14 },
    { day: 'Día 5', remaining: 8, ideal: 12 },
    { day: 'Día 6', remaining: 5, ideal: 10 },
    { day: 'Día 7', remaining: 2, ideal: 8 },
  ]

  const cycleTimeData = [
    { task: 'T1', cycleTime: 3, completedDate: '2024-01-15' },
    { task: 'T2', cycleTime: 5, completedDate: '2024-01-18' },
    { task: 'T3', cycleTime: 2, completedDate: '2024-01-20' },
    { task: 'T4', cycleTime: 7, completedDate: '2024-01-22' },
    { task: 'T5', cycleTime: 4, completedDate: '2024-01-25' },
  ]

  const bugsData = [
    { day: 'Lun', critical: 2, major: 3, minor: 1 },
    { day: 'Mar', critical: 1, major: 2, minor: 4 },
    { day: 'Mié', critical: 0, major: 4, minor: 2 },
    { day: 'Jue', critical: 3, major: 1, minor: 3 },
    { day: 'Vie', critical: 1, major: 2, minor: 2 },
  ]

  const backlogData = [
    { category: 'Feature', count: 15 },
    { category: 'Bug', count: 8 },
    { category: 'Tech Debt', count: 5 },
    { category: 'Improvement', count: 12 },
  ]

  if (!isAdmin) {
    return (
      <section className={PAGE_CONTAINER}>
        <Card>
          <CardHeader>
            <CardTitle>Acceso Restringido</CardTitle>
            <CardDescription>
              Solo los administradores pueden acceder al Dashboard Tequi.
            </CardDescription>
          </CardHeader>
        </Card>
      </section>
    )
  }

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div>
          <h1 className={TYPO.H1}>Dashboard Tequi</h1>
          <p className={TYPO.BODY_MUTED}>
            Métricas avanzadas de desarrollo y seguimiento de proyectos.
          </p>
        </div>

        {/* KPIs Principales */}
        <div className="grid gap-4 md:grid-cols-4">
          <ThroughputKPI
            title="Total Tareas"
            value={totalTasks}
            trend={+12}
          />
          <ThroughputKPI
            title="Completadas"
            value={completedTasks}
            trend={+8}
          />
          <ThroughputKPI
            title="En Progreso"
            value={inProgressTasks}
            trend={+5}
          />
          <ThroughputKPI
            title="Pendientes"
            value={pendingTasks}
            trend={-3}
          />
        </div>

        {/* Gráficos de Velocidad y Burndown */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Velocidad por Sprint</CardTitle>
              <CardDescription>
                Comparación de historias de usuario completadas vs planificadas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <VelocityChart data={velocityData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Burndown Chart</CardTitle>
              <CardDescription>
                Progreso de trabajo restante vs ideal.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BurndownChart data={burndownData} />
            </CardContent>
          </Card>
        </div>

        {/* Diagramas de Flujo y Cycle Time */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Diagrama de Flujo Acumulado</CardTitle>
              <CardDescription>
                Estado de tareas a lo largo del tiempo.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CumulativeFlowDiagram tasks={tasks} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiempo de Ciclo</CardTitle>
              <CardDescription>
                Días desde inicio hasta completación.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CycleTimeScatter data={cycleTimeData} />
            </CardContent>
          </Card>
        </div>

        {/* Heatmap de Bugs y OKR */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Heatmap de Bugs</CardTitle>
              <CardDescription>
                Distribución de bugs por día de la semana.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BugsHeatmap data={bugsData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progreso OKR</CardTitle>
              <CardDescription>
                Objetivos y resultados clave.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OkrProgress />
            </CardContent>
          </Card>
        </div>

        {/* Backlog Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Composición del Backlog</CardTitle>
            <CardDescription>
              Distribución por tipo de elemento.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BacklogChart data={backlogData} />
          </CardContent>
        </Card>
      </div>
    </section>
  )
}