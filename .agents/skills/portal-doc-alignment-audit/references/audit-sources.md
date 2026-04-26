# Audit Sources

## Documentation

- `project-context/synthesized/system-requirements.md`
- `project-context/synthesized/project-overview.md`
- `project-context/synthesized/database-schema.md`
- `project-context/synthesized/database-kpis.md`
- `project-context/synthesized/quality-objectives.md`
- `project-context/synthesized/testing-coverage.md`

## Live Portal Code

- `src/App.tsx`
- `src/features/portal/context.tsx`
- `src/features/portal/selectors.ts`
- `src/features/portal/service.ts`
- `src/features/portal/pages/DashboardPage.tsx`
- `src/features/portal/pages/TasksPage.tsx`
- `src/features/portal/pages/ProjectsPage.tsx`
- `src/features/portal/pages/AccessCodesPage.tsx`
- `src/features/portal/components/PortalHeader.tsx`
- `src/features/portal/components/TaskAIModal.tsx`
- `src/features/portal/task-ai.ts`

## Scope Notes

- Audit the current app from `src/App.tsx` outward.
- Treat `src/pages/**`, `src/components/reportes/**`, `src/components/tareas/**`, `src/components/proyectos/**`, and `src/components/layout/Header.tsx` as legacy or alternate code unless imported by the live app.
- When a feature is implied by quality metrics but missing from formal requirements, classify it as partially documented rather than fully aligned.
