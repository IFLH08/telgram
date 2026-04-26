---
name: project-docs-organizer
description: Use this skill when the user shares project documentation, requirements, notes, transcripts, architecture context, or scattered references that need to be analyzed, normalized, and organized into a reusable knowledge base before planning or implementation.
---

# Project Docs Organizer

## Overview

Use this skill to turn incoming project context into a clean working knowledge base. It helps classify raw material, separate facts from assumptions, extract decisions and risks, and keep a stable synthesis that later product or engineering work can rely on.

## When To Use

Use this skill when:
- The user is about to provide project documentation in chunks.
- The material comes from mixed sources such as notes, requirements, transcripts, screenshots, PDFs, or chat messages.
- The immediate goal is understanding and organizing the project, not implementing features yet.
- The team needs a living place to track confirmed facts, decisions, risks, and open questions.

## Core Rules

- Identify the artifact type first: requirement, business context, architecture, workflow, dependency, constraint, decision, risk, or open question.
- Preserve the user's terminology when it carries product meaning.
- Mark assumptions explicitly instead of blending them with confirmed facts.
- Prefer one canonical summary per topic and update it over time instead of duplicating content across files.
- Keep outputs short and searchable so later sessions can recover context quickly.

## Intake Workflow

1. Read the new material once without reorganizing it.
2. Extract the project objective, actors, workflows, constraints, dependencies, risks, decisions, and unresolved questions.
3. Decide which outputs need to be updated in `project-context/`.
4. Add or revise the concise synthesis before expanding any detailed notes.
5. Call out gaps that block understanding and list the next documents or answers worth requesting.

## Default Storage Layout

Use the following defaults unless the user requests another structure:
- `project-context/raw/` for untouched source material when it exists as files.
- `project-context/synthesized/project-overview.md` for the living project summary.
- `project-context/decisions/decision-log.md` for confirmed decisions and their sources.
- `project-context/open-questions/backlog.md` for unresolved questions, blockers, and assumptions that need validation.

See `references/organization-schema.md` for naming rules and the intended content of each bucket.

## Expected Output Per Documentation Batch

- A short summary of the new source.
- The facts that look stable enough to rely on.
- The assumptions or inferences that still need validation.
- Any new decisions, risks, or dependencies.
- The specific files in `project-context/` that were updated.
- The next 1 to 3 missing pieces of information that would most reduce ambiguity.

## Reference File

Read `references/organization-schema.md` when you need the exact bucket rules, naming conventions, or criteria for where a new note belongs.
