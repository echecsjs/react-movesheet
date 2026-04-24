import type { PGN } from '@echecs/pgn';

type Move = NonNullable<PGN['moves'][number][1]>;

interface Eval {
  depth?: number;
  type: 'cp' | 'mate';
  value: number;
}

interface MoveNode {
  children: MoveNode[];
  clock?: number;
  comment?: string;
  eval?: Eval;
  id: string;
  moveNumber: number;
  nags?: string[];
  parent?: MoveNode;
  san: string;
  side: 'black' | 'white';
}

interface MoveSheetProperties {
  /** ID of the move to highlight as the current position. */
  currentMoveId?: string;
  /** Parsed PGN game object to display. */
  game: PGN;
  /** Enable arrow-key navigation (Right/Left, Up/Down for variations, Home/End). */
  keyboard?: boolean;
  /** Called when a move is right-clicked. Receives the move ID. */
  onContextMenu?: (moveId: string) => void;
  /** Called when a move is clicked. Receives the move ID. */
  onSelectMove?: (moveId: string) => void;
  /** Show clock annotations next to moves. */
  showClock?: boolean;
  /** Show inline text comments. */
  showComments?: boolean;
  /** Show evaluation annotations (centipawn or mate). */
  showEvaluation?: boolean;
  /** Show Numeric Annotation Glyphs (!, ?, !!, etc.). */
  showNags?: boolean;
}

export type { Eval, Move, MoveNode, MoveSheetProperties as MoveSheetProps };
