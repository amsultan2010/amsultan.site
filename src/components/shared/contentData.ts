import type { ContentViewData } from '../portfolio/ContentViewer';

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
  'investor-behavior-gap': {
    type: 'blog',
    slug: 'investor-behavior-gap',
    title: 'Why Investors Underperform the Markets They Invest In',
    publishedAt: '2026-03-01',
    tags: ['Finance', 'Behavioral Economics', 'Markets', 'Research'],
    readingTime: 14,
    summary: 'Financial markets produce strong long-term returns, yet the average investor consistently earns far less.',
    markdown: `Financial markets produce strong long-term returns, yet the average investor consistently earns far less.

Full paper coming soon. This entry summarizes the research direction and key questions explored in the write-up.`,
  },

  'discipline-paradox': {
    type: 'blog',
    slug: 'discipline-paradox',
    title: 'The Discipline Paradox',
    publishedAt: '2026-03-01',
    tags: ['Psychology', 'Behavioral Economics', 'Research'],
    readingTime: 16,
    summary: 'Why talented people fail while disciplined people win — consistency beats raw ability.',
    markdown: `Why talented people fail while disciplined people win — consistency beats raw ability.

Full paper coming soon. This entry summarizes the research direction and key questions explored in the write-up.`,
  },

  'enterprise-software-cost': {
    type: 'blog',
    slug: 'enterprise-software-cost',
    title: 'Why Enterprise Software Costs Millions',
    publishedAt: '2026-03-01',
    tags: ['Technology', 'Business', 'Enterprise', 'Research'],
    readingTime: 12,
    summary: 'Understanding why companies pay enormous sums for tools that often look like spreadsheets.',
    markdown: `Understanding why companies pay enormous sums for tools that often look like spreadsheets.

Full paper coming soon. This entry summarizes the research direction and key questions explored in the write-up.`,
  },

  'attention-economy': {
    type: 'blog',
    slug: 'attention-economy',
    title: 'The Attention Economy Is Rewiring Human Motivation',
    publishedAt: '2026-03-01',
    tags: ['Psychology', 'Technology', 'Economics', 'Research'],
    readingTime: 13,
    summary: 'Why focus may become the most valuable skill in the modern economy.',
    markdown: `Why focus may become the most valuable skill in the modern economy.

Full paper coming soon. This entry summarizes the research direction and key questions explored in the write-up.`,
  },

};
