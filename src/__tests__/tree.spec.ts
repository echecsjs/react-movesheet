import { describe, expect, it } from 'vitest';

import { buildTree, findNode, pathToNode } from '../tree.js';

import type { Move } from '../types.js';
import type { PGN } from '@echecs/pgn';

function makePGN(moves: PGN['moves']): PGN {
  return { meta: {}, moves, result: '?' };
}

function makeMove(
  partial: Partial<Move> & { to: Move['to']; piece: Move['piece'] },
): Move {
  return partial as Move;
}

describe('buildTree', () => {
  it('returns a root node with no children for empty moves', () => {
    const tree = buildTree(makePGN([]));

    expect(tree.id).toBe('root');
    expect(tree.san).toBe('');
    expect(tree.moveNumber).toBe(0);
    expect(tree.side).toBe('white');
    expect(tree.children).toHaveLength(0);
    expect(tree.parent).toBeUndefined();
  });

  it('builds a simple main line with correct IDs, SAN, side, and moveNumber', () => {
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
      [
        2,
        makeMove({ piece: 'knight', to: 'f3' }),
        makeMove({ piece: 'knight', to: 'c6' }),
      ],
    ]);
    const root = buildTree(game);

    expect(root.children).toHaveLength(1);

    const m1w = root.children[0]!;
    expect(m1w.id).toBe('m1w');
    expect(m1w.san).toBe('e4');
    expect(m1w.side).toBe('white');
    expect(m1w.moveNumber).toBe(1);

    const m1b = m1w.children[0]!;
    expect(m1b.id).toBe('m1b');
    expect(m1b.san).toBe('e5');
    expect(m1b.side).toBe('black');
    expect(m1b.moveNumber).toBe(1);

    const m2w = m1b.children[0]!;
    expect(m2w.id).toBe('m2w');
    expect(m2w.san).toBe('Nf3');
    expect(m2w.side).toBe('white');
    expect(m2w.moveNumber).toBe(2);

    const m2b = m2w.children[0]!;
    expect(m2b.id).toBe('m2b');
    expect(m2b.san).toBe('Nc6');
    expect(m2b.side).toBe('black');
    expect(m2b.moveNumber).toBe(2);

    expect(m2b.children).toHaveLength(0);
  });

  it('handles white-only move pair', () => {
    const game = makePGN([
      [1, makeMove({ piece: 'pawn', to: 'e4' }), undefined],
    ]);
    const root = buildTree(game);

    expect(root.children).toHaveLength(1);
    const m1w = root.children[0]!;
    expect(m1w.id).toBe('m1w');
    expect(m1w.children).toHaveLength(0);
  });

  it('handles black-only first pair (white is undefined)', () => {
    const game = makePGN([
      [1, undefined, makeMove({ piece: 'pawn', to: 'e5' })],
    ]);
    const root = buildTree(game);

    expect(root.children).toHaveLength(1);
    const m1b = root.children[0]!;
    expect(m1b.id).toBe('m1b');
    expect(m1b.san).toBe('e5');
    expect(m1b.side).toBe('black');
  });

  it('transfers comment and NAGs from Move to MoveNode', () => {
    const move = makeMove({
      annotations: ['1', '6'],
      comment: 'Strong move',
      piece: 'pawn',
      to: 'e4',
    });
    const game = makePGN([[1, move, undefined]]);
    const root = buildTree(game);

    const m1w = root.children[0]!;
    expect(m1w.comment).toBe('Strong move');
    expect(m1w.nags).toEqual(['1', '6']);
  });

  it('does not set nags when annotations is undefined', () => {
    const move = makeMove({ piece: 'knight', to: 'f3' });
    const game = makePGN([[1, move, undefined]]);
    const root = buildTree(game);

    const m1w = root.children[0]!;
    expect(m1w.nags).toBeUndefined();
  });

  it('transfers eval from Move to MoveNode', () => {
    const move = makeMove({
      eval: { depth: 20, type: 'cp', value: 35 },
      piece: 'pawn',
      to: 'e4',
    });
    const game = makePGN([[1, move, undefined]]);
    const root = buildTree(game);

    const m1w = root.children[0]!;
    expect(m1w.eval).toEqual({ depth: 20, type: 'cp', value: 35 });
  });

  it('transfers clock from Move to MoveNode', () => {
    const move = makeMove({ clock: 120, piece: 'pawn', to: 'e4' });
    const game = makePGN([[1, move, undefined]]);
    const root = buildTree(game);

    const m1w = root.children[0]!;
    expect(m1w.clock).toBe(120);
  });

  it('builds variations as additional children of the parent node', () => {
    // 1. e4 e5 2. Nf3 (2. d4) (2. Bc4)
    // Nf3 has 2 variants: d4 and Bc4
    // All three are children of m1b
    const whiteMove2: Move = {
      ...makeMove({ piece: 'knight', to: 'f3' }),
      variants: [
        [[2, makeMove({ piece: 'pawn', to: 'd4' }), undefined]],
        [[2, makeMove({ piece: 'bishop', to: 'c4' }), undefined]],
      ],
    };
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
      [2, whiteMove2, undefined],
    ]);
    const root = buildTree(game);

    const m1b = root.children[0]!.children[0]!;
    expect(m1b.id).toBe('m1b');
    expect(m1b.children).toHaveLength(3);

    // main line child
    expect(m1b.children[0]!.id).toBe('m2w');
    expect(m1b.children[0]!.san).toBe('Nf3');

    // first variation: d4
    expect(m1b.children[1]!.id).toBe('m2w-v0-m2w');
    expect(m1b.children[1]!.san).toBe('d4');

    // second variation: Bc4
    expect(m1b.children[2]!.id).toBe('m2w-v1-m2w');
    expect(m1b.children[2]!.san).toBe('Bc4');
  });

  it('builds nested variations (variation inside a variation)', () => {
    // 1. e4 e5 2. Nf3 (2. d4 (2. c4))
    // Nf3's first variation is d4, and d4 itself has a sub-variation c4.
    // c4 is an alternative to d4, so it attaches to d4's parent (m1b).
    // Final m1b.children: [Nf3 (m2w), d4 (m2w-v0-m2w), c4 (m2w-v0-m2w-v0-m2w)]
    const innerVariant: Move = makeMove({ piece: 'pawn', to: 'c4' });
    const d4Move: Move = {
      ...makeMove({ piece: 'pawn', to: 'd4' }),
      variants: [[[2, innerVariant, undefined]]],
    };
    const nf3Move: Move = {
      ...makeMove({ piece: 'knight', to: 'f3' }),
      variants: [[[2, d4Move, undefined]]],
    };
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
      [2, nf3Move, undefined],
    ]);
    const root = buildTree(game);

    const m1b = root.children[0]!.children[0]!;
    // m1b children: Nf3 (main), d4 (v0), c4 (nested v0 of d4)
    expect(m1b.children).toHaveLength(3);

    const d4Node = m1b.children[1]!;
    expect(d4Node.id).toBe('m2w-v0-m2w');
    expect(d4Node.san).toBe('d4');

    const c4Node = m1b.children[2]!;
    expect(c4Node.id).toBe('m2w-v0-m2w-v0-m2w');
    expect(c4Node.san).toBe('c4');
  });

  it('sets parent references correctly', () => {
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
    ]);
    const root = buildTree(game);

    const m1w = root.children[0]!;
    const m1b = m1w.children[0]!;

    expect(m1w.parent).toBe(root);
    expect(m1b.parent).toBe(m1w);
    expect(root.parent).toBeUndefined();
  });
});

