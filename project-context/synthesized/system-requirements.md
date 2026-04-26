# System Requirements

Source: [2026-04-23-requerimientos-del-sistema.md](/Users/joseangel/Documents/New%20project/project-context/raw/2026-04-23-requerimientos-del-sistema.md)

## Core Entities

### Task

The task record is expected to include:

- Name
- Assignee
- Description
- Due date
- Current sprint flag
- Planned hours
- Priority
- Project
- Real hours
- Sprint
- Status

The SQL shared later refines this into a normalized database model where tasks belong to sprints, and sprints belong to projects.

### Project

The project record is expected to include:

- ID
- Name
- Description
- Start date
- Due date
- Status
- Progress

## Confirmed User Roles

- `Administrator`: manages tasks, projects, access codes, KPI views, and Telegram-based administrative actions.
- `Developer`: views own tasks, updates task status, receives notifications, and joins projects through access codes.

## Functional Scope

### Portal Workflows

- Developers can view only their own tasks in the portal.
- Administrators can view all tasks for a selected project.
- Administrators can create, edit, and delete tasks manually in the portal.
- Developers can update the status of their own assigned tasks.
- Administrators can create projects in the portal.
- Administrators can generate project access codes.
- Developers can join one or more projects by entering an access code.

### Telegram Workflows

- Administrators can create tasks with `/addItem`.
- Administrators can edit tasks with `/EditItem` or `/ValueAssigned`.
- Administrators can delete tasks with `/deleteItem`.
- Administrators can create projects through the chatbot with `AddProject`.

### Notifications And Analytics

- The system should notify developers when a task is assigned or when a due date is near.
- Administrators should be able to filter KPIs by project and development period.
- Administrators should have access to a general KPI dashboard.

## Non-Functional Requirements

- Security must be implemented across all architecture components.
- Data must be stored in Oracle Autonomous Database.
- The web interface and chatbot must be intuitive and easy to use.
- The system must work in modern web browsers and on mobile devices.
- Deployment should be containerized with Docker and orchestrated in Oracle Cloud Infrastructure OKE.
- Infrastructure provisioning should be declarative through Terraform scripts.

The SQL schema later confirms Oracle Autonomous Database is expected to hold normalized tables for roles, users, projects, sprints, tasks, notifications, action history, and supporting catalogs.

## Priority Signals

- Highest product priority is portal-based task management and developer visibility.
- Telegram-based CRUD appears important but is consistently rated as higher effort than portal CRUD.
- KPI filtering and dashboard reporting are lower priority than core task management.

## Requirement Quality Concerns

- Authentication flows such as login and sign up are mentioned as ideas but not formalized as requirements.
- Permission management is still incomplete, especially granting and revoking access.
- The chatbot session model is undefined, so user identity binding between Telegram and the portal is still unresolved.
- The chatbot use case is strongly admin-centric; developer productivity through Telegram is not yet defined.
- KPI definitions remain incomplete even though dashboards and filters depend on them.
- Team membership management inside projects is implied but not fully specified.
- Some command definitions are inconsistent or ambiguous, such as `/EditItem` versus `/ValueAssigned`, and `AddProject` lacking the slash pattern used elsewhere.
- The prioritization artifacts contain inconsistencies, for example `quick win` paired with high effort, a missing effort value for HU06, and the typo `HU010`.
- The later SQL schema introduces some implementation choices that need alignment with the product description, especially one access code per project and the lack of an explicit project-membership table in the shared schema.
