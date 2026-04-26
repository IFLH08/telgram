# Visual Spec

Source: approved screenshot shared on April 23, 2026.

## Personality

- Tone: professional
- Energy: medium
- Audience: business professionals

## Typography

- Primary font: `OracleSansVF`
- Heading font: `OracleSansVF`
- `h1`: 20px
- `h2`: 20px
- Body: 16px
- Prefer regular and medium weights over heavy bold treatment.

## Colors

- Primary: `#33553C`
- Secondary: `#006B8F`
- Accent: `#33553C`
- Background: `#FFFFFF`
- Text primary: `#161513`
- Link/highlight: `#F0CC71`

## Spacing And Radius

- Base spacing unit: 4px
- Default corner radius: 4px

## Component Direction

- Buttons: primary fill uses the dark green; secondary stays restrained and text-first.
- Inputs: white background, light neutral border, dark text, small radius.
- Cards/panels: white surfaces, subtle borders, minimal shadow.
- Tables: clean rows, light separators, low visual noise.
- Navigation/header: business-like and compact; avoid pill-heavy controls.

## Portal Mapping

- Shared tokens belong in `src/constants/colors.ts`.
- Global font family belongs in `src/index.css`.
- Reusable primitives belong in `src/components/`.
- Portal overrides belong in `src/features/portal/components/` and `src/features/portal/pages/`.
