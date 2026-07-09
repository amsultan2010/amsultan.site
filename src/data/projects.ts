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
    desc: 'education service focused on understanding, not memorizing.',
    detail:
      'hybrid tutoring at ais-r for 9th-10th graders across math and science. teaching uses spaced repetition so students keep gains without the tutor in the room.',
    metrics: ['+2.03 avg ib grade points', 'spaced-repetition method', 'live site'],
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
    desc: 'automated f1 sports blog. race analysis, actual opinions.',
    detail:
      'weekly race notes, standings, and strategy takes. no corporate hedging. built as a shipping habit: publish on a cadence and keep a voice.',
    metrics: ['weekly cadence', 'opinion-led analysis', 'live site'],
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
    desc: 'single-stock sma crossover backtester with parameter heatmaps.',
    detail:
      'part of a three-app quantpy suite. simulates strategies on historical data and shows fragile parameter regions visually.',
    metrics: ['sharpe · max dd · returns', 'parameter heatmaps', 'flask → vercel'],
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
    detail:
      'benchmarks allocations across holdings, weighs by inverse volatility, and makes portfolio behavior readable.',
    metrics: ['inverse-vol weighting', 'multi-asset', 'allocation views'],
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
    detail:
      'fair value, delta/gamma/theta/vega, and exotic derivative prices via geometric brownian motion.',
    metrics: ['greeks', 'monte carlo / gbm', 'exotics'],
    cover: '/images/projects/quantoptionspy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['python', 'options', 'monte carlo'],
  },
  {
    id: 'lab',
    title: 'the lab',
    role: 'playground',
    period: '2026',
    desc: 'interactive playground. ascii instrument, chronograph, terminal easter egg.',
    detail:
      'where experiments live. ascii desk, chronograph, and a tiny terminal.',
    metrics: ['ascii desk', 'chronograph', 'terminal egg'],
    cover: '/readme/portfolio-desktop.jpg',
    href: '/lab',
    demo: '/lab',
    demoNewTab: false,
    tech: ['astro', 'react', 'three.js'],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
