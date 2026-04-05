import { describe, expect, it } from 'vitest';

import { nagToSymbol, toSAN } from '../notation.js';

import type { Move } from '../types.js';

describe('toSAN', () => {
  it('renders a pawn move', () => {
    const move: Move = { piece: 'P', to: 'e4' };
    expect(toSAN(move)).toBe('e4');
  });

  it('renders a piece move', () => {
    const move: Move = { piece: 'N', to: 'f3' };
    expect(toSAN(move)).toBe('Nf3');
  });

  it('renders a capture', () => {
    const move: Move = { capture: true, from: 'e', piece: 'P', to: 'd5' };
    expect(toSAN(move)).toBe('exd5');
  });

  it('renders a piece capture', () => {
    const move: Move = { capture: true, piece: 'B', to: 'c6' };
    expect(toSAN(move)).toBe('Bxc6');
  });

  it('renders disambiguation', () => {
    const move: Move = { from: 'a', piece: 'R', to: 'd1' };
    expect(toSAN(move)).toBe('Rad1');
  });

  it('renders kingside castling', () => {
    const move: Move = { castling: true, piece: 'K', to: 'g1' };
    expect(toSAN(move)).toBe('O-O');
  });

  it('renders queenside castling', () => {
    const move: Move = { castling: true, piece: 'K', to: 'c1' };
    expect(toSAN(move)).toBe('O-O-O');
  });

  it('renders check', () => {
    const move: Move = { check: true, piece: 'Q', to: 'h7' };
    expect(toSAN(move)).toBe('Qh7+');
  });

  it('renders checkmate', () => {
    const move: Move = { checkmate: true, piece: 'Q', to: 'h7' };
    expect(toSAN(move)).toBe('Qh7#');
  });

  it('renders promotion', () => {
    const move: Move = { piece: 'P', promotion: 'Q', to: 'e8' };
    expect(toSAN(move)).toBe('e8=Q');
  });

  it('renders capture + promotion', () => {
    const move: Move = {
      capture: true,
      from: 'd',
      piece: 'P',
      promotion: 'Q',
      to: 'e8',
    };
    expect(toSAN(move)).toBe('dxe8=Q');
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
