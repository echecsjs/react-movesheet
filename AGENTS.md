# AGENTS.md — @echecs/react-movesheet

Coding-agent reference for the `react-movesheet` package.

**Backlog:** tracked in
[GitHub Issues](https://github.com/echecsjs/react-movesheet/issues).

## Project Overview

`@echecs/react-movesheet` is a React move notation panel that displays chess
game moves with click navigation, current move highlighting, inline variations,
comments, NAGs, evaluation display, and keyboard navigation.

**Architecture:**

- **MoveNode tree** — builds a navigable tree from `@echecs/pgn`'s flat
  `MoveList`, assigning unique IDs to each move for addressing.
- **Inline flow** — moves render as inline spans with move numbers, following
  standard chess notation layout.
- **Controlled component** — consumer owns navigation state via `currentMoveId`
  / `onSelectMove`.
- **CSS variable theming** — all colors via `--movesheet-*` CSS variables with
  `var()` fallbacks. No `theme` prop.
- **Peer dependency** — React ≥18 is a peer dependency, not bundled.

## Commands

```bash
pnpm build              # bundle TypeScript → dist/ via tsdown
pnpm test               # run all tests once (vitest run)
pnpm test:watch         # watch mode
pnpm test:coverage      # v8 coverage report
pnpm lint               # ESLint --fix + tsc --noEmit
pnpm lint:ci            # strict — zero warnings, no auto-fix
pnpm format             # Prettier --write
pnpm format:ci          # Prettier check
pnpm storybook          # dev server on port 6006
pnpm storybook:build    # build static storybook site
```

