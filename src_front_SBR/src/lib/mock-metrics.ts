export const sprintVelocity = [
  { sprint: 'Sprint 1', completed: 25, ideal: 30 },
  { sprint: 'Sprint 2', completed: 32, ideal: 30 },
  { sprint: 'Sprint 3', completed: 28, ideal: 35 },
  { sprint: 'Sprint 4', completed: 40, ideal: 35 },
  { sprint: 'Sprint 5', completed: 35, ideal: 35 },
];

export const leadAndCycleTime = [
  { id: 'TASK-1', leadTime: 12, cycleTime: 4 },
  { id: 'TASK-2', leadTime: 15, cycleTime: 5 },
  { id: 'TASK-3', leadTime: 8, cycleTime: 3 },
  { id: 'TASK-4', leadTime: 20, cycleTime: 8 },
  { id: 'TASK-5', leadTime: 14, cycleTime: 6 },
  { id: 'TASK-6', leadTime: 10, cycleTime: 4 },
  { id: 'TASK-7', leadTime: 25, cycleTime: 12 },
  { id: 'TASK-8', leadTime: 9, cycleTime: 2 },
];

export const throughputData = [
  { week: 'Semana 1', items: 8 },
  { week: 'Semana 2', items: 12 },
  { week: 'Semana 3', items: 10 },
  { week: 'Semana 4', items: 15 },
  { week: 'Semana 5', items: 14 },
];

export const cfdData = [
  { day: 'Lun', backlog: 20, inProgress: 5, review: 2, done: 10 },
  { day: 'Mar', backlog: 18, inProgress: 6, review: 3, done: 12 },
  { day: 'Mie', backlog: 15, inProgress: 7, review: 4, done: 15 },
  { day: 'Jue', backlog: 12, inProgress: 8, review: 2, done: 18 },
  { day: 'Vie', backlog: 10, inProgress: 5, review: 5, done: 22 },
];

export const bugsByModule = [
  { module: 'Auth', critical: 1, high: 2, medium: 5 },
  { module: 'Payments', critical: 0, high: 1, medium: 3 },
  { module: 'Dashboard', critical: 2, high: 4, medium: 8 },
  { module: 'Reports', critical: 0, high: 2, medium: 4 },
  { module: 'Settings', critical: 0, high: 0, medium: 2 },
];

export const backlogByType = [
  { name: 'User Stories', value: 45, fill: 'hsl(var(--chart-1))' },
  { name: 'Tech Debt', value: 25, fill: 'hsl(var(--chart-2))' },
  { name: 'Bugs', value: 15, fill: 'hsl(var(--chart-3))' },
  { name: 'Spikes', value: 10, fill: 'hsl(var(--chart-4))' },
];

export const burndownData = [
  { day: 'Día 1', remaining: 40, ideal: 40 },
  { day: 'Día 2', remaining: 35, ideal: 36 },
  { day: 'Día 3', remaining: 35, ideal: 32 },
  { day: 'Día 4', remaining: 28, ideal: 28 },
  { day: 'Día 5', remaining: 25, ideal: 24 },
  { day: 'Día 6', remaining: 20, ideal: 20 },
  { day: 'Día 7', remaining: 15, ideal: 16 },
  { day: 'Día 8', remaining: 10, ideal: 12 },
  { day: 'Día 9', remaining: 5, ideal: 8 },
  { day: 'Día 10', remaining: 0, ideal: 0 },
];
