export type EducationEntry = {
  school: string;
  years: string;
  location: string;
  logo: string;
  focus: string;
  highlights: string[];
};

export const EDUCATION: EducationEntry[] = [
  {
    school: 'american international school in riyadh',
    years: '2025-present',
    location: 'riyadh, saudi arabia',
    logo: '/images/logosicons/aisr.png',
    focus: 'analysis & approaches sl · ap compsci a · ap psych · ap precalc',
    highlights: [
      'aspiring doctors club lead, tech-in-medicine track',
      'founded x-combinator student incubator',
      '#2 varsity tennis seed · jv badminton',
    ],
  },
  {
    school: 'the pingry school',
    years: '2021-2025',
    location: 'basking ridge, nj',
    logo: '/images/logosicons/pingry.png',
    focus: 'gpa 3.86-w · ap compsci principles 5/5 (self-study)',
    highlights: [
      'public forum debate, 1st at horace mann juniors (5-0)',
      'boys’ swim, 1st exhibition 50m free at lawrenceville state champs',
      'prime engineering club · muslim affinity leadership',
    ],
  },
];
