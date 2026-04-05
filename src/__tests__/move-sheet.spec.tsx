import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { MoveSheet } from '../move-sheet.js';

import type { Move } from '../types.js';
import type { PGN } from '@echecs/pgn';

function makePGN(moves: PGN['moves']): PGN {
  return { meta: {}, moves, result: '?' };
}

function makeMove(
  partial: Partial<Move> & { piece: Move['piece']; to: Move['to'] },
): Move {
  return partial as Move;
}

const simpleGame = makePGN([
  [1, makeMove({ piece: 'P', to: 'e4' }), makeMove({ piece: 'P', to: 'e5' })],
  [2, makeMove({ piece: 'N', to: 'f3' }), undefined],
]);

describe('MoveSheet rendering', () => {
  it('renders move numbers and SAN text for a simple game', () => {
    render(<MoveSheet game={simpleGame} />);

    expect(screen.getByText('1.')).toBeInTheDocument();
    expect(screen.getByText('e4')).toBeInTheDocument();
    expect(screen.getByText('e5')).toBeInTheDocument();
    expect(screen.getByText('2.')).toBeInTheDocument();
    expect(screen.getByText('Nf3')).toBeInTheDocument();
  });

  it('highlights the current move', () => {
    render(<MoveSheet currentMoveId="m1w" game={simpleGame} />);

    const activeSpan = document.querySelector('[data-move-id="m1w"]');
    expect(activeSpan).toBeInTheDocument();
    expect(activeSpan).toHaveStyle({ backgroundColor: expect.any(String) });
  });

  it('sets data-move-id on each move span', () => {
    render(<MoveSheet game={simpleGame} />);

    expect(document.querySelector('[data-move-id="m1w"]')).toBeInTheDocument();
    expect(document.querySelector('[data-move-id="m1b"]')).toBeInTheDocument();
    expect(document.querySelector('[data-move-id="m2w"]')).toBeInTheDocument();
  });

  it('renders comments when showComments is true (default)', () => {
    const gameWithComment = makePGN([
      [1, makeMove({ comment: 'Kings pawn', piece: 'P', to: 'e4' }), undefined],
    ]);
    render(<MoveSheet game={gameWithComment} />);

    expect(screen.getByText('Kings pawn')).toBeInTheDocument();
  });

  it('hides comments when showComments is false', () => {
    const gameWithComment = makePGN([
      [1, makeMove({ comment: 'Kings pawn', piece: 'P', to: 'e4' }), undefined],
    ]);
    render(<MoveSheet game={gameWithComment} showComments={false} />);

    expect(screen.queryByText('Kings pawn')).not.toBeInTheDocument();
  });

  it('renders NAG glyphs when showNags is true (default)', () => {
    const gameWithNag = makePGN([
      [1, makeMove({ annotations: ['1'], piece: 'P', to: 'e4' }), undefined],
    ]);
    render(<MoveSheet game={gameWithNag} />);

    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('hides NAGs when showNags is false', () => {
    const gameWithNag = makePGN([
      [1, makeMove({ annotations: ['1'], piece: 'P', to: 'e4' }), undefined],
    ]);
    render(<MoveSheet game={gameWithNag} showNags={false} />);

    expect(screen.queryByText('!')).not.toBeInTheDocument();
  });

  it('renders centipawn eval when showEvaluation is true', () => {
    const gameWithEval = makePGN([
      [
        1,
        makeMove({ eval: { type: 'cp', value: 35 }, piece: 'P', to: 'e4' }),
        undefined,
      ],
    ]);
    render(<MoveSheet game={gameWithEval} showEvaluation={true} />);

    expect(screen.getByText('+0.35')).toBeInTheDocument();
  });

  it('renders mate eval correctly', () => {
    const gameWithMate = makePGN([
      [
        1,
        makeMove({ eval: { type: 'mate', value: 3 }, piece: 'P', to: 'e4' }),
        undefined,
      ],
    ]);
    render(<MoveSheet game={gameWithMate} showEvaluation={true} />);

    expect(screen.getByText('M3')).toBeInTheDocument();
  });

  it('hides eval when showEvaluation is false (default)', () => {
    const gameWithEval = makePGN([
      [
        1,
        makeMove({ eval: { type: 'cp', value: 35 }, piece: 'P', to: 'e4' }),
        undefined,
      ],
    ]);
    render(<MoveSheet game={gameWithEval} />);

    expect(screen.queryByText('+0.35')).not.toBeInTheDocument();
  });

  it('renders clock when showClock is true', () => {
    const gameWithClock = makePGN([
      [1, makeMove({ clock: 3661, piece: 'P', to: 'e4' }), undefined],
    ]);
    render(<MoveSheet game={gameWithClock} showClock={true} />);

    expect(screen.getByText(/1:01:01/)).toBeInTheDocument();
  });

  it('hides clock when showClock is false (default)', () => {
    const gameWithClock = makePGN([
      [1, makeMove({ clock: 3661, piece: 'P', to: 'e4' }), undefined],
    ]);
    render(<MoveSheet game={gameWithClock} />);

    expect(screen.queryByText(/1:01:01/)).not.toBeInTheDocument();
  });
});

describe('MoveSheet variations', () => {
  it('renders variation moves', () => {
    const whiteMove2: Move = {
      ...makeMove({ piece: 'N', to: 'f3' }),
      variants: [[[2, makeMove({ piece: 'P', to: 'd4' }), undefined]]],
    };
    const gameWithVariation = makePGN([
      [
        1,
        makeMove({ piece: 'P', to: 'e4' }),
        makeMove({ piece: 'P', to: 'e5' }),
      ],
      [2, whiteMove2, undefined],
    ]);
    render(<MoveSheet game={gameWithVariation} />);

    expect(screen.getByText('Nf3')).toBeInTheDocument();
    expect(screen.getByText('d4')).toBeInTheDocument();
  });
});

describe('MoveSheet click interactions', () => {
  it('calls onSelectMove with correct move ID when clicking a move', () => {
    const onSelectMove = vi.fn();
    render(<MoveSheet game={simpleGame} onSelectMove={onSelectMove} />);

    const moveSpan = document.querySelector('[data-move-id="m1w"]');
    expect(moveSpan).toBeInTheDocument();
    fireEvent.click(moveSpan!);

    expect(onSelectMove).toHaveBeenCalledWith('m1w');
  });

  it('calls onSelectMove for any move in the game', () => {
    const onSelectMove = vi.fn();
    render(<MoveSheet game={simpleGame} onSelectMove={onSelectMove} />);

    const moveSpan = document.querySelector('[data-move-id="m1b"]');
    expect(moveSpan).toBeInTheDocument();
    fireEvent.click(moveSpan!);

    expect(onSelectMove).toHaveBeenCalledWith('m1b');
  });
});

describe('MoveSheet keyboard navigation', () => {
  it('ArrowRight navigates to next move', () => {
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m1w"
        game={simpleGame}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'ArrowRight' });

    expect(onSelectMove).toHaveBeenCalledWith('m1b');
  });

  it('ArrowLeft navigates to previous move', () => {
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m1b"
        game={simpleGame}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'ArrowLeft' });

    expect(onSelectMove).toHaveBeenCalledWith('m1w');
  });

  it('Home navigates to first move', () => {
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m2w"
        game={simpleGame}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'Home' });

    expect(onSelectMove).toHaveBeenCalledWith('m1w');
  });

  it('End navigates to last move in line', () => {
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m1w"
        game={simpleGame}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'End' });

    expect(onSelectMove).toHaveBeenCalledWith('m2w');
  });

  it('ArrowDown enters variation from parent move', () => {
    const whiteMove2: Move = {
      ...makeMove({ piece: 'N', to: 'f3' }),
      variants: [[[2, makeMove({ piece: 'P', to: 'd4' }), undefined]]],
    };
    const gameWithVariation = makePGN([
      [
        1,
        makeMove({ piece: 'P', to: 'e4' }),
        makeMove({ piece: 'P', to: 'e5' }),
      ],
      [2, whiteMove2, undefined],
    ]);
    // current = e5 (m1b), which has children: [m2w (Nf3), m2w-v0-m2w (d4)]
    // ArrowDown should enter the first variation
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m1b"
        game={gameWithVariation}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'ArrowDown' });

    expect(onSelectMove).toHaveBeenCalledWith('m2w-v0-m2w');
  });

  it('ArrowDown cycles to next sibling variation', () => {
    const whiteMove2: Move = {
      ...makeMove({ piece: 'N', to: 'f3' }),
      variants: [[[2, makeMove({ piece: 'P', to: 'd4' }), undefined]]],
    };
    const gameWithVariation = makePGN([
      [
        1,
        makeMove({ piece: 'P', to: 'e4' }),
        makeMove({ piece: 'P', to: 'e5' }),
      ],
      [2, whiteMove2, undefined],
    ]);
    // current = Nf3 (m2w), parent = m1b which has children: [m2w, m2w-v0-m2w]
    // Nf3 has no children with variations, so cycle to next sibling
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m2w"
        game={gameWithVariation}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'ArrowDown' });

    expect(onSelectMove).toHaveBeenCalledWith('m2w-v0-m2w');
  });

  it('ArrowUp exits variation (jumps to move before the fork)', () => {
    const whiteMove2: Move = {
      ...makeMove({ piece: 'N', to: 'f3' }),
      variants: [[[2, makeMove({ piece: 'P', to: 'd4' }), undefined]]],
    };
    const gameWithVariation = makePGN([
      [
        1,
        makeMove({ piece: 'P', to: 'e4' }),
        makeMove({ piece: 'P', to: 'e5' }),
      ],
      [2, whiteMove2, undefined],
    ]);
    // current = d4 variation node, parent = m1b which has children: [m2w, d4-variation]
    // ArrowUp should go to m1b (the move before the fork), not m2w
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m2w-v0-m2w"
        game={gameWithVariation}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'ArrowUp' });

    expect(onSelectMove).toHaveBeenCalledWith('m1b');
  });

  it('does NOT navigate when keyboard is false', () => {
    const onSelectMove = vi.fn();
    render(
      <MoveSheet
        currentMoveId="m1w"
        game={simpleGame}
        keyboard={false}
        onSelectMove={onSelectMove}
      />,
    );

    const container = document.querySelector('[tabindex="0"]')!;
    fireEvent.keyDown(container, { key: 'ArrowRight' });

    expect(onSelectMove).not.toHaveBeenCalled();
  });
});
