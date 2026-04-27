# Organization Schema

Use this reference when sorting new project material into the knowledge base.

## Buckets

- `project-context/raw/`: Original material kept as close to the source as possible.
- `project-context/synthesized/project-overview.md`: The current high-level understanding of the project.
- `project-context/decisions/decision-log.md`: Confirmed decisions with enough source context to understand why they were made.
- `project-context/open-questions/backlog.md`: Questions, assumptions, blockers, and ambiguities that still need answers.

## Placement Rules

- Put content in `raw/` when preserving the original wording matters.
- Update `project-overview.md` when the information changes the current understanding of the project.
- Add an entry to `decision-log.md` only when a decision is explicit or strongly confirmed by the source.
- Add an entry to `backlog.md` when the source is incomplete, contradictory, or leaves a meaningful gap.

## Naming Guidance

- Prefer short, stable titles over long narrative filenames.
- Reuse existing topic files when the new material belongs to the same area.
- Include a date in a filename only when chronology matters.

## Quality Bar

- Facts should be easy to trace back to a source.
- Assumptions should be labeled as assumptions.
- Repeated information should be consolidated instead of copied into multiple places.
