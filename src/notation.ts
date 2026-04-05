import type { Move } from './types.js';

const KINGSIDE_SQUARES = new Set(['g1', 'g8']);

const NAG_SYMBOLS: Record<string, string> = {
  '1': '!',
  '2': '?',
  '3': '!!',
  '4': '??',
  '5': '!?',
  '6': '?!',
};

function applyIndicators(san: string, move: Move): string {
  if (move.checkmate) {
    return san + '#';
  }
  if (move.check) {
    return san + '+';
  }
  return san;
}

function nagToSymbol(nag: string): string {
  return NAG_SYMBOLS[nag] ?? `$${nag}`;
}

function toSAN(move: Move): string {
  if (move.castling) {
    return applyIndicators(
      KINGSIDE_SQUARES.has(move.to) ? 'O-O' : 'O-O-O',
      move,
    );
  }

  let san = '';

  if (move.piece === 'P') {
    san += move.capture ? (move.from ?? '') + 'x' + move.to : move.to;
    if (move.promotion !== undefined) {
      san += '=' + move.promotion;
    }
  } else {
    san += move.piece;
    if (move.from !== undefined) {
      san += move.from;
    }
    if (move.capture) {
      san += 'x';
    }
    san += move.to;
  }

  return applyIndicators(san, move);
}

export { nagToSymbol, toSAN };
