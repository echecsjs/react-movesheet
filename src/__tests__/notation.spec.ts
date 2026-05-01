import { describe, expect, it } from 'vitest';

import { nagToSymbol, toSAN } from '../notation.js';

import type { Move } from '../types.js';

function makeMove(
  partial: Partial<Move> & { piece: Move['piece']; to: Move['to'] },
): Move {
  return partial as Move;
}

describe('toSAN', () => {
  it('renders a pawn move', () => {
    expect(toSAN(makeMove({ piece: 'pawn', to: 'e4' }))).toBe('e4');
  });

  it('renders a piece move', () => {
    expect(toSAN(makeMove({ piece: 'knight', to: 'f3' }))).toBe('Nf3');
  });

  it('renders a capture', () => {
    expect(
      toSAN(makeMove({ capture: true, from: 'e', piece: 'pawn', to: 'd5' })),
    ).toBe('exd5');
  });

  it('renders a piece capture', () => {
    expect(toSAN(makeMove({ capture: true, piece: 'bishop', to: 'c6' }))).toBe(
      'Bxc6',
    );
  });

  it('renders disambiguation', () => {
    expect(toSAN(makeMove({ from: 'a', piece: 'rook', to: 'd1' }))).toBe(
      'Rad1',
    );
  });

  it('renders kingside castling', () => {
    expect(toSAN(makeMove({ castling: true, piece: 'king', to: 'g1' }))).toBe(
      'O-O',
    );
  });

  it('renders queenside castling', () => {
    expect(toSAN(makeMove({ castling: true, piece: 'king', to: 'c1' }))).toBe(
      'O-O-O',
    );
  });

  it('renders check', () => {
    expect(toSAN(makeMove({ check: true, piece: 'queen', to: 'h7' }))).toBe(
      'Qh7+',
    );
  });

  it('renders checkmate', () => {
    expect(toSAN(makeMove({ checkmate: true, piece: 'queen', to: 'h7' }))).toBe(
      'Qh7#',
    );
  });

  it('renders promotion', () => {
    expect(
      toSAN(makeMove({ piece: 'pawn', promotion: 'queen', to: 'e8' })),
    ).toBe('e8=Q');
  });

  it('renders capture + promotion', () => {
    expect(
      toSAN(
        makeMove({
          capture: true,
          from: 'd',
          piece: 'pawn',
          promotion: 'queen',
          to: 'e8',
        }),
      ),
    ).toBe('dxe8=Q');
  });
});

describe('nagToSymbol', () => {
  it('maps NAG 1 to !', () => {
    expect(nagToSymbol('1')).toBe('!');
  });

  it('maps NAG 2 to ?', () => {
    expect(nagToSymbol('2')).toBe('?');
  });

  it('maps NAG 3 to !!', () => {
    expect(nagToSymbol('3')).toBe('!!');
  });

  it('maps NAG 4 to ??', () => {
    expect(nagToSymbol('4')).toBe('??');
  });

  it('maps NAG 5 to !?', () => {
    expect(nagToSymbol('5')).toBe('!?');
  });

  it('maps NAG 6 to ?!', () => {
    expect(nagToSymbol('6')).toBe('?!');
  });

  it('returns $N for unknown NAGs', () => {
    expect(nagToSymbol('99')).toBe('$99');
  });
});
