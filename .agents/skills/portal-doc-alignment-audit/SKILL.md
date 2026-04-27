---
name: portal-doc-alignment-audit
description: Audit the live frontend portal against the local project documentation and separate features that are (1) documented and implemented, (2) implemented as extras not formalized in the docs, and (3) repo-only legacy code not wired into the current app. Use when reviewing scope alignment, preparing delivery checklists, or deciding what should be documented, trimmed, or kept.
---

# Portal Doc Alignment Audit

Audit the current portal with evidence from both documentation and code. Treat the result as a scope-alignment review, not as a code-style review.

## Workflow

1. Read the active documentation first:
- `project-context/synthesized/system-requirements.md`
- `project-context/synthesized/project-overview.md`
- `project-context/synthesized/database-schema.md`
- `project-context/synthesized/database-kpis.md`
- `project-context/synthesized/quality-objectives.md`

2. Determine the live portal scope before auditing features:
- Treat `src/App.tsx` as the entrypoint.
- Count only pages and components actually mounted from `src/features/portal/**` unless another entrypoint proves otherwise.
- Treat older files in `src/pages/**` and legacy component folders as repo artifacts, not as live portal features, unless they are imported by the live app.

3. Compare documentation against implementation using three buckets:
- `Documented and implemented`
- `Implemented but not formalized in documentation`
- `Repo-only legacy or unused surfaces`

4. Use evidence, not inference:
- Prefer code paths, selectors, services, and page wiring over assumptions.
- Prefer the synthesized docs over scattered raw notes when they say the same thing.
- If a feature is only hinted indirectly, mark it as `partially documented` in your notes instead of calling it fully aligned.

5. Save the audit to `project-context/synthesized/` when the task asks for a persistent artifact.

## Classification Rules

- A feature counts as `documented and implemented` when a requirement, user story, or synthesized project document clearly describes it and the live portal exposes it.
- A feature counts as `implemented but not formalized` when it exists in the live portal but no requirement or synthesized document clearly defines it.
- A feature counts as `repo-only legacy` when code exists in the repository but the current app entrypoint does not mount it.
- Do not treat styling, accessibility labels, or test scaffolding as product features unless the user explicitly asks for those.

## Output Shape

Produce:
- one checklist of documented features that are present in the live portal,
- one checklist of live-portal extras not formalized in documentation,
- one short note for repo-only legacy surfaces when they exist.

Keep the lists concise and evidence-backed.

## References

Read `references/audit-sources.md` when you need the canonical source list and scope guardrails.
