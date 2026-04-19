import { useCallback, useEffect, useMemo, useRef } from 'react';

import { nagToSymbol } from './notation.js';
import { buildTree, findNode } from './tree.js';

import type {
  Eval,
  MoveNode,
  MoveSheetProps as MoveSheetProperties,
} from './types.js';
import type { PGN } from '@echecs/pgn';
import type { CSSProperties, KeyboardEvent, ReactNode } from 'react';

function formatEval(evaluation: Eval): string {
  if (evaluation.type === 'mate') {
    return `M${String(evaluation.value)}`;
  }

  const value = evaluation.value / 100;
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}`;
}

function formatClock(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const mm = String(minutes).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');

  if (hours > 0) {
    return `${String(hours)}:${mm}:${ss}`;
  }

  return `${String(minutes)}:${ss}`;
}

interface RenderNodeOptions {
  currentMoveId: string | undefined;
  depth: number;
  isFirstInVariation: boolean;
  node: MoveNode;
  onContextMenu: ((moveId: string) => void) | undefined;
  onSelectMove: ((moveId: string) => void) | undefined;
  showClock: boolean;
  showComments: boolean;
  showEvaluation: boolean;
  showNags: boolean;
}

function renderNode(options: RenderNodeOptions): ReactNode[] {
  const {
    currentMoveId,
    depth,
    isFirstInVariation,
    node,
    onContextMenu,
    onSelectMove,
    showClock,
    showComments,
    showEvaluation,
    showNags,
  } = options;

  const elements: ReactNode[] = [];
  const isActive = node.id === currentMoveId;
  const isWhite = node.side === 'white';

  // Move number label
  if (isWhite) {
    elements.push(
      <span
        key={`${node.id}-num`}
        style={{ color: 'var(--movesheet-move-number, inherit)' }}
      >
        {node.moveNumber}.{' '}
      </span>,
    );
  } else if (isFirstInVariation) {
    // First black move in a variation: show "N..."
    elements.push(
      <span
        key={`${node.id}-num`}
        style={{ color: 'var(--movesheet-move-number, inherit)' }}
      >
        {node.moveNumber}...{' '}
      </span>,
    );
  }

  // Move span
  const moveStyle: CSSProperties = {
    backgroundColor: isActive
      ? 'var(--movesheet-active-move, #d4e8ff)'
      : undefined,
    color: 'var(--movesheet-move-text, inherit)',
    cursor: 'pointer',
  };

  elements.push(
    <span
      data-move-id={node.id}
      key={node.id}
      onClick={() => {
        onSelectMove?.(node.id);
      }}
      onContextMenu={
        onContextMenu
          ? (event) => {
              event.preventDefault();
              onContextMenu(node.id);
            }
          : undefined
      }
      style={moveStyle}
    >
      {node.san}
      {showNags && node.nags !== undefined && node.nags.length > 0 && (
        <span style={{ color: 'var(--movesheet-nag, inherit)' }}>
          {node.nags.map((nag) => nagToSymbol(nag)).join('')}
        </span>
      )}
    </span>,
  );

  // Evaluation
  if (showEvaluation && node.eval !== undefined) {
    elements.push(
      <span
        key={`${node.id}-eval`}
        style={{ color: 'var(--movesheet-evaluation, gray)' }}
      >
        {' ('}
        <span key={`${node.id}-eval-value`}>{formatEval(node.eval)}</span>
        {')'}
      </span>,
    );
  }

  // Clock
  if (showClock && node.clock !== undefined) {
    elements.push(
      <span
        key={`${node.id}-clock`}
        style={{ color: 'var(--movesheet-evaluation, gray)' }}
      >
        {' '}
        [{formatClock(node.clock)}]
      </span>,
    );
  }

  elements.push(' ');

  // Comment
  if (showComments && node.comment !== undefined) {
    elements.push(
      <span
        key={`${node.id}-comment`}
        style={{
          color: 'var(--movesheet-comment, #666)',
          display: 'var(--movesheet-comment-display, inline)',
          fontStyle: 'var(--movesheet-comment-font-style, italic)',
        }}
      >
        {node.comment}
      </span>,
      ' ',
    );
  }

  // Variations (children[1+])
  const variations = node.children.slice(1);
  for (const [index, variationStart] of variations.entries()) {
    const variationElements = renderVariation({
      currentMoveId,
      depth: depth + 1,
      onContextMenu,
      onSelectMove,
      showClock,
      showComments,
      showEvaluation,
      showNags,
      startNode: variationStart,
    });

    elements.push(
      <div
        key={`${node.id}-var-${String(index)}`}
        style={{
          color: 'var(--movesheet-variation, #888)',
          paddingLeft: `${(depth + 1) * 16}px`,
        }}
      >
        {'('}
        {variationElements}
        {')'}
      </div>,
    );
  }

  return elements;
}

interface RenderVariationOptions {
  currentMoveId: string | undefined;
  depth: number;
  onContextMenu: ((moveId: string) => void) | undefined;
  onSelectMove: ((moveId: string) => void) | undefined;
  showClock: boolean;
  showComments: boolean;
  showEvaluation: boolean;
  showNags: boolean;
  startNode: MoveNode;
}

function renderVariation(options: RenderVariationOptions): ReactNode[] {
  const {
    currentMoveId,
    depth,
    onContextMenu,
    onSelectMove,
    showClock,
    showComments,
    showEvaluation,
    showNags,
    startNode,
  } = options;

  const elements: ReactNode[] = [];
  let current: MoveNode | undefined = startNode;
  let isFirst = true;

  while (current !== undefined) {
    const nodeElements = renderNode({
      currentMoveId,
      depth,
      isFirstInVariation: isFirst && current.side === 'black',
      node: current,
      onContextMenu,
      onSelectMove,
      showClock,
      showComments,
      showEvaluation,
      showNags,
    });
    elements.push(...nodeElements);
    isFirst = false;
    current = current.children[0];
  }

  return elements;
}

function renderMainLine(
  options: Omit<RenderVariationOptions, 'depth' | 'startNode'> & {
    root: MoveNode;
  },
): ReactNode[] {
  const { root, ...rest } = options;
  const firstChild = root.children[0];
  if (firstChild === undefined) {
    return [];
  }

  return renderVariation({ ...rest, depth: 0, startNode: firstChild });
}

function MoveSheet({
  currentMoveId,
  game,
  keyboard = true,
  onContextMenu,
  onSelectMove,
  showClock = false,
  showComments = true,
  showEvaluation = false,
  showNags = true,
}: MoveSheetProperties): ReactNode {
  const containerReference = useRef<HTMLDivElement>(null);

  const root = useMemo(() => buildTree(game as PGN), [game]);

  // Auto-scroll active move into view
  useEffect(() => {
    if (currentMoveId === undefined) {
      return;
    }

    const element = containerReference.current?.querySelector(
      `[data-move-id="${currentMoveId}"]`,
    );

    if (
      element !== null &&
      element !== undefined &&
      typeof element.scrollIntoView === 'function'
    ) {
      element.scrollIntoView({ block: 'nearest' });
    }
  }, [currentMoveId]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (!keyboard || onSelectMove === undefined) {
        return;
      }

      const currentNode =
        currentMoveId === undefined ? undefined : findNode(root, currentMoveId);

      switch (event.key) {
        case 'ArrowRight': {
          // Next move: first child of current node
          const nextNode = currentNode?.children[0] ?? root.children[0];
          if (nextNode !== undefined) {
            event.preventDefault();
            onSelectMove(nextNode.id);
          }
          break;
        }

        case 'ArrowLeft': {
          // Previous move: parent (skip root)
          if (
            currentNode?.parent !== undefined &&
            currentNode.parent.id !== 'root'
          ) {
            event.preventDefault();
            onSelectMove(currentNode.parent.id);
          }
          break;
        }

        case 'Home': {
          // First move in tree
          const firstMove = root.children[0];
          if (firstMove !== undefined) {
            event.preventDefault();
            onSelectMove(firstMove.id);
          }
          break;
        }

        case 'End': {
          // Last move in current line: follow first children to leaf
          let last = currentNode ?? root.children[0];
          if (last !== undefined) {
            while (last.children[0] !== undefined) {
              last = last.children[0];
            }
            event.preventDefault();
            onSelectMove(last.id);
          }
          break;
        }

        case 'ArrowDown': {
          // Enter variation: if current node has variations (multiple
          // children), jump to the first variation (second child).
          // If already in a variation, cycle to the next sibling.
          if (currentNode !== undefined) {
            if (currentNode.children.length > 1) {
              // Current node has variations — enter first one
              const firstVariation = currentNode.children[1];
              if (firstVariation !== undefined) {
                event.preventDefault();
                onSelectMove(firstVariation.id);
              }
            } else if (currentNode.parent !== undefined) {
              // Cycle to next sibling variation
              const siblings = currentNode.parent.children;
              const currentIndex = siblings.indexOf(currentNode);
              const nextSibling = siblings[currentIndex + 1];
              if (nextSibling !== undefined) {
                event.preventDefault();
                onSelectMove(nextSibling.id);
              }
            }
          }
          break;
        }

        case 'ArrowUp': {
          // Exit variation: walk up the tree to find the branch point
          // (where the current line diverges from the main line), then
          // jump to the parent of that branch point — the move before
          // the variation started.
          if (currentNode !== undefined) {
            let node: MoveNode | undefined = currentNode;
            while (node?.parent !== undefined) {
              const firstSibling = node.parent.children[0];
              if (firstSibling !== undefined && firstSibling.id !== node.id) {
                // Found the branch point — jump to parent (the move
                // before the fork), unless it's root
                const target = node.parent;
                if (target.id !== 'root') {
                  event.preventDefault();
                  onSelectMove(target.id);
                }
                break;
              }
              node = node.parent;
            }
          }
          break;
        }

        default: {
          break;
        }
      }
    },
    [currentMoveId, keyboard, onSelectMove, root],
  );

  const containerStyle: CSSProperties = {
    background: 'var(--movesheet-background, transparent)',
    fontFamily: 'var(--movesheet-font-family, inherit)',
    fontSize: 'var(--movesheet-font-size, inherit)',
    lineHeight: 'var(--movesheet-line-height, 1.6)',
    overflow: 'auto',
  };

  const content = renderMainLine({
    currentMoveId,
    onContextMenu,
    onSelectMove,
    root,
    showClock,
    showComments,
    showEvaluation,
    showNags,
  });

  return (
    <div
      onKeyDown={handleKeyDown}
      ref={containerReference}
      style={containerStyle}
      tabIndex={0}
    >
      {content}
    </div>
  );
}

export { MoveSheet };
