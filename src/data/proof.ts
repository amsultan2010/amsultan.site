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
    note: 'average points raised for tutoring students on the ib 7-point scale.',
  },
  {
    value: '3',
    label: 'quant apps shipped',
    note: 'backtester, portfolio, and options pricer. flask/plotly on vercel.',
  },
  {
    value: '12-15',
    label: 'incubator cohort',
    note: 'x-combinator: ais-r’s first student-run startup incubator.',
  },
  {
    value: '5-0',
    label: 'debate record',
    note: '1st at horace mann juniors public forum. undefeated.',
  },
];

export const LEADERSHIP: LeadershipItem[] = [
  {
    title: 'x-combinator',
    org: 'ais-r · founder',
    period: '2026 - present',
    body: 'first student-run startup incubator at ais-r. cohorts pitch, build, and launch real software each semester, ending in a school-wide demo day.',
  },
  {
    title: 'aspiring doctors’ club',
    org: 'ais-r · leader',
    period: '2025 - present',
    body: 'partnered with king faisal university for diabetes awareness month (60+ students). added a tech-in-medicine track covering alphafold and tribev2.',
  },
  {
    title: 'prime',
    org: 'pingry · founder & president',
    period: 'engineering club',
    body: 'research and innovation in modern engineering. speaker sessions with njit and rutgers professors on paths into the field.',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: 'code',
    items: ['python', 'pandas', 'numpy', 'matplotlib', 'java', 'flask', 'plotly'],
  },
  {
    label: 'ship',
    items: ['vercel', 'supabase', 'cursor', 'claude code', 'codex', 'agent workflows'],
  },
  {
    label: 'speak',
    items: ['english', 'urdu / hindi', 'spanish'],
  },
  {
    label: 'chase',
    items: ['ai + robotics', 'education products', 'quant systems', 'f1', '3d printing'],
  },
];
