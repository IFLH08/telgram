import React, { useMemo } from 'react';
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

export default function DashboardPage({ showBackLink = true }) {
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
          {showBackLink && (
            <a className="dashboard-back-link" href="/">
              Tareas
            </a>
          )}
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
        <div className="dashboard-grid">
          <SprintDeveloperGroupedBar
            title="Tasks Completed by Developer per Sprint"
            description="Tareas terminadas por usuario / sprint."
            data={dashboardData.completedBySprint}
            series={dashboardData.series}
            unit="tasks"
            xAxisLabel="Sprints"
            yAxisLabel="Number of Tasks Completed"
          />

          <SprintDeveloperGroupedBar
            title="Total Horas Reales por usuario / sprint"
            description="Total hours worked per user / sprint."
            data={dashboardData.realHoursBySprint}
            series={dashboardData.series}
            unit="hrs"
            xAxisLabel="Sprints"
            yAxisLabel="Total Hours Worked"
            allowDecimals
          />
        </div>
      )}
    </main>
  );
}
