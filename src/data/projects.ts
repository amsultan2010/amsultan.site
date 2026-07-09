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
    role: 'Founder',
    period: '2026 - present',
    desc: 'Hybrid tutoring at AIS-R. Focus on understanding, not memorizing steps.',
    detail:
      'Flexible pricing for 9th-10th graders across Math I-III and Integrated Science. Teaching uses spaced repetition so students keep gains without the tutor in the room.',
    metrics: ['+2.03 avg IB grade points', 'spaced-repetition method', 'live site'],
    cover: '/images/projects/tutoringpreview.png',
    href: 'https://tutoringbyabdullah.xyz',
    demo: 'https://tutoringbyabdullah.xyz',
    demoNewTab: true,
    tech: ['Education', 'Product', 'Spaced repetition'],
    featured: true,
  },
  {
    id: 'downforce',
    title: 'the downforce blog',
    role: 'Founder & writer',
    period: '2025 - present',
    desc: 'F1 blog with race analysis and actual opinions.',
    detail:
      'Weekly race notes, standings context, and strategy takes. Built as a shipping habit: publish on a cadence, keep a voice, automate the boring parts of production.',
    metrics: ['weekly cadence', 'opinion-led analysis', 'live site'],
    cover: '/images/projects/downforceblog.png',
    href: 'https://thedownforceblog.vercel.app',
    demo: 'https://thedownforceblog.vercel.app',
    demoNewTab: true,
    tech: ['Automation', 'F1', 'Editorial'],
    featured: true,
  },
  {
    id: 'quantbacktester',
    title: 'quantbacktesterpy',
    role: 'Builder',
    period: '2026',
    desc: 'SMA-crossover backtester with Sharpe, drawdown, and parameter heatmaps.',
    detail:
      'Part of a three-app QuantPy suite shipped as Flask/Plotly apps on Vercel. Simulates strategies on historical data and surfaces fragile parameter regions visually.',
    metrics: ['Sharpe · max DD · returns', 'parameter heatmaps', 'Flask → Vercel'],
    cover: '/images/projects/quantbacktesterpy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['Python', 'Pandas', 'Plotly'],
    featured: true,
  },
  {
    id: 'quantportfolio',
    title: 'quantportfoliopy',
    role: 'Builder',
    period: '2026',
    desc: 'Multi-asset portfolio backtester with inverse-volatility weighting.',
    detail:
      'Benchmarks allocations across holdings, weighs by inverse volatility, and makes portfolio behavior readable instead of one clean metric.',
    metrics: ['inverse-vol weighting', 'multi-asset', 'allocation views'],
    cover: '/images/projects/quantportfoliopy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['Python', 'Finance', 'Research'],
  },
  {
    id: 'quantoptions',
    title: 'quantoptionspy',
    role: 'Builder',
    period: '2026',
    desc: 'Black-Scholes + Monte Carlo options pricer with Greeks and exotic paths.',
    detail:
      'Fair value, delta/gamma/theta/vega, and exotic derivative prices via Geometric Brownian Motion. Built to keep pricing assumptions traceable.',
    metrics: ['Greeks', 'Monte Carlo / GBM', 'exotics'],
    cover: '/images/projects/quantoptionspy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['Python', 'Options', 'Monte Carlo'],
  },
  {
    id: 'lab',
    title: 'the lab',
    role: 'Playground',
    period: '2026',
    desc: 'Spare-parts room: ASCII instrument, chronograph, tiny terminal.',
    detail:
      'Where experiments live so the homepage can stay sharp for founders and recruiters. Personal DNA without the macOS cosplay.',
    metrics: ['ASCII desk', 'chronograph', 'terminal egg'],
    cover: '/readme/portfolio-desktop.jpg',
    href: '/lab',
    demo: '/lab',
    demoNewTab: false,
    tech: ['Astro', 'React', 'Three.js'],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
