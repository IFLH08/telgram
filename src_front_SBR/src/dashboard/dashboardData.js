const SERIES_PREFIX = 'developer_';

function buildDeveloperKey(developerId, fallbackIndex) {
  return `${SERIES_PREFIX}${developerId || fallbackIndex}`;
}

function sortByName(left, right) {
  return left.label.localeCompare(right.label);
}

export function buildGroupedDashboardData(metrics) {
  const sprintMap = new Map();
  const developerMap = new Map();

  metrics.forEach((metric, index) => {
    const sprintKey = String(metric.sprintId || metric.sprintName);
    const developerKey = buildDeveloperKey(metric.developerId, index);

    if (!sprintMap.has(sprintKey)) {
      sprintMap.set(sprintKey, {
        sprintId: metric.sprintId,
        sprint: metric.sprintName,
        completedValues: {},
        hourValues: {},
      });
    }

    if (!developerMap.has(developerKey)) {
      developerMap.set(developerKey, {
        key: developerKey,
        label: metric.developerName,
      });
    }

    const sprint = sprintMap.get(sprintKey);
    sprint.completedValues[developerKey] = metric.completedTasks;
    sprint.hourValues[developerKey] = metric.realHours;
  });

  const series = Array.from(developerMap.values()).sort(sortByName);

  const completedBySprint = Array.from(sprintMap.values()).map((sprint) => {
    const row = { sprint: sprint.sprint, sprintId: sprint.sprintId };
    series.forEach((developer) => {
      row[developer.key] = sprint.completedValues[developer.key] || 0;
    });
    return row;
  });

  const realHoursBySprint = Array.from(sprintMap.values()).map((sprint) => {
    const row = { sprint: sprint.sprint, sprintId: sprint.sprintId };
    series.forEach((developer) => {
      row[developer.key] = sprint.hourValues[developer.key] || 0;
    });
    return row;
  });

  return {
    series,
    completedBySprint,
    realHoursBySprint,
  };
}
