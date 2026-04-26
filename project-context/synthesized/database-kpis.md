# Database KPI Queries

Source: [2026-04-23-db-sql.md](/Users/joseangel/Documents/New%20project/project-context/raw/2026-04-23-db-sql.md)

## Confirmed KPI Query Set

The SQL shared so far defines at least four concrete KPI queries:

- total tasks by state,
- total tasks by sprint,
- percentage of completed tasks,
- completed tasks by sprint.

## Query Semantics

### Total Tasks By State

- Uses `ESTADOS_TAREA` as the base table.
- Left joins tasks and excludes soft-deleted rows with `t.ELIMINADA = 0`.
- Guarantees that states with zero tasks can still appear.

### Total Tasks By Sprint

- Uses `SPRINTS` as the base table.
- Counts active tasks per sprint.
- Excludes soft-deleted tasks.

### Percentage Of Completed Tasks

- Computes completion ratio over non-deleted tasks only.
- Uses task state names rather than numeric IDs.
- Protects division with `NULLIF(COUNT(...), 0)`.

### Completed Tasks By Sprint

- Groups completed tasks by sprint.
- Filters by the state name `Completada`.
- Excludes soft-deleted tasks.

## KPI Design Observations

- Shared KPI logic consistently ignores soft-deleted tasks.
- The current SQL favors human-readable state names in analytics instead of hard-coding only numeric IDs.
- The KPI set is narrower than the metrics listed in the quality and requirements documents.

## Current Gap Against Earlier Documentation

The SQL confirms implementation-ready queries for:

- state distribution,
- sprint workload,
- overall completion,
- sprint completion.

But it does not yet provide explicit queries for:

- percentage of tasks with complete fields,
- percentage of tasks with project and priority defined,
- percentage of tasks accepted without changes,
- percentage of tasks corrected manually,
- average manual vs AI creation time,
- administrative time saved.

## Practical Meaning

- The dashboard can already be grounded in a real subset of KPIs.
- The broader success-metric vision from earlier documents still needs additional SQL definitions or derived application logic.
