import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SprintDeveloperGroupedBar } from './SprintDeveloperGroupedBar';
import { buildGroupedDashboardData } from './dashboardData';
import { useSprintDeveloperMetrics } from './useSprintDeveloperMetrics';
import './dashboard.css';

function DashboardSkeleton() {
  return (
    <div className="dashboard-grid">
      <div className="dashboard-card dashboard-skeleton" />
      <div className="dashboard-card dashboard-skeleton" />
    </div>
  );
}

function EmptyState() {
  return (
    <section className="dashboard-empty">
      <h2>Sin datos para graficar</h2>
      <p>No hay tareas asignadas a sprints y desarrolladores con horas reales registradas.</p>
    </section>
  );
}

function MetricSummary({ metrics, sprintCount, developerCount }) {
  const completedTasks = metrics.reduce((total, metric) => total + metric.completedTasks, 0);
  const realHours = metrics.reduce((total, metric) => total + metric.realHours, 0);

  return (
    <section className="dashboard-summary" aria-label="Metricas observadas">
      <article>
        <span>Sprints</span>
        <strong>{sprintCount}</strong>
      </article>
      <article>
        <span>Developers</span>
        <strong>{developerCount}</strong>
      </article>
      <article>
        <span>Completed tasks</span>
        <strong>{completedTasks}</strong>
      </article>
      <article>
        <span>Horas reales</span>
        <strong>
          {realHours.toLocaleString('es-MX', {
            maximumFractionDigits: 1,
          })}
        </strong>
      </article>
    </section>
  );
}

function ObservedMetricsTable({ metrics }) {
  return (
    <section className="dashboard-card dashboard-table-card">
      <div className="dashboard-card-header">
        <h2>Detalle de metricas observadas</h2>
        <p>Datos reales recibidos desde /api/dashboard/sprint-developer-metrics.</p>
      </div>
      <div className="dashboard-table-wrap">
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Sprint</th>
              <th>Developer</th>
              <th>Completed tasks</th>
              <th>Horas reales</th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => (
              <tr key={`${metric.sprintId}-${metric.developerId}`}>
                <td>{metric.sprintName}</td>
                <td>{metric.developerName}</td>
                <td>{metric.completedTasks}</td>
                <td>
                  {metric.realHours.toLocaleString('es-MX', {
                    maximumFractionDigits: 1,
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { metrics, isLoading, error, reload } = useSprintDeveloperMetrics();
  const dashboardData = useMemo(() => buildGroupedDashboardData(metrics), [metrics]);
  const hasMetrics = dashboardData.series.length > 0 && dashboardData.completedBySprint.length > 0;

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">MyTodoList</span>
          <h1>Dashboard de KPIs</h1>
        </div>
        <div className="dashboard-actions">
          <button className="dashboard-refresh" type="button" onClick={() => reload()}>
            Actualizar
          </button>
          <Link className="dashboard-back-link" to="/">
            Tareas
          </Link>
        </div>
      </header>

      {error && (
        <section className="dashboard-error" role="alert">
          <strong>Error al cargar metricas.</strong>
          <span>{error.message}</span>
        </section>
      )}

      {isLoading && <DashboardSkeleton />}

      {!isLoading && !error && !hasMetrics && <EmptyState />}

      {!isLoading && !error && hasMetrics && (
        <>
          <MetricSummary
            metrics={metrics}
            sprintCount={dashboardData.completedBySprint.length}
            developerCount={dashboardData.series.length}
          />
          <div className="dashboard-grid">
            <SprintDeveloperGroupedBar
              title="Tasks Completed by Developer per Sprint"
              description="Tareas completadas agrupadas por sprint y desarrollador."
              data={dashboardData.completedBySprint}
              series={dashboardData.series}
              unit="tasks"
            />

            <SprintDeveloperGroupedBar
              title="Total Horas Reales por usuario / sprint"
              description="Suma de horas reales registradas por desarrollador en cada sprint."
              data={dashboardData.realHoursBySprint}
              series={dashboardData.series}
              unit="hrs"
              allowDecimals
            />
          </div>
          <ObservedMetricsTable metrics={metrics} />
        </>
      )}
    </main>
  );
}
