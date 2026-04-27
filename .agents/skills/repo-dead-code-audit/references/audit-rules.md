# Audit Rules

## Exclude By Default

- `node_modules/`
- `.git/`
- generated build output such as `dist/`
- transient test output such as `test-results/`

## Treat Carefully

- `.agents/` and `project-context/` are workspace support artifacts, not product runtime.
- config files are usually live even when no source file imports them.
- tracked documentation is not runtime code and should not be labeled dead code unless the task explicitly asks for stale docs too.

## Strong Dead-Code Signals

- A tracked file under `src/` is never imported from a live entrypoint chain.
- A service is only imported by legacy pages that are not mounted by the current app.
- A helper is exported from context or a service but has zero consumers in the live app.
- A public asset has no reference in HTML, CSS, JSX, TSX, or SVG symbol usage.

## Ambiguous Signals

- Placeholder API wrappers intended for future backend integration.
- Test utilities that are only used through config-driven discovery.
- Files referenced only from docs or comments.
