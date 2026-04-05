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
  currentMoveId?: string;
  game: PGN;
  keyboard?: boolean;
  onSelectMove?: (moveId: string) => void;
  showClock?: boolean;
  showComments?: boolean;
  showEvaluation?: boolean;
  showNags?: boolean;
}

export type { Eval, Move, MoveNode, MoveSheetProperties as MoveSheetProps };
