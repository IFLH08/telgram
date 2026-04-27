# Test Scope

## Primary Targets

- Main portal landing experience
- Header navigation between main sections
- Tareas CRUD and filtering
- Proyectos creation and filtering
- Required field validations and visible error messages
- Role-based behavior for admin and developer
- Access-code flows
- One mocked IA flow when the UI depends on an external service
- Responsive checks around mobile width
- Basic accessibility checks for labels and dialogs

## Preferred Coverage For This Project

- `Dashboard`: page loads, filters work, and admin/developer views differ correctly
- `Tareas`: create, edit, delete, filters, developer status change, role restrictions, and mocked IA generation/error paths
- `Proyectos`: create, filter, generated code visibility, and empty-state behavior
- `Codigos de acceso`: valid join, invalid join, duplicate join, and code regeneration
- Responsive: header, tasks, and core forms remain usable around 375px width
- Accessibility: labels connected to form fields, dialogs can be dismissed by keyboard, and primary controls remain reachable

## Avoid By Default

- Deep visual regression tooling
- Exhaustive CRUD permutations
- Live Gemini dependency in E2E
- Backend contract testing unless the user asks for it
