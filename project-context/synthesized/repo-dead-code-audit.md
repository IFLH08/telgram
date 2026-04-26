# Repository Dead Code Audit

Date: 2026-04-24

## Scope

- Audited the current workspace code under `src/`, `backend/src/`, `public/`, `tests/`, and root toolchain files.
- Excluded `node_modules/`, `.git/`, `dist/`, `test-results/`, `.agents/`, and `project-context/` from dead-code classification.
- Used the active entrypoints `index.html`, `src/main.tsx`, `backend/src/server.ts`, `playwright.config.ts`, `vite.config.js`, and `eslint.config.js`.
- Backed the reachability pass with the local script in [reachability-audit.mjs](</Users/joseangel/Documents/New project/.agents/skills/repo-dead-code-audit/scripts/reachability-audit.mjs:1>).

## Highest-Value Removal Candidates

- Entire legacy page layer under [src/pages](</Users/joseangel/Documents/New project/src/pages>) is not mounted by the live app. The current app mounts only portal pages from [App.tsx](/Users/joseangel/Documents/New%20project/src/App.tsx:5), while the old pages remain tracked in [Dashboard.tsx](/Users/joseangel/Documents/New%20project/src/pages/Dashboard.tsx:1), [Login.tsx](/Users/joseangel/Documents/New%20project/src/pages/Login.tsx:1), [Proyectos.tsx](/Users/joseangel/Documents/New%20project/src/pages/Proyectos.tsx:65), [Reportes.tsx](/Users/joseangel/Documents/New%20project/src/pages/Reportes.tsx:119), and [Tareas.tsx](/Users/joseangel/Documents/New%20project/src/pages/Tareas.tsx:249).
- The legacy task/project/report component suites are dead weight if the old pages are gone: [src/components/tareas](</Users/joseangel/Documents/New project/src/components/tareas>), [src/components/proyectos](</Users/joseangel/Documents/New project/src/components/proyectos>), and [src/components/reportes](</Users/joseangel/Documents/New project/src/components/reportes>). The reachability audit leaves all of them unreachable, and the old pages are the only files importing them.
- The legacy permissions stack is only consumed by the old pages, not by the live portal. See [src/permissions/index.ts](/Users/joseangel/Documents/New%20project/src/permissions/index.ts:1), [permissions.constants.ts](/Users/joseangel/Documents/New%20project/src/permissions/permissions.constants.ts:1), [permissions.helpers.ts](/Users/joseangel/Documents/New%20project/src/permissions/permissions.helpers.ts:1), and their only callers in [Proyectos.tsx](/Users/joseangel/Documents/New%20project/src/pages/Proyectos.tsx:14), [Reportes.tsx](/Users/joseangel/Documents/New%20project/src/pages/Reportes.tsx:19), and [Tareas.tsx](/Users/joseangel/Documents/New%20project/src/pages/Tareas.tsx:19).
- The old mock CRUD services are only supporting the dead page layer and can be removed together with it: [tasks.service.ts](/Users/joseangel/Documents/New%20project/src/services/tasks.service.ts:1), [projects.service.ts](/Users/joseangel/Documents/New%20project/src/services/projects.service.ts:1), [reports.service.ts](/Users/joseangel/Documents/New%20project/src/services/reports.service.ts:1), plus their backing mocks [tasks.mock.ts](/Users/joseangel/Documents/New%20project/src/mocks/tasks.mock.ts:1), [projects.mock.ts](/Users/joseangel/Documents/New%20project/src/mocks/projects.mock.ts:1), and [reports.mock.ts](/Users/joseangel/Documents/New%20project/src/mocks/reports.mock.ts:1). Their callers are the legacy pages in [Proyectos.tsx](/Users/joseangel/Documents/New%20project/src/pages/Proyectos.tsx:15), [Proyectos.tsx](/Users/joseangel/Documents/New%20project/src/pages/Proyectos.tsx:16), [Reportes.tsx](/Users/joseangel/Documents/New%20project/src/pages/Reportes.tsx:20), and [Tareas.tsx](/Users/joseangel/Documents/New%20project/src/pages/Tareas.tsx:25).
- The formatting helper [taskFormatters.ts](/Users/joseangel/Documents/New%20project/src/utils/taskFormatters.ts:1>) is also legacy-only. Its only callers are [Proyectos.tsx](/Users/joseangel/Documents/New%20project/src/pages/Proyectos.tsx:18), [Reportes.tsx](/Users/joseangel/Documents/New%20project/src/pages/Reportes.tsx:34), and [Tareas.tsx](/Users/joseangel/Documents/New%20project/src/pages/Tareas.tsx:42), which are not mounted by the live app.

