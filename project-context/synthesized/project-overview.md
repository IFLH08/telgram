# Project Overview

Status: initial documentation intake in progress.

## Objective

Build an administration portal supported by a Telegram chatbot to automate task creation and improve visibility into the work performed by Oracle's software development team. The stated target is a 20% improvement in team productivity and visibility.

## Users And Stakeholders

- Oracle is the client or sponsoring organization.
- Primary operational roles are `administrator` and `developer`.
- Developers need visibility into their assigned work and incoming deadlines.
- Administrators or project leads need control over tasks, projects, access codes, and KPI views.

## Core Workflows

- Create, edit, delete, and view tasks through the administration portal.
- Create, edit, delete, and possibly query tasks through a Telegram chatbot.
- Let developers view their own tasks and update task status from the portal.
- Create projects and control project access through administrator-generated access codes.
- Notify developers about new assignments and upcoming due dates.
- Track sprint delivery and project KPIs through filtered and general dashboards.

## Constraints

- The solution is expected to improve productivity and visibility by 20%.
- Success is tied to measurable changes in task creation speed, task quality, sprint completion, and task classification quality.
- The source document suggests this is part of an academic or guided course context, which may affect timelines and available resources.
- Data storage is required to use Oracle Autonomous Database.
- Deployment is expected to use Docker, OCI OKE, and Terraform.

## Integrations And Dependencies

- Telegram is a confirmed user-facing channel for the chatbot workflow.
- The administration portal is a confirmed core product component.
- Oracle Autonomous Database is the confirmed persistence layer.
- Docker, OCI OKE, and Terraform are confirmed infrastructure dependencies.
- The downstream task management system and analytics source of truth are still not specified beyond the system's own database.

## Risks

- The current baseline for productivity and visibility metrics is not defined, so proving a 20% improvement may be difficult.
- Several metrics need operational definitions, such as what counts as a complete task, an accepted task without changes, or a corrected task.
- Authentication, permission boundaries, and Telegram session binding are not yet formalized.
- Some requirements are still inconsistent or incomplete, especially chatbot commands, KPI definitions, and backlog prioritization metadata.