describe('findNode', () => {
  it('finds the root node', () => {
    const root = buildTree(makePGN([]));
    expect(findNode(root, 'root')).toBe(root);
  });

  it('finds a main line node', () => {
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
    ]);
    const root = buildTree(game);

    const node = findNode(root, 'm1b');
    expect(node).toBeDefined();
    expect(node!.id).toBe('m1b');
    expect(node!.san).toBe('e5');
  });

  it('finds a variation node', () => {
    const whiteMove2: Move = {
      ...makeMove({ piece: 'knight', to: 'f3' }),
      variants: [[[2, makeMove({ piece: 'pawn', to: 'd4' }), undefined]]],
    };
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
      [2, whiteMove2, undefined],
    ]);
    const root = buildTree(game);

    const node = findNode(root, 'm2w-v0-m2w');
    expect(node).toBeDefined();
    expect(node!.san).toBe('d4');
  });

  it('returns undefined for a non-existent ID', () => {
    const root = buildTree(makePGN([]));
    expect(findNode(root, 'nonexistent')).toBeUndefined();
  });
});

describe('pathToNode', () => {
  it('returns empty array for a non-existent ID', () => {
    const root = buildTree(makePGN([]));
    expect(pathToNode(root, 'nonexistent')).toEqual([]);
  });

  it('returns [root] for the root ID', () => {
    const root = buildTree(makePGN([]));
    expect(pathToNode(root, 'root')).toEqual([root]);
  });

  it('returns full path for a main line node', () => {
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
    ]);
    const root = buildTree(game);
    const m1w = root.children[0]!;
    const m1b = m1w.children[0]!;

    const path = pathToNode(root, 'm1b');
    expect(path).toEqual([root, m1w, m1b]);
  });

  it('returns full path for a variation node', () => {
    const whiteMove2: Move = {
      ...makeMove({ piece: 'knight', to: 'f3' }),
      variants: [[[2, makeMove({ piece: 'pawn', to: 'd4' }), undefined]]],
    };
    const game = makePGN([
      [
        1,
        makeMove({ piece: 'pawn', to: 'e4' }),
        makeMove({ piece: 'pawn', to: 'e5' }),
      ],
      [2, whiteMove2, undefined],
    ]);
    const root = buildTree(game);

    const m1w = root.children[0]!;
    const m1b = m1w.children[0]!;
    const variableNode = m1b.children[1]!; // d4 variation

    const path = pathToNode(root, 'm2w-v0-m2w');
    expect(path).toEqual([root, m1w, m1b, variableNode]);
  });
});
