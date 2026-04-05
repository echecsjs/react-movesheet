import { toSAN } from './notation.js';

import type { Eval, Move, MoveNode } from './types.js';
import type { PGN } from '@echecs/pgn';

type MoveList = PGN['moves'];

function createNode(
  move: Move,
  moveNumber: number,
  side: 'black' | 'white',
  id: string,
  parent: MoveNode,
): MoveNode {
  const node: MoveNode = {
    children: [],
    id,
    moveNumber,
    parent,
    san: toSAN(move),
    side,
  };

  if (move.clock !== undefined) {
    node.clock = move.clock;
  }

  if (move.comment !== undefined) {
    node.comment = move.comment;
  }

  if (move.eval !== undefined) {
    node.eval = move.eval as Eval;
  }

  if (move.annotations !== undefined) {
    node.nags = move.annotations;
  }

  return node;
}

function buildMoveList(
  moves: MoveList,
  parent: MoveNode,
  idPrefix: string,
): void {
  let current = parent;

  for (const pair of moves) {
    const [moveNumber, whiteMove, blackMove] = pair;

    if (whiteMove !== undefined) {
      const id = `${idPrefix}m${String(moveNumber)}w`;
      const node = createNode(whiteMove, moveNumber, 'white', id, current);
      current.children.push(node);

      if (whiteMove.variants !== undefined) {
        for (const [variableIndex, variation] of whiteMove.variants.entries()) {
          const variablePrefix = `${id}-v${String(variableIndex)}-`;
          buildMoveList(variation, current, variablePrefix);
        }
      }

      current = node;
    }

    if (blackMove !== undefined) {
      const id = `${idPrefix}m${String(moveNumber)}b`;
      const node = createNode(blackMove, moveNumber, 'black', id, current);
      current.children.push(node);

      if (blackMove.variants !== undefined) {
        for (const [variableIndex, variation] of blackMove.variants.entries()) {
          const variablePrefix = `${id}-v${String(variableIndex)}-`;
          buildMoveList(variation, current, variablePrefix);
        }
      }

      current = node;
    }
  }
}

function buildTree(game: PGN): MoveNode {
  const root: MoveNode = {
    children: [],
    id: 'root',
    moveNumber: 0,
    san: '',
    side: 'white',
  };

  buildMoveList(game.moves, root, '');
  return root;
}

function findNode(root: MoveNode, id: string): MoveNode | undefined {
  if (root.id === id) {
    return root;
  }

  for (const child of root.children) {
    const found = findNode(child, id);
    if (found !== undefined) {
      return found;
    }
  }

  return undefined;
}

function pathToNode(root: MoveNode, id: string): MoveNode[] {
  if (root.id === id) {
    return [root];
  }

  for (const child of root.children) {
    const subPath = pathToNode(child, id);
    if (subPath.length > 0) {
      return [root, ...subPath];
    }
  }

  return [];
}

export { buildTree, findNode, pathToNode };
