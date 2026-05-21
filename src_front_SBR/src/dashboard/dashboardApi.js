const DASHBOARD_METRICS_URL = '/api/dashboard/sprint-developer-metrics';

function toNumber(value) {
  const numericValue = Number(value);
  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeMetric(metric) {
  return {
    sprintId: metric.sprintId,
    sprintName: metric.sprintName || 'Sin sprint',
    developerId: metric.developerId,
    developerName: metric.developerName || 'Sin asignar',
    completedTasks: toNumber(metric.completedTasks),
    realHours: toNumber(metric.realHours),
  };
}

export async function fetchSprintDeveloperMetrics(signal) {
  const response = await fetch(DASHBOARD_METRICS_URL, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new Error(`No se pudieron cargar las metricas (${response.status}).`);
  }

  const payload = await response.json();

  if (!Array.isArray(payload)) {
    throw new Error('La respuesta del dashboard no tiene el formato esperado.');
  }

  return payload.map(normalizeMetric);
}
