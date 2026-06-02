import type { ContentViewData } from './ContentViewer';

export const contentMap: Record<string, ContentViewData> = {
  'abdullahos-overview': {
    type: 'blog',
    slug: 'abdullahos-overview',
    title: 'abdullahOS overview',
    publishedAt: '2026-01-01',
    tags: ['astro', 'react'],
    readingTime: 2,
    summary: 'desktop-style portfolio w/ draggable windows, app interactions, photos, projects, and static links.',
    markdown: `abdullahOS is the desktop-style shell for this portfolio.

it keeps the macos-inspired interface, draggable windows, dock apps, local photos, projects, contact, and terminal-style details in one static site.`
  },

  'abdullahos-parts': {
    type: 'blog',
    slug: 'abdullahos-parts',
    title: 'app map',
    publishedAt: '2026-01-02',
    tags: ['desktop', 'apps'],
    readingTime: 2,
    summary: 'about, projects, photos, contact, github, youtube music, terminal, and abdullahOS.',
    markdown: `the app set is intentionally simple: about, projects, photos, contact, github, youtube music, terminal, and abdullahOS.

everything is static for now so the portfolio stays easy to customize.`
  },
};
