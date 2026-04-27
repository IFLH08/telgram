---
name: repo-dead-code-audit
description: Audit a repository for dead weight by tracing real entrypoints, imports, exported helpers, unused files, legacy surfaces, and generated artifacts. Use when reviewing cleanup opportunities, checking whether old pages/components/services are still connected, or preparing a safe pruning plan for a frontend or full-stack repo.
---

# Repo Dead Code Audit

Identify code that is likely dead, not merely unfamiliar. Prefer proving reachability from the current app entrypoints over guessing from file names.

## Workflow

1. Identify runtime entrypoints first:
- frontend entrypoints such as `index.html`, `src/main.*`, and the file mounted by them,
- backend entrypoints such as `backend/src/server.*`,
- test entrypoints such as `playwright.config.*` and `tests/**`,
- toolchain files such as `vite.config.*`, `eslint.config.*`, and `tsconfig*.json`.

2. Separate findings into buckets:
- `live and reachable`,
- `legacy but still tracked`,
- `exported but unused in live code`,
- `generated or local clutter`,
- `supporting docs/configs` that are not runtime code and should not be mislabeled as dead code.

3. Use the bundled script to trace file reachability when the repo is mostly standard import-based code:
- Run `scripts/reachability-audit.mjs <repo-root>`.
- Treat its output as evidence, not as the whole answer.
- Manually inspect special cases such as config-driven files, public assets, generated folders, and files referenced only by tooling.

4. Confirm imports with `rg` before marking anything as dead:
- Search who imports the file.
- Search who calls the exported function.
- Verify whether the importing file is itself part of the live app or only legacy code.

5. Be conservative with deletion suggestions:
- If a file is unused but clearly intended for near-term replacement, mark it as `candidate for removal`, not guaranteed trash.
- If a function is exposed from context or a service but has zero consumers, call it out separately from file-level dead code.

## Output

Produce:
- a findings list ordered by cleanup value,
- a checklist of safe removal candidates,
- a note about ambiguous items that need human confirmation,
- and, when helpful, a persistent report under `project-context/synthesized/`.

## References

Read `references/audit-rules.md` for scope rules and classification criteria.
