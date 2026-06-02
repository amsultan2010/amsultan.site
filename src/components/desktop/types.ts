import type { DetailContent } from '../desktop-portfolio/DetailPanel';
import type { ContentViewData } from '../desktop-portfolio/ContentViewer';

export type WindowId =
  | 'terminal'
  | 'education'
  | 'experience'
  | 'projects'
  | 'blog'
  | 'email'
  | 'photos'
  | 'watchlist'
  | 'detail'
  | 'content';

export interface WindowState {
  id: WindowId;
  title: string;
  isOpen: boolean;
  isMinimized: boolean;
  isFullscreen: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  prevBounds?: { position: { x: number; y: number }; size: { width: number; height: number } };
}

export interface DesktopState {
  windows: Record<string, WindowState>;
  focusedWindowId: WindowId | null;
  nextZIndex: number;
  bootComplete: boolean;
  // Sub-window content
  activeDetail: DetailContent | null;
  activeContent: ContentViewData | null;
}

export type DesktopAction =
  | { type: 'OPEN_WINDOW'; id: WindowId; title?: string }
  | { type: 'CLOSE_WINDOW'; id: WindowId }
  | { type: 'MINIMIZE_WINDOW'; id: WindowId }
  | { type: 'RESTORE_WINDOW'; id: WindowId }
  | { type: 'FOCUS_WINDOW'; id: WindowId }
  | { type: 'MOVE_WINDOW'; id: WindowId; position: { x: number; y: number } }
  | { type: 'RESIZE_WINDOW'; id: WindowId; size: { width: number; height: number } }
  | { type: 'TOGGLE_FULLSCREEN'; id: WindowId }
  | { type: 'SET_BOOT_COMPLETE' }
  | { type: 'OPEN_DETAIL'; detail: DetailContent }
  | { type: 'CLOSE_DETAIL' }
  | { type: 'OPEN_CONTENT'; content: ContentViewData }
  | { type: 'CLOSE_CONTENT' }
  | { type: 'DESELECT_ALL' }
  | { type: 'LOCK_SCREEN' }
;

// Default window configs
export const WINDOW_DEFAULTS: Record<WindowId, { title: string; width: number; height: number; x: number; y: number }> = {
  terminal:        { title: 'github.com/amsultan2010 — zsh',       width: 520, height: 600, x: 120,  y: 50 },
  education:       { title: 'education — Finder',           width: 880, height: 780, x: 120, y: 50 },
  experience:      { title: 'experience — Finder',          width: 960, height: 820, x: 160, y: 40 },
  projects:        { title: 'projects — Visual Studio Code', width: 960, height: 680, x: 80, y: 35 },
  blog:            { title: 'abdullahOS',                   width: 900, height: 620, x: 110, y: 60 },
  email:           { title: 'new message',                   width: 640, height: 520, x: 180, y: 80 },
  photos:          { title: 'photos',                        width: 900, height: 640, x: 100, y: 50 },
  watchlist:       { title: 'watchlist — Netflix',          width: 1040, height: 680, x: 90, y: 40 },
  detail:          { title: 'detail',                       width: 650, height: 600, x: 200, y: 80 },
  content:         { title: 'reader',                       width: 900, height: 700, x: 150, y: 40 },
};
