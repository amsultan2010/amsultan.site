export type ProofStat = {
  value: string;
  label: string;
  note: string;
};

export type LeadershipItem = {
  title: string;
  org: string;
  period: string;
  body: string;
};

export type SkillGroup = {
  label: string;
  items: string[];
};

export const PROOF_STATS: ProofStat[] = [
  {
    value: '2.03',
    label: 'ib grade lift',
    note: 'avg points raised for tutoring students.',
  },
  {
    value: '3',
    label: 'quant apps',
    note: 'backtester, portfolio, options on vercel.',
  },
  {
    value: '12-15',
    label: 'incubator cohort',
    note: 'x-combinator at ais-r.',
  },
  {
    value: '5-0',
    label: 'debate record',
    note: '1st at horace mann juniors.',
  },
];

export const LEADERSHIP: LeadershipItem[] = [
  {
    title: 'x-combinator',
    org: 'ais-r · founder',
    period: '2026 - present',
    body: 'first student-run startup incubator at ais-r. cohorts pitch, build, and launch each semester.',
  },
  {
    title: 'aspiring doctors’ club',
    org: 'ais-r · leader',
    period: '2025 - present',
    body: 'diabetes awareness month with king faisal university (60+ students). tech-in-medicine track.',
  },
  {
    title: 'prime',
    org: 'pingry · founder',
    period: 'engineering club',
    body: 'speaker sessions with njit and rutgers professors on paths into engineering.',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: 'code',
    items: ['python', 'pandas', 'numpy', 'matplotlib', 'java', 'flask', 'plotly'],
  },
  {
    label: 'ship',
    items: ['vercel', 'supabase', 'cursor', 'claude code', 'codex'],
  },
  {
    label: 'speak',
    items: ['english', 'urdu / hindi', 'spanish'],
  },
  {
    label: 'chase',
    items: ['ai + robotics', 'education', 'quant', 'f1', '3d printing'],
  },
];
