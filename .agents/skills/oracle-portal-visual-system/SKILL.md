---
name: oracle-portal-visual-system
description: Maintain and apply the approved Oracle-style visual system for this project's frontend portal. Use when editing colors, typography, spacing, radius, buttons, inputs, cards, tables, header/navigation, or other presentation details so the UI stays aligned with the screenshot-based design guide.
---

# Oracle Portal Visual System

Apply the project-local design guide extracted from the approved screenshot. Keep changes centralized in shared tokens and reusable components before patching individual screens.

## Workflow

1. Read `references/visual-spec.md` for the exact palette, typography, spacing, radius, and UI personality.
2. Update shared styling sources first: `src/constants/colors.ts`, `src/index.css`, and common UI primitives such as `src/components/Button.tsx`, `src/components/Card.tsx`, and `src/components/Badge.tsx`.
3. Patch portal files only where hardcoded classes fight the shared system. Prioritize `src/features/portal/components/` and `src/features/portal/pages/`.
4. Keep layouts restrained and business-facing. Prefer clean rectangles, light borders, modest shadows, and consistent spacing over pills, oversized radii, or loud gradients.
5. Validate visually in the local portal after substantial styling changes.

## Rules

- Use `OracleSansVF` as the primary family with sensible sans-serif fallbacks.
- Use `#33553C` for primary actions and strong emphasis.
- Use `#006B8F` for informative accents and secondary emphasis.
- Use `#F0CC71` for links or highlighted textual accents, not for large fills.
- Keep white backgrounds, dark text, and light neutral borders.
- Use 4px spacing increments and 4px corner radii as the default system.
- Keep headline sizing restrained; avoid hero-style typography.
- Preserve the portal's functional structure while restyling it.
