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

export const LEADERSHIP: LeadershipItem[] = [
  {
    title: 'x-combinator',
    org: 'ais-r · founder',
    period: '2026 - present',
    body: 'student-run startup incubator at ais-r. cohorts pitch, build, and launch each semester.',
  },
  {
    title: 'aspiring doctors’ club',
    org: 'ais-r · leader',
    period: '2025 - present',
    body: 'diabetes awareness month with king faisal university. tech-in-medicine track.',
  },
  {
    title: 'prime',
    org: 'pingry · founder',
    period: 'engineering club',
    body: 'speaker sessions with njit and rutgers professors.',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: 'code',
    items: ['python', 'pandas', 'numpy', 'matplotlib', 'java', 'flask', 'plotly'],
  },
  {
    label: 'tools',
    items: ['vercel', 'supabase', 'cursor', 'claude code', 'codex'],
  },
  {
    label: 'languages',
    items: ['english', 'urdu / hindi', 'spanish'],
  },
  {
    label: 'interests',
    items: ['ai + robotics', 'education', 'quant', 'f1', '3d printing'],
  },
];
