# Testing Coverage

Source: [2026-04-23-test-cases.md](/Users/joseangel/Documents/New%20project/project-context/raw/2026-04-23-test-cases.md)

## Current Test Focus

The current documented test design focuses mainly on task management and role-based behavior:

- Portal task viewing for administrators and developers.
- Portal task creation for administrators.
- Telegram task creation, editing, and deletion for administrators.
- Permission enforcement for developer attempts to use admin-only Telegram commands.
- Developer notifications for new assignments and near due dates.

## Requirements Covered By Existing Test Cases

| Requirement Area | Related Cases | Coverage Notes |
| --- | --- | --- |
| Admin views project tasks | TC-01 | Aligns more with admin task visibility than developer task visibility. |
| Admin creates tasks in portal | TC-02 | Covers portal-side task creation at a basic level. |
| Admin creates tasks in Telegram | TC-03 | Covers `/addItem`, though the document also spells it as `/additem`. |
| Admin edits tasks in Telegram | TC-04 | Covers `/EditItem`, but the edit input flow is underspecified. |
| Admin deletes tasks in Telegram | TC-05 | Covers `/deleteItem`. |
| Telegram permission enforcement | TC-06 | Supports the role model and admin-only bot commands. |
| Developer notifications | TC-07 | Covers assignment and due-date reminders. |
| Developer views own tasks | TC-08, TC-09 | Functionally duplicated cases. |

## Requirements With No Test Coverage Yet

- Admin task editing in the portal.
- Admin task deletion in the portal.
- Developer status updates in the portal.
- Admin view of all tasks for a specific project with richer validation.
- Project creation in the portal.
- Project creation through Telegram.
- Access code generation by administrators.
- Project joining by developers through access codes.
- KPI filtering by project and period.
- General KPI dashboard behavior.
- Login, sign up, and user-session flows if they become formal requirements.
- Non-functional validation for Oracle Autonomous Database, Docker, OKE, Terraform, usability, compatibility, and broader security controls.

## Quality Issues In The Test Document

- `TC-08` and `TC-09` are duplicates.
- `TC-08` and `TC-09` were phrased as if the administrator observes tasks, but their prerequisites and steps are for a developer flow.
- Command casing is inconsistent: the summary mentions `/additem`, while the steps use `/addItem`.
- `TC-04` does not clearly describe which field is edited or how the new value is supplied, so reproducibility is weak.
- Several cases rely on “login” or “authenticated user” behavior that is still not formally defined in the requirements set.
- The current suite is mostly manual test design; no evidence of automation strategy, test data management, or environment ownership appears in this source.

## Test Environment Signals

The documented cases assume the following must exist:

- A working database and API connection.
- Role-aware users for administrator and developer scenarios.
- A test environment.
- A Telegram bot that can identify or authenticate users.
- A notification trigger mechanism such as a cron, worker, or background service.

## Suggested Next Testing Additions

- Add coverage for the missing portal CRUD cases and developer status updates.
- Add cases for project lifecycle and access-code flows.
- Add KPI and dashboard validation with explicit formulas and filters.
- Add negative tests for invalid commands, missing required task fields, unauthorized portal actions, and expired or invalid access codes.
- Decide which cases should remain manual and which should become automated integration or end-to-end tests.
