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
    label: 'IB grade lift',
    note: 'Average points raised for tutoring students on the IB 7-point scale.',
  },
  {
    value: '3',
    label: 'quant apps shipped',
    note: 'Backtester, portfolio, and options pricer. Flask/Plotly on Vercel.',
  },
  {
    value: '12-15',
    label: 'incubator cohort',
    note: 'X-Combinator: AIS-R’s first student-run startup incubator.',
  },
  {
    value: '5-0',
    label: 'debate record',
    note: '1st at Horace Mann Juniors Public Forum. Undefeated.',
  },
];

export const LEADERSHIP: LeadershipItem[] = [
  {
    title: 'X-Combinator',
    org: 'AIS-R · Founder',
    period: '2026 - present',
    body: 'First student-run startup incubator at AIS-R. Cohorts pitch, build, and launch real software each semester, ending in a school-wide Demo Day.',
  },
  {
    title: 'Aspiring Doctors’ Club',
    org: 'AIS-R · Leader',
    period: '2025 - present',
    body: 'Partnered with King Faisal University for Diabetes Awareness Month (60+ students). Added a tech-in-medicine track covering AlphaFold and TRIBEv2.',
  },
  {
    title: 'PRIME',
    org: 'Pingry · Founder & President',
    period: 'engineering club',
    body: 'Research and Innovation in Modern Engineering. Speaker sessions with NJIT and Rutgers professors on paths into the field.',
  },
];

export const SKILL_GROUPS: SkillGroup[] = [
  {
    label: 'code',
    items: ['Python', 'pandas', 'NumPy', 'matplotlib', 'Java', 'Flask', 'Plotly'],
  },
  {
    label: 'ship',
    items: ['Vercel', 'Supabase', 'Cursor', 'Claude Code', 'Codex', 'agent workflows'],
  },
  {
    label: 'speak',
    items: ['English', 'Urdu / Hindi', 'Spanish'],
  },
  {
    label: 'chase',
    items: ['AI + robotics', 'education products', 'quant systems', 'F1', '3D printing'],
  },
];
