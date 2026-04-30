import { useMemo, useState } from 'react'
import { useAuth } from '../../../auth'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components'
import { ALERT, PAGE_CONTAINER, SELECT, TYPO, cx } from '../../../constants/colors'
import { usePortal } from '../context'
import {
  calcularKpisDashboard,
  calcularMetricasPersonales,
  esAdminPortal,
  estaPorVencer,
  filtrarTareasPorPeriodo,
  formatearFecha,
  obtenerNotificacionesUsuario,
  obtenerProyectosVisibles,
  obtenerSprintsVisibles,
  obtenerTareasVisibles,
} from '../selectors'
import type { DashboardPeriod } from '../types'

function DashboardFilters({
  currentPeriod,
  currentProjectId,
  onChangePeriod,
  onChangeProject,
  projectOptions,
}: {
  currentPeriod: DashboardPeriod
  currentProjectId: string
  onChangePeriod: (value: DashboardPeriod) => void
  onChangeProject: (value: string) => void
  projectOptions: Array<{ id: string; nombre: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de KPIs</CardTitle>
        <CardDescription>
          Consulta indicadores por proyecto y periodo de desarrollo.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="dashboard-project-filter" className={TYPO.LABEL}>Proyecto</label>
            <select
              id="dashboard-project-filter"
              value={currentProjectId}
              onChange={(event) => onChangeProject(event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="todos">Todos los proyectos</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dashboard-period-filter" className={TYPO.LABEL}>Periodo</label>
            <select
              id="dashboard-period-filter"
              value={currentPeriod}
              onChange={(event) => onChangePeriod(event.target.value as DashboardPeriod)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="7d">Ultimos 7 dias</option>
              <option value="15d">Ultimos 15 dias</option>
              <option value="30d">Ultimos 30 dias</option>
              <option value="sprint">Sprint actual</option>
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { usuarioActual } = useAuth()
  const { memberships, notifications, projects, sprints, tasks } = usePortal()
  const isAdmin = esAdminPortal(usuarioActual)

  const [projectIdFilter, setProjectIdFilter] = useState('todos')
  const [periodFilter, setPeriodFilter] = useState<DashboardPeriod>('sprint')

  const visibleProjects = useMemo(() => {
    return obtenerProyectosVisibles(usuarioActual, projects, memberships, tasks)
  }, [usuarioActual, projects, memberships, tasks])

  const visibleTasks = useMemo(() => {
    return obtenerTareasVisibles(usuarioActual, tasks, memberships, projects)
  }, [usuarioActual, tasks, memberships, projects])

  const visibleSprints = useMemo(() => {
    return obtenerSprintsVisibles(usuarioActual, sprints, projects, memberships, tasks)
  }, [usuarioActual, sprints, projects, memberships, tasks])

  const dashboardTasks = useMemo(() => {
    const byProject =
      projectIdFilter === 'todos'
        ? visibleTasks
        : visibleTasks.filter((task) => task.proyectoId === projectIdFilter)

    return filtrarTareasPorPeriodo(byProject, periodFilter)
  }, [periodFilter, projectIdFilter, visibleTasks])

  const adminMetrics = useMemo(() => {
    return calcularKpisDashboard(dashboardTasks)
  }, [dashboardTasks])

  const personalMetrics = useMemo(() => {
    return calcularMetricasPersonales(visibleTasks)
  }, [visibleTasks])

  const alerts = useMemo(() => {
    return obtenerNotificacionesUsuario(usuarioActual, notifications, visibleTasks)
  }, [usuarioActual, notifications, visibleTasks])

  const upcomingTasks = useMemo(() => {
    const source = isAdmin ? dashboardTasks : visibleTasks

    return source
      .filter((task) => estaPorVencer(task.fechaEntrega, 7))
      .sort((left, right) => left.fechaEntrega.localeCompare(right.fechaEntrega))
      .slice(0, 5)
  }, [dashboardTasks, isAdmin, visibleTasks])

  return (
    <section className={PAGE_CONTAINER}>
      <div className="space-y-6">
        <div>
          <h1 className={TYPO.H1}>Dashboard</h1>
          <p className={TYPO.BODY_MUTED}>
            Vista operativa alineada con el esquema SQL de proyectos, sprints, tareas y
            notificaciones.
          </p>
        </div>

        {isAdmin && (
          <DashboardFilters
            currentPeriod={periodFilter}
            currentProjectId={projectIdFilter}
            onChangePeriod={setPeriodFilter}
            onChangeProject={setProjectIdFilter}
            projectOptions={visibleProjects}
          />
        )}

        {isAdmin ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardDescription>Tareas activas</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {adminMetrics.totalTareas}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Porcentaje completadas</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {adminMetrics.porcentajeCompletadas}%
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Proyectos visibles</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {visibleProjects.length}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Sprints visibles</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {visibleSprints.length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total de tareas por estado</CardTitle>
                  <CardDescription>
                    Conteo equivalente a la consulta SQL por estado de tarea.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {adminMetrics.tareasPorEstado.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                      >
                        <p className={cx(TYPO.BODY, 'font-semibold')}>{item.etiqueta}</p>
                        <Badge variante="brand">{item.total}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Total de tareas por sprint</CardTitle>
                  <CardDescription>
                    Agrupacion por sprint tomando el proyecto y sprint de cada tarea.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {adminMetrics.tareasPorSprint.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                      >
                        <p className={cx(TYPO.BODY, 'font-semibold')}>{item.etiqueta}</p>
                        <Badge variante="info">{item.total}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Tareas completadas por sprint</CardTitle>
                  <CardDescription>
                    Conteo de tareas completadas replicando la consulta KPI compartida.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {adminMetrics.completadasPorSprint.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3"
                      >
                        <p className={cx(TYPO.BODY, 'font-semibold')}>{item.etiqueta}</p>
                        <Badge variante="success">{item.total}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proximas fechas de entrega</CardTitle>
                  <CardDescription>
                    Tareas del periodo actual que requieren seguimiento cercano.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {upcomingTasks.length === 0 && (
                      <p className={TYPO.BODY_MUTED}>
                        No hay tareas por vencer dentro del periodo actual.
                      </p>
                    )}

                    {upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className={cx(TYPO.BODY, 'font-semibold')}>{task.nombre}</p>
                            <Badge variante={estaPorVencer(task.fechaEntrega, 3) ? 'danger' : 'warning'}>
                              {formatearFecha(task.fechaEntrega)}
                            </Badge>
                          </div>

                          <p className={TYPO.CAPTION}>
                            {task.proyectoNombre} · {task.sprintNombre} · {task.personaAsignadaNombre}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader>
                  <CardDescription>Mis tareas</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {personalMetrics.total}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Pendientes</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {personalMetrics.pendientes}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>En progreso</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {personalMetrics.enProgreso}
                  </CardTitle>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader>
                  <CardDescription>Proximas a vencer</CardDescription>
                  <CardTitle className={cx('mt-2', TYPO.METRIC)}>
                    {personalMetrics.proximasAVencer}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Mis alertas operativas</CardTitle>
                  <CardDescription>
                    Notificaciones y recordatorios generados a partir de tareas activas.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {alerts.length === 0 && (
                      <p className={TYPO.BODY_MUTED}>
                        No tienes alertas relevantes en este momento.
                      </p>
                    )}

                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={cx(
                          ALERT.BASE,
                          alert.tipo === 'alerta'
                            ? ALERT.DANGER
                            : alert.tipo === 'success'
                              ? ALERT.SUCCESS
                              : ALERT.INFO,
                        )}
                      >
                        <p className="font-medium">{alert.titulo}</p>
                        <p className="mt-1">{alert.mensaje}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Proximas fechas de entrega</CardTitle>
                  <CardDescription>
                    Tareas asignadas con vencimiento cercano en tus sprints visibles.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {upcomingTasks.length === 0 && (
                      <p className={TYPO.BODY_MUTED}>
                        No hay tareas por vencer durante los proximos dias.
                      </p>
                    )}

                    {upcomingTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-gray-200 bg-white p-4"
                      >
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <p className={cx(TYPO.BODY, 'font-semibold')}>{task.nombre}</p>
                            <Badge variante={estaPorVencer(task.fechaEntrega, 3) ? 'danger' : 'warning'}>
                              {formatearFecha(task.fechaEntrega)}
                            </Badge>
                          </div>

                          <p className={TYPO.CAPTION}>
                            {task.proyectoNombre} · {task.sprintNombre}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
