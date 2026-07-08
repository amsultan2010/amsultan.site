export type Project = {
  id: string;
  title: string;
  desc: string;
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
    desc: 'Education service focused on understanding, not memorizing.',
    cover: '/images/projects/tutoringpreview.png',
    href: 'https://tutoringbyabdullah.xyz',
    demo: 'https://tutoringbyabdullah.xyz',
    demoNewTab: true,
    tech: ['Education', 'Product', 'Website'],
    featured: true,
  },
  {
    id: 'downforce',
    title: 'the downforce blog',
    desc: 'Automated F1 sports blog — race analysis with actual opinions.',
    cover: '/images/projects/downforceblog.png',
    href: 'https://thedownforceblog.vercel.app',
    demo: 'https://thedownforceblog.vercel.app',
    demoNewTab: true,
    tech: ['Automation', 'F1', 'Blog'],
    featured: true,
  },
  {
    id: 'quantbacktester',
    title: 'quantbacktesterpy',
    desc: 'Single-stock SMA crossover backtester with parameter heatmaps.',
    cover: '/images/projects/quantbacktesterpy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['Python', 'Pandas', 'Backtesting'],
    featured: true,
  },
  {
    id: 'quantportfolio',
    title: 'quantportfoliopy',
    desc: 'Multi-asset risk parity portfolio backtester.',
    cover: '/images/projects/quantportfoliopy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['Python', 'Finance', 'Research'],
  },
  {
    id: 'quantoptions',
    title: 'quantoptionspy',
    desc: 'Black-Scholes + Monte Carlo options pricer with Greeks.',
    cover: '/images/projects/quantoptionspy.png',
    href: 'https://github.com/amsultan2010',
    tech: ['Python', 'Options', 'Monte Carlo'],
  },
  {
    id: 'lab',
    title: 'the lab',
    desc: 'Interactive playground — ASCII instrument, chronograph, terminal easter egg.',
    cover: '/readme/portfolio-desktop.jpg',
    href: '/lab',
    demo: '/lab',
    demoNewTab: false,
    tech: ['Astro', 'React', 'Three.js'],
  },
];

export const FEATURED_PROJECTS = PROJECTS.filter((p) => p.featured);
