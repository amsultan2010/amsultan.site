export type Project = {
  id: string;
  title: string;
  role: string;
  period: string;
  desc: string;
  detail: string;
  metrics?: string[];
  cover: string;
  href: string;
  demo?: string;
  demoNewTab?: boolean;
  tech: string[];
  featured?: boolean;
};

/** Single source of truth for homepage stages + /projects archive. */
export const PROJECTS: Project[] = [
  {
    id: 'tutoring',
    title: 'tutoringbyabdullah',
    role: 'founder',
    period: '2026 - present',
    desc: 'tutoring focused on understanding, not memorizing.',
    detail: 'hybrid tutoring at ais-r for 9th-10th graders in math and science. spaced repetition.',
    metrics: ['spaced repetition', 'live site'],
    cover: '/images/projects/tutoringpreview.png',
    href: 'https://tutoringbyabdullah.xyz',
    demo: 'https://tutoringbyabdullah.xyz',
    demoNewTab: true,
    tech: ['education', 'product', 'spaced repetition'],
    featured: true,
  },
  {
    id: 'downforce',
    title: 'the downforce blog',
    role: 'founder & writer',
    period: '2025 - present',
    desc: 'f1 blog with race analysis and opinions.',
    detail: 'weekly race notes, standings, and strategy takes.',
    metrics: ['weekly posts', 'live site'],
    cover: '/images/projects/downforceblog.png',
    href: 'https://thedownforceblog.vercel.app',
    demo: 'https://thedownforceblog.vercel.app',
    demoNewTab: true,
    tech: ['automation', 'f1', 'editorial'],
    featured: true,
  },
  {
    id: 'quantbacktester',
    title: 'quantbacktesterpy',
    role: 'builder',
    period: '2026',
    desc: 'sma crossover backtester with parameter heatmaps.',
    detail: 'part of the quantpy suite. simulates strategies on historical data.',
    metrics: ['heatmaps', 'flask → vercel'],
    cover: '/images/projects/quantbacktesterpy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['python', 'pandas', 'plotly'],
    featured: true,
  },
  {
    id: 'quantportfolio',
    title: 'quantportfoliopy',
    role: 'builder',
    period: '2026',
    desc: 'multi-asset risk parity portfolio backtester.',
    detail: 'inverse-volatility weighting across holdings.',
    metrics: ['inverse-vol', 'multi-asset'],
    cover: '/images/projects/quantportfoliopy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['python', 'finance', 'research'],
  },
  {
    id: 'quantoptions',
    title: 'quantoptionspy',
    role: 'builder',
    period: '2026',
    desc: 'black-scholes + monte carlo options pricer with greeks.',
    detail: 'fair value and greeks via geometric brownian motion.',
    metrics: ['greeks', 'monte carlo'],
    cover: '/images/projects/quantoptionspy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['python', 'options', 'monte carlo'],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
