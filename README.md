# @echecs/react-movesheet

React move notation panel — displays chess game moves with click navigation,
variations, comments, NAGs, evaluation, clock, and keyboard navigation. Inline
styles with CSS variable theming, zero dependencies beyond React and
`@echecs/pgn`.

## Installation

```bash
npm install @echecs/react-movesheet
# or
pnpm add @echecs/react-movesheet
```

React >=18 is a peer dependency.

## Quick start

### Minimal

```tsx
import parse from '@echecs/pgn';
import { MoveSheet } from '@echecs/react-movesheet';

const [game] = parse('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *');

export function App() {
  return <MoveSheet game={game} />;
}
```

### With navigation

```tsx
import { useState } from 'react';
import parse from '@echecs/pgn';
import { MoveSheet } from '@echecs/react-movesheet';

const [game] = parse('1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 *');

export function App() {
  const [moveId, setMoveId] = useState<string | undefined>();

  return (
    <MoveSheet
      currentMoveId={moveId}
      game={game}
      onSelectMove={setMoveId}
      showComments
      showNags
    />
  );
}
```

## Props

| Prop             | Type                       | Default     | Description                        |
| ---------------- | -------------------------- | ----------- | ---------------------------------- |
| `game`           | `PGN`                      | required    | Parsed PGN game from `@echecs/pgn` |
| `currentMoveId`  | `string`                   | `undefined` | ID of the currently active move    |
| `onSelectMove`   | `(moveId: string) => void` | —           | Called when a move is clicked      |
| `showComments`   | `boolean`                  | `true`      | Show inline comment text           |
| `showEvaluation` | `boolean`                  | `false`     | Show engine evaluation after moves |
| `showNags`       | `boolean`                  | `true`      | Show NAG glyphs (!, ?, !!, ??)     |
| `showClock`      | `boolean`                  | `false`     | Show clock times                   |
| `keyboard`       | `boolean`                  | `true`      | Enable arrow key navigation        |

## Keyboard navigation

When `keyboard` is enabled and the panel is focused:

| Key   | Action                                          |
| ----- | ----------------------------------------------- |
| Right | Next move (main continuation)                   |
| Left  | Previous move                                   |
| Down  | Enter variation / cycle between variations      |
| Up    | Exit variation (jump to move before the branch) |
| Home  | First move                                      |
| End   | Last move in current line                       |

## CSS variable theming

All colours are controlled via CSS custom properties on a parent element:

```tsx
<div
  style={{
    '--movesheet-background': '#1a1a2e',
    '--movesheet-move-text': '#e0e0e0',
    '--movesheet-active-move': '#3a5a8c',
    '--movesheet-comment': '#8899aa',
    '--movesheet-nag': '#cc8844',
    '--movesheet-evaluation': '#6699cc',
    '--movesheet-variation': '#7788aa',
    '--movesheet-move-number': '#556677',
  }}
>
  <MoveSheet game={game} />
</div>
```

| Variable                  | Default       | Description           |
| ------------------------- | ------------- | --------------------- |
| `--movesheet-background`  | `transparent` | Panel background      |
| `--movesheet-active-move` | `#d4e8ff`     | Active move bg        |
| `--movesheet-move-text`   | `inherit`     | Move SAN colour       |
| `--movesheet-move-number` | `inherit`     | Move number colour    |
| `--movesheet-comment`     | `#666`        | Comment text colour   |
| `--movesheet-nag`         | `inherit`     | NAG glyph colour      |
| `--movesheet-evaluation`  | `gray`        | Eval text colour      |
| `--movesheet-variation`   | `#888`        | Variation text colour |

## Utilities

The package also exports tree utilities for advanced use:

```tsx
import { buildTree, findNode, pathToNode } from '@echecs/react-movesheet';
import type { MoveNode } from '@echecs/react-movesheet';

const root = buildTree(game);
const node = findNode(root, 'm3w');
const path = pathToNode(root, 'm3w'); // [root, m1w, m1b, m2w, m2b, m3w]
```

## License

MIT
