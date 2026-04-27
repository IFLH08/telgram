# Decision Log

| Date | Area | Decision | Source | Notes |
| --- | --- | --- | --- | --- |
| 2026-04-23 | Product direction | Build an administration portal plus a Telegram chatbot to automate and give visibility to software development tasks. | Calidad document shared by user | Explicitly framed as the team's chosen solution direction. |
| 2026-04-23 | Success measurement | Evaluate progress through task creation efficiency, task quality, sprint output, and project visibility metrics. | Calidad document shared by user | The metric set is explicit, but the measurement baselines still need definition. |
| 2026-04-23 | User model | The system distinguishes at least two roles: administrator and developer. | System requirements document shared by user | Exact permission boundaries are still incomplete. |
| 2026-04-23 | Data model | Task records include name, assignee, description, due date, current sprint flag, planned hours, priority, project, real hours, sprint, and status. | System requirements document shared by user | Project records are also explicitly defined. |
| 2026-04-23 | Architecture requirements | Persist data in Oracle Autonomous Database and deploy with Docker, OCI OKE, and Terraform-based infrastructure provisioning. | System requirements document shared by user | These appear as mandatory non-functional requirements rather than optional preferences. |
| 2026-04-23 | Database implementation | The database is organized under the `ADMIN` schema with normalized tables for roles, users, projects, sprints, tasks, priorities, states, notifications, media, and action history. | SQL schema shared by user | This is the clearest implementation-level data model provided so far. |
| 2026-04-23 | Task lifecycle automation | Real task start and finish timestamps, and completion-based real-hour calculation, are partially enforced by Oracle triggers on task status updates. | SQL schema shared by user | Time tracking is not purely an application concern. |
| 2026-04-23 | Audit strategy | Task deletion is implemented as soft delete with `ELIMINADA`, `DELETED_BY`, and `FECHA_ELIMINACION`. | SQL schema shared by user | This directly affects CRUD semantics and KPI filtering. |
| 2026-04-23 | Access design | Projects currently store a single `CODIGOACCESO` directly in the `PROYECTOS` table. | SQL schema shared by user | This differs from a separate access-code entity model. |
