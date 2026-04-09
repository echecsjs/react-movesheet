# AGENTS.md — @echecs/react-movesheet

Coding-agent reference for the `react-movesheet` package.

**Backlog:** tracked in [GitHub Issues](https://github.com/mormubis/react-movesheet/issues).

## Overview

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

## Package structure

```
src/
  move-sheet.tsx           # Main MoveSheet component
  tree.ts                  # buildTree, findNode, pathToNode utilities
  types.ts                 # MoveNode, MoveSheetProps
  notation.ts              # Move → SAN string, NAG → symbol
  index.ts                 # Barrel exports
  __tests__/
    tree.spec.ts           # Tree building and navigation tests
    notation.spec.ts       # SAN rendering tests
    move-sheet.spec.tsx    # Component tests
  __stories__/
    move-sheet.stories.tsx # Storybook stories
    fixtures.ts            # PGN game fixtures (real games)
```

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

## Component API

### `<MoveSheet />`

| Prop             | Type                       | Default     | Description                        |
| ---------------- | -------------------------- | ----------- | ---------------------------------- |
| `game`           | `PGN`                      | required    | Parsed PGN game from `@echecs/pgn` |
| `currentMoveId`  | `string`                   | `undefined` | ID of the currently selected move  |
| `onSelectMove`   | `(moveId: string) => void` | —           | Called when a move is clicked      |
| `showComments`   | `boolean`                  | `true`      | Show comment text                  |
| `showEvaluation` | `boolean`                  | `false`     | Show inline eval after moves       |
| `showNags`       | `boolean`                  | `true`      | Show NAG glyphs                    |
| `showClock`      | `boolean`                  | `false`     | Show clock times                   |
| `keyboard`       | `boolean`                  | `true`      | Enable arrow key navigation        |

### CSS Variables

All styling via `--movesheet-*` CSS variables set on a parent element:

| Variable                  | Fallback      | Description          |
| ------------------------- | ------------- | -------------------- |
| `--movesheet-background`  | `transparent` | Panel background     |
| `--movesheet-active-move` | `#d4e8ff`     | Active move bg       |
| `--movesheet-move-text`   | `inherit`     | Move SAN color       |
| `--movesheet-move-number` | `inherit`     | Move number color    |
| `--movesheet-comment`     | `#666`        | Comment text color   |
| `--movesheet-nag`         | `inherit`     | NAG glyph color      |
| `--movesheet-evaluation`  | `gray`        | Eval text color      |
| `--movesheet-variation`   | `#888`        | Variation text color |

## Conventions

See the monorepo root `AGENTS.md` for TypeScript, ESLint, formatting, and
testing conventions that apply here.