## Smaller Dead-Weight Findings

- [src/services/api.ts](/Users/joseangel/Documents/New%20project/src/services/api.ts:1) is not imported by the live portal or backend. It only appears in commented placeholder lines inside the old legacy services.
- [src/services/index.ts](/Users/joseangel/Documents/New%20project/src/services/index.ts:1) is an unused barrel file. No repo code imports from `src/services`.
- [src/constants/index.ts](</Users/joseangel/Documents/New project/src/constants/index.ts>) is an empty tracked file and pure dead weight.
- [public/icons.svg](</Users/joseangel/Documents/New project/public/icons.svg>) has no references in the repo. The only public asset referenced by the app shell is [favicon.svg](/Users/joseangel/Documents/New%20project/index.html:5).
- [src/components/layout/Header.tsx](/Users/joseangel/Documents/New%20project/src/components/layout/Header.tsx:97) looks reachable only because [src/components/index.ts](/Users/joseangel/Documents/New%20project/src/components/index.ts:5) re-exports it. No live code imports or renders `Header`; the real header is [PortalHeader.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/components/PortalHeader.tsx:53).

## Exported But Unused In The Current Portal

- Auth context exposes more API than the live portal consumes. Current consumers of `useAuth` only read `usuarioActual` or `cambiarUsuarioActualDemo` in [App.tsx](/Users/joseangel/Documents/New%20project/src/App.tsx:15), [PortalHeader.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/components/PortalHeader.tsx:59), [DashboardPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/DashboardPage.tsx:89), [TasksPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/TasksPage.tsx:293), [ProjectsPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/ProjectsPage.tsx:147), and [AccessCodesPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/AccessCodesPage.tsx:16). That leaves `cambiarRolDemo`, `rolActual`, `estaAutenticado`, `cargando`, and `refrescarUsuarioActual` effectively unused in the live portal API declared in [auth.types.ts](/Users/joseangel/Documents/New%20project/src/auth/auth.types.ts:3) and implemented in [auth.context.tsx](/Users/joseangel/Documents/New%20project/src/auth/auth.context.tsx:21).
- Portal context also exposes `loading` and `refresh` in [context.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/context.tsx:35), but no current `usePortal` consumer reads them. Live consumers only pull data and action methods from [App.tsx](/Users/joseangel/Documents/New%20project/src/App.tsx:16), [DashboardPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/DashboardPage.tsx:90), [TasksPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/TasksPage.tsx:304), [ProjectsPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/ProjectsPage.tsx:148), [AccessCodesPage.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/pages/AccessCodesPage.tsx:17), and [PortalHeader.tsx](/Users/joseangel/Documents/New%20project/src/features/portal/components/PortalHeader.tsx:60).

## Not Dead, Do Not Confuse With Trash

- The active frontend lives under [src/features/portal](</Users/joseangel/Documents/New project/src/features/portal>) and is mounted by [App.tsx](/Users/joseangel/Documents/New%20project/src/App.tsx:5).
- The backend is small but live: [server.ts](/Users/joseangel/Documents/New%20project/backend/src/server.ts:1) and [ia.routes.ts](/Users/joseangel/Documents/New%20project/backend/src/routes/ia.routes.ts:1).
- Tooling files [vite.config.js](/Users/joseangel/Documents/New%20project/vite.config.js:1), [eslint.config.js](/Users/joseangel/Documents/New%20project/eslint.config.js:1), and [playwright.config.ts](/Users/joseangel/Documents/New%20project/playwright.config.ts:1) are live through package scripts even though app code does not import them.

## Local Clutter, Not Repo Weight

- `dist/` is ignored build output.
- `test-results/` is transient Playwright output.
- `.env` is local environment state.

These are worth cleaning from the workspace when needed, but they are not the main dead-weight problem in tracked source.
