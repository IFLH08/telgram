import { useEffect, useMemo, useState } from 'react'
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
  calcularMetricasPersonales,
  construirMetricasDeveloperSprint,
  esAdminPortal,
  estaPorVencer,
  filtrarTareasPorPeriodo,
  formatearFecha,
  obtenerNotificacionesUsuario,
  obtenerProyectosVisibles,
  obtenerTareasVisibles,
} from '../selectors'
import {
  obtenerDashboardMetrics,
  obtenerSprintDeveloperMetrics,
  type PortalDashboardMetric,
  type PortalSprintDeveloperMetric,
} from '../service'
import type { DashboardPeriod } from '../types'

function DashboardFilters({
  currentPeriod,
  currentProjectId,
  currentSprintId,
  currentDeveloperId,
  onChangePeriod,
  onChangeProject,
  onChangeSprint,
  onChangeDeveloper,
  projectOptions,
  sprintOptions,
  developerOptions,
}: {
  currentPeriod: DashboardPeriod
  currentProjectId: string
  currentSprintId: string
  currentDeveloperId: string
  onChangePeriod: (value: DashboardPeriod) => void
  onChangeProject: (value: string) => void
  onChangeSprint: (value: string) => void
  onChangeDeveloper: (value: string) => void
  projectOptions: Array<{ id: string; nombre: string }>
  sprintOptions: Array<{ id: string; nombre: string }>
  developerOptions: Array<{ id: string; nombre: string }>
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros de KPIs</CardTitle>
        <CardDescription>
          Ajusta el alcance de las tareas operativas del dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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

          <div>
            <label htmlFor="dashboard-sprint-filter" className={TYPO.LABEL}>Sprint</label>
            <select
              id="dashboard-sprint-filter"
              value={currentSprintId}
              onChange={(event) => onChangeSprint(event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="todos">Todos los sprints</option>
              {sprintOptions.map((sprint) => (
                <option key={sprint.id} value={sprint.id}>
                  {sprint.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dashboard-developer-filter" className={TYPO.LABEL}>Developer</label>
            <select
              id="dashboard-developer-filter"
              value={currentDeveloperId}
              onChange={(event) => onChangeDeveloper(event.target.value)}
              className={cx(SELECT.BASE, SELECT.DEFAULT, 'mt-2')}
            >
              <option value="todos">Todos los developers</option>
              {developerOptions.map((dev) => (
                <option key={dev.id} value={dev.id}>
                  {dev.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const CHART_COLORS = [
  '#3B77B6',
  '#F18631',
  '#4FA23F',
  '#C73532',
  '#8D6AB8',
  '#7A7A7A',
  '#B7A238',
  '#48A4A6',
]

function formatearNumero(valor: number, decimals = 0) {
  return valor.toLocaleString('es-MX', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  })
}

function calcularMediana(values: number[]) {
  if (values.length === 0) {
    return 0
  }

  const sorted = [...values].sort((left, right) => left - right)
  const middle = Math.floor(sorted.length / 2)

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle]
}

function KpiCard({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className={cx('mt-2', TYPO.METRIC)}>{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function DeveloperSprintBars({
  description,
  rows,
  series,
  title,
  unit,
  xAxisLabel,
  yAxisLabel,
}: {
  description: string
  rows: ReturnType<typeof construirMetricasDeveloperSprint>['completedBySprint']
  series: ReturnType<typeof construirMetricasDeveloperSprint>['series']
  title: string
  unit: 'tasks' | 'hrs'
  xAxisLabel: string
  yAxisLabel: string
}) {
  const chartWidth = 920
  const chartHeight = 460
  const margin = { bottom: 58, left: 72, right: 28, top: 28 }
  const plotWidth = chartWidth - margin.left - margin.right
  const plotHeight = chartHeight - margin.top - margin.bottom
  const values = rows.flatMap((row) => series.map((developer) => row.values[developer.key] ?? 0))
  const maxValue = Math.max(...values, 1)
  const niceMax = Math.ceil(maxValue / 5) * 5 || 5
  const groupWidth = rows.length > 0 ? plotWidth / rows.length : plotWidth
  const barGap = 6
  const barWidth = Math.max(
    10,
    Math.min(44, (groupWidth * 0.72 - barGap * Math.max(series.length - 1, 0)) / Math.max(series.length, 1)),
  )
  const tickCount = 5
  const decimals = unit === 'hrs' ? 1 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent>
        {rows.length === 0 ? (
          <p className={TYPO.BODY_MUTED}>No hay datos reales para graficar.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex flex-wrap gap-4">
              {series.map((developer, index) => (
                <div key={developer.key} className="flex items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="h-3 w-3 rounded-sm"
                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                  />
                  <span className={TYPO.CAPTION}>{developer.label}</span>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <svg
                className="min-w-[760px]"
                role="img"
                aria-label={title}
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              >
                <rect width={chartWidth} height={chartHeight} fill="#ffffff" />
                <line
                  x1={margin.left}
                  x2={margin.left}
                  y1={margin.top}
                  y2={margin.top + plotHeight}
                  stroke="#4b5563"
                  strokeWidth="1.5"
                />
                <line
                  x1={margin.left}
                  x2={margin.left + plotWidth}
                  y1={margin.top + plotHeight}
                  y2={margin.top + plotHeight}
                  stroke="#4b5563"
                  strokeWidth="1.5"
                />

                {Array.from({ length: tickCount + 1 }).map((_, tick) => {
                  const value = (niceMax / tickCount) * tick
                  const y = margin.top + plotHeight - (value / niceMax) * plotHeight

                  return (
                    <g key={value}>
                      <line
                        x1={margin.left - 6}
                        x2={margin.left}
                        y1={y}
                        y2={y}
                        stroke="#4b5563"
                      />
                      <line
                        x1={margin.left}
                        x2={margin.left + plotWidth}
                        y1={y}
                        y2={y}
                        stroke="#e5e7eb"
                      />
                      <text
                        fill="#374151"
                        fontSize="13"
                        textAnchor="end"
                        x={margin.left - 12}
                        y={y + 4}
                      >
                        {formatearNumero(value, decimals)}
                      </text>
                    </g>
                  )
                })}

                {rows.map((row, rowIndex) => {
                  const groupX = margin.left + rowIndex * groupWidth
                  const barsWidth = series.length * barWidth + (series.length - 1) * barGap
                  const startX = groupX + (groupWidth - barsWidth) / 2
                  const labelX = groupX + groupWidth / 2

                  return (
                    <g key={row.sprintId}>
                      {series.map((developer, index) => {
                        const value = row.values[developer.key] ?? 0
                        const height = (value / niceMax) * plotHeight
                        const x = startX + index * (barWidth + barGap)
                        const y = margin.top + plotHeight - height

                        return (
                          <rect
                            key={developer.key}
                            fill={CHART_COLORS[index % CHART_COLORS.length]}
                            height={height}
                            rx="1"
                            width={barWidth}
                            x={x}
                            y={y}
                          >
                            <title>
                              {`${row.sprint} - ${developer.label}: ${formatearNumero(value, decimals)} ${unit}`}
                            </title>
                          </rect>
                        )
                      })}
                      <text
                        fill="#374151"
                        fontSize="14"
                        fontWeight="600"
                        textAnchor="middle"
                        x={labelX}
                        y={margin.top + plotHeight + 28}
                      >
                        {row.sprint}
                      </text>
                    </g>
                  )
                })}

                <text
                  fill="#374151"
                  fontSize="14"
                  fontWeight="600"
                  textAnchor="middle"
                  x={margin.left + plotWidth / 2}
                  y={chartHeight - 10}
                >
                  {xAxisLabel}
                </text>
                <text
                  fill="#374151"
                  fontSize="14"
                  fontWeight="600"
                  textAnchor="middle"
                  transform={`rotate(-90 ${18} ${margin.top + plotHeight / 2})`}
                  x={18}
                  y={margin.top + plotHeight / 2}
                >
                  {yAxisLabel}
                </text>
              </svg>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DashboardMetricsList({ metrics }: { metrics: PortalDashboardMetric[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>KPIs registrados</CardTitle>
        <CardDescription>
          Datos consumidos desde /api/dashboard/metrics.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {metrics.length === 0 && (
            <p className={TYPO.BODY_MUTED}>No hay KPIs registrados en la base de datos.</p>
          )}

          {metrics.map((metric) => (
            <div
              key={metric.id}
              className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-3 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <p className={cx(TYPO.BODY, 'font-semibold')}>{metric.nombreKpi}</p>
                <p className={TYPO.CAPTION}>
                  {metric.proyectoNombre}
                  {metric.sprintNombre ? ` - ${metric.sprintNombre}` : ''}
                </p>
              </div>
              <Badge variante="brand">{formatearNumero(metric.valor, 2)}</Badge>
            </div>
          ))}
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
  const [sprintIdFilter, setSprintIdFilter] = useState('todos')
  const [developerIdFilter, setDeveloperIdFilter] = useState('todos')
  const [dashboardMetrics, setDashboardMetrics] = useState<PortalDashboardMetric[]>([])
  const [sprintDeveloperMetrics, setSprintDeveloperMetrics] = useState<
    PortalSprintDeveloperMetric[]
  >([])
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAdmin) {
      setDashboardMetrics([])
      setSprintDeveloperMetrics([])
      return
    }

    let active = true

    async function cargarMetricasReales() {
      setMetricsLoading(true)
      setMetricsError(null)

      try {
        const sprintParam = sprintIdFilter !== 'todos' ? sprintIdFilter : undefined
        const developerParam = developerIdFilter !== 'todos' ? developerIdFilter : undefined

        const [metrics, developerMetrics] = await Promise.all([
          obtenerDashboardMetrics(),
          obtenerSprintDeveloperMetrics(sprintParam, developerParam),
        ])

        if (active) {
          setDashboardMetrics(metrics)
          setSprintDeveloperMetrics(developerMetrics)
        }
      } catch (error) {
        if (active) {
          setMetricsError(
            error instanceof Error
              ? error.message
              : 'No se pudieron cargar los KPIs reales.',
          )
        }
      } finally {
        if (active) {
          setMetricsLoading(false)
        }
      }
    }

    void cargarMetricasReales()

    return () => {
      active = false
    }
  }, [isAdmin, sprintIdFilter, developerIdFilter, tasks])

  const visibleProjects = useMemo(() => {
    return obtenerProyectosVisibles(usuarioActual, projects, memberships, tasks)
  }, [usuarioActual, projects, memberships, tasks])

  const sprintOptions = useMemo(() => {
    const cutoff = new Date('2026-06-12T00:00:00')
    return sprints
      .filter((sprint) => new Date(sprint.fechaInicio) < cutoff)
      .map((sprint) => ({ id: String(sprint.id), nombre: sprint.nombre }))
  }, [sprints])

  const developerOptions = useMemo(() => {
    const seen = new Map<string, string>()
    for (const metric of sprintDeveloperMetrics) {
      if (!seen.has(String(metric.developerId))) {
        seen.set(String(metric.developerId), metric.developerName)
      }
    }
    return Array.from(seen.entries()).map(([id, nombre]) => ({ id, nombre }))
  }, [sprintDeveloperMetrics])

  const visibleTasks = useMemo(() => {
    return obtenerTareasVisibles(usuarioActual, tasks, memberships, projects)
  }, [usuarioActual, tasks, memberships, projects])

  const dashboardTasks = useMemo(() => {
    const byProject =
      projectIdFilter === 'todos'
        ? visibleTasks
        : visibleTasks.filter((task) => task.proyectoId === projectIdFilter)

    return filtrarTareasPorPeriodo(byProject, periodFilter)
  }, [periodFilter, projectIdFilter, visibleTasks])

  const developerSprintData = useMemo(() => {
    return construirMetricasDeveloperSprint(sprintDeveloperMetrics)
  }, [sprintDeveloperMetrics])

  const realKpiSummary = useMemo(() => {
    const byDeveloper = new Map<string, { completedTasks: number; realHours: number }>()

    for (const metric of sprintDeveloperMetrics) {
      const current = byDeveloper.get(metric.developerId) ?? {
        completedTasks: 0,
        realHours: 0,
      }

      current.completedTasks += metric.completedTasks
      current.realHours += metric.realHours
      byDeveloper.set(metric.developerId, current)
    }

    const developerValues = Array.from(byDeveloper.values())
    const developerCount = developerValues.length
    const completedTasks = sprintDeveloperMetrics.reduce(
      (total, metric) => total + metric.completedTasks,
      0,
    )
    const realHours = sprintDeveloperMetrics.reduce(
      (total, metric) => total + metric.realHours,
      0,
    )

    return {
      completedTasks,
      realHours,
      averageCompletedTasksByDeveloper: developerCount ? completedTasks / developerCount : 0,
      averageRealHoursByDeveloper: developerCount ? realHours / developerCount : 0,
      medianCompletedTasksByDeveloper: calcularMediana(
        developerValues.map((metric) => metric.completedTasks),
      ),
      medianRealHoursByDeveloper: calcularMediana(
        developerValues.map((metric) => metric.realHours),
      ),
      developers: developerSprintData.series.length,
      sprints: developerSprintData.completedBySprint.length,
    }
  }, [developerSprintData, sprintDeveloperMetrics])

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
            currentSprintId={sprintIdFilter}
            currentDeveloperId={developerIdFilter}
            onChangePeriod={setPeriodFilter}
            onChangeProject={setProjectIdFilter}
            onChangeSprint={setSprintIdFilter}
            onChangeDeveloper={setDeveloperIdFilter}
            projectOptions={visibleProjects}
            sprintOptions={sprintOptions}
            developerOptions={developerOptions}
          />
        )}

        {isAdmin ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Tasks completed"
                value={formatearNumero(realKpiSummary.completedTasks)}
              />
              <KpiCard
                label="Hours worked"
                value={`${formatearNumero(realKpiSummary.realHours, 1)} h`}
              />
              <KpiCard label="Developers" value={formatearNumero(realKpiSummary.developers)} />
              <KpiCard label="Sprints" value={formatearNumero(realKpiSummary.sprints)} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                label="Promedio tareas completadas por desarrollador"
                value={formatearNumero(realKpiSummary.averageCompletedTasksByDeveloper, 1)}
              />
              <KpiCard
                label="Promedio horas reales por desarrollador"
                value={`${formatearNumero(realKpiSummary.averageRealHoursByDeveloper, 1)} h`}
              />
              <KpiCard
                label="Mediana tareas completadas por desarrollador"
                value={formatearNumero(realKpiSummary.medianCompletedTasksByDeveloper, 1)}
              />
              <KpiCard
                label="Mediana horas reales por desarrollador"
                value={`${formatearNumero(realKpiSummary.medianRealHoursByDeveloper, 1)} h`}
              />
            </div>

            {metricsError && (
              <div className={cx(ALERT.BASE, ALERT.DANGER)} role="alert">
                <p className="font-medium">Error al cargar KPIs reales</p>
                <p className="mt-1">{metricsError}</p>
              </div>
            )}

            {metricsLoading && (
              <Card>
                <CardContent>
                  <p className={TYPO.BODY_MUTED}>Cargando KPIs reales...</p>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-6 xl:grid-cols-2">
              <DeveloperSprintBars
                description="Tareas terminadas por usuario / sprint desde /api/dashboard/sprint-developer-metrics."
                rows={developerSprintData.completedBySprint}
                series={developerSprintData.series}
                title="Tasks Completed by Developer per Sprint"
                unit="tasks"
                xAxisLabel="Sprints"
                yAxisLabel="Number of Tasks Completed"
              />
              <DeveloperSprintBars
                description="Horas reales trabajadas por usuario / sprint desde /api/dashboard/sprint-developer-metrics."
                rows={developerSprintData.realHoursBySprint}
                series={developerSprintData.series}
                title="Total Hours Worked by Developer per Sprint"
                unit="hrs"
                xAxisLabel="Sprints"
                yAxisLabel="Total Hours Worked"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
              <DashboardMetricsList metrics={dashboardMetrics} />
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
