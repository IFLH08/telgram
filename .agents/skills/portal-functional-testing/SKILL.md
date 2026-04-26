---
name: portal-functional-testing
description: Run real functional checks against this frontend portal, including how to detect the correct start commands, add Playwright coverage when E2E tests are missing, exercise navigation, CRUD and filter flows for tareas/proyectos, verify visible validation and error states, cover role-based behavior, mock external IA dependencies when needed, and check responsive plus basic accessibility behavior.
---

# Portal Functional Testing

Use this skill when the user wants functional validation of the portal in a running browser, especially for navigation, CRUD flows, filters, visible errors, validations, role restrictions, mocked IA interactions, and basic responsive/accessibility behavior.

## Workflow

1. Inspect `package.json`, the app entry points, and the main portal pages before testing.
2. Read `references/test-scope.md` to keep coverage focused on the minimum functional surface.
3. Detect whether automated browser coverage already exists.
4. Add or expand the smallest useful Playwright suite for the requested coverage.
5. Mock external dependencies such as Gemini whenever the tested flow is UI behavior rather than live integration.
6. Start the app with the real local commands. If frontend and backend are separate, run only what the tested flow needs.
7. Run automated tests first, then use the in-app browser for quick visual confirmation when useful.
8. Report what failed, what was changed, what still remains risky, and the exact command used to reproduce.

## Rules

- Prefer the minimum useful E2E suite over broad speculative coverage, but expand coverage when the user explicitly asks for deeper functional testing.
- Cover real user-visible outcomes: navigation, CRUD success, filters, required-field validation, success/error messages, role restrictions, and small-screen layout survival.
- When a feature depends on external services such as Gemini, mock or avoid that dependency unless the user explicitly asks for live integration coverage.
- Patch the app only when a failing test reveals a genuine functional issue or missing testability hook.
- Keep selectors stable and readable. Add `data-testid` only when accessible locators are not reliable enough.
- Improve accessibility hooks when they also improve real usability, such as associating labels, dialog semantics, and keyboard close behavior.
- After edits, rerun the affected tests and summarize the before/after result.

## Outputs

- Playwright config and E2E tests sized to the requested scope
- Any small app patches required to make the tested flow reliable
- A concise functional test report with failures, fixes, residual risks, reproduction commands, and a pass/fail checklist
