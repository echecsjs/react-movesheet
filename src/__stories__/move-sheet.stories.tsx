import { useState } from 'react';

import { MoveSheet } from '../move-sheet.js';
import {
  ANNOTATED_GAME,
  EMPTY_GAME,
  KASPAROV_IMMORTAL,
  OPERA_GAME,
} from './fixtures.js';

import type { MoveSheetProps as MoveSheetProperties } from '../types.js';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<MoveSheetProperties> = {
  argTypes: {
    currentMoveId: { control: 'text' },
    keyboard: { control: 'boolean' },
    showClock: { control: 'boolean' },
    showComments: { control: 'boolean' },
    showEvaluation: { control: 'boolean' },
    showNags: { control: 'boolean' },
  },
  component: MoveSheet,
  decorators: [
    (Story) => (
      <div style={{ height: 500, width: 400 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
  title: 'MoveSheet',
};

export default meta;

type Story = StoryObj<MoveSheetProperties>;

// -- Default: Morphy's Opera Game with all defaults ---

export const Default: Story = {
  args: {
    game: OPERA_GAME,
    keyboard: true,
    showComments: true,
    showEvaluation: false,
    showNags: true,
  },
};

// -- With Variations: Fischer vs Spassky with annotations ---

export const WithVariations: Story = {
  args: {
    game: ANNOTATED_GAME,
    showComments: true,
    showNags: true,
  },
};

// -- With Comments: Fischer vs Spassky showing all comments ---

export const WithComments: Story = {
  args: {
    game: ANNOTATED_GAME,
    showComments: true,
    showNags: false,
  },
};

// -- With Evaluation ---

export const WithEvaluation: Story = {
  args: {
    game: OPERA_GAME,
    showEvaluation: true,
  },
};

// -- With NAGs ---

export const WithNAGs: Story = {
  args: {
    game: ANNOTATED_GAME,
    showComments: false,
    showNags: true,
  },
};

// -- With Clock ---

export const WithClock: Story = {
  args: {
    game: OPERA_GAME,
    showClock: true,
  },
};

// -- All Features ---

export const AllFeatures: Story = {
  args: {
    game: ANNOTATED_GAME,
    showClock: true,
    showComments: true,
    showEvaluation: true,
    showNags: true,
  },
};

// -- Dark Theme (via CSS variables) ---

export const DarkTheme: Story = {
  args: {
    game: KASPAROV_IMMORTAL,
  },
  decorators: [
    (Story) => (
      <div
        style={
          {
            '--movesheet-active-move': '#3a5a8c',
            '--movesheet-background': '#1a1a2e',
            '--movesheet-comment': '#8899aa',
            '--movesheet-evaluation': '#6699cc',
            '--movesheet-move-number': '#556677',
            '--movesheet-move-text': '#e0e0e0',
            '--movesheet-nag': '#cc8844',
            '--movesheet-variation': '#7788aa',
            'height': 500,
            'width': 400,
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};

// -- Light Theme (via CSS variables) ---

export const LightTheme: Story = {
  args: {
    game: KASPAROV_IMMORTAL,
  },
  decorators: [
    (Story) => (
      <div
        style={
          {
            '--movesheet-active-move': '#fff3b0',
            '--movesheet-background': '#fafafa',
            '--movesheet-comment': '#666666',
            '--movesheet-evaluation': '#888888',
            '--movesheet-move-number': '#999999',
            '--movesheet-move-text': '#222222',
            '--movesheet-nag': '#cc6600',
            '--movesheet-variation': '#555555',
            'height': 500,
            'width': 400,
          } as React.CSSProperties
        }
      >
        <Story />
      </div>
    ),
  ],
};

// -- Keyboard Navigation (interactive) ---

function KeyboardNavigationComponent(
  properties: MoveSheetProperties,
): React.ReactNode {
  const [currentMoveId, setCurrentMoveId] = useState<string | undefined>('m1w');

  return (
    <div>
      <p style={{ color: '#666', fontSize: 12, marginBottom: 8 }}>
        Click the panel below, then use arrow keys: Right/Left = next/prev,
        Down/Up = enter/exit variation, Home/End = first/last move.
      </p>
      <p style={{ color: '#888', fontSize: 11, marginBottom: 12 }}>
        Current move: <code>{currentMoveId ?? 'none'}</code>
      </p>
      <MoveSheet
        {...properties}
        currentMoveId={currentMoveId}
        onSelectMove={setCurrentMoveId}
      />
    </div>
  );
}

export const KeyboardNavigation: Story = {
  args: {
    game: ANNOTATED_GAME,
    keyboard: true,
    showComments: true,
    showNags: true,
  },
  render: (arguments_) => <KeyboardNavigationComponent {...arguments_} />,
};

// -- Empty ---

export const Empty: Story = {
  args: {
    game: EMPTY_GAME,
  },
};
