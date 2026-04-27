# Database Schema

Source: [2026-04-23-db-sql.md](/Users/joseangel/Documents/New%20project/project-context/raw/2026-04-23-db-sql.md)

## Platform Assumption

- The system is designed around Oracle SQL objects under the `ADMIN` schema.
- The database is not only storage; it also encodes business rules through constraints and triggers.

## Main Tables

### Roles And Users

- `ROLES`: catalog of allowed roles.
- `USUARIOS`: stores `TELEGRAM_ID`, name, username, role, and registration timestamp.

This confirms that Telegram identity is expected to be linked directly at the user-record level.

### Projects And Sprints

- `PROYECTOS`: stores name, description, start date, end date, and a single `CODIGOACCESO`.
- `SPRINTS`: belongs to one project and defines sprint-level planning windows.

This means tasks are grouped under projects indirectly through sprints, not directly by project foreign key.

### Tasks

- `TAREAS` is the operational core table.
- Each task links to:
  - one task state,
  - one sprint,
  - one assigned user,
  - one priority.
- It also tracks:
  - estimated hours,
  - real hours,
  - story points,
  - due date,
  - real start time,
  - real finish time,
  - soft-delete metadata.

### Supporting Tables

- `ESTADOS_TAREA`: canonical task states.
- `PRIORIDADES`: canonical priorities.
- `MEDIOS`: source channel such as web or Telegram.
- `HISTORIAL_ACCIONES`: action log tied to medium, sprint, and task.
- `NOTIFICACIONES`: user notifications linked to tasks with read state.

## Business Rules Encoded In The Database

### Soft Delete

- Tasks are not physically deleted by default.
- `ELIMINADA`, `DELETED_BY`, and `FECHA_ELIMINACION` support logical deletion and auditability.

### Integrity Constraints

- Story points must be positive.
- Estimated hours must be positive.
- Real hours must be zero or greater.
- Notification read state and task deleted state are constrained to boolean-like `0/1` values.

### Status-Based Automation

- When a task moves to state `2` (`En progreso`), the database sets `FECHA_INICIO_REAL` if it was still empty.
- When a task moves to state `4` (`Completada`), the database sets `FECHA_FIN_REAL` and calculates `HORAS_REALES` from elapsed time since real start.

This means part of time tracking is owned by database triggers rather than only by application logic.

## Schema Implications For The Portal

- The canonical role set in the database is `ADMIN` and `DESARROLLADOR`.
- Access code design currently looks like one code per project through `PROYECTOS.CODIGOACCESO`, not a separate reusable code table.
- Membership between developers and projects is not modeled explicitly in the SQL shared so far.
- Project dashboards will likely need joins across `PROYECTOS`, `SPRINTS`, `TAREAS`, `ESTADOS_TAREA`, and `PRIORIDADES`.
- Telegram actions should be traceable through `MEDIOS` and `HISTORIAL_ACCIONES`.

## Seed Data Signals

- The seed script inserts one project, one sprint, example tasks, example notifications, and action history.
- It also demonstrates:
  - a task created directly as pending,
  - a task created in progress,
  - a task that transitions to completed to trigger time automation,
  - a soft-deleted task.

This is useful as a behavior reference, not only as sample data.
