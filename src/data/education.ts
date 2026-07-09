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
    school: 'American International School in Riyadh',
    years: '2025-present',
    location: 'Riyadh, Saudi Arabia',
    logo: '/images/logosicons/aisr.png',
    focus: 'Analysis & Approaches SL · AP CompSci A · AP Psych · AP Precalc',
    highlights: [
      'Aspiring Doctors Club lead, tech-in-medicine track',
      'Founded X-Combinator student incubator',
      '#2 varsity tennis seed · JV badminton',
    ],
  },
  {
    school: 'The Pingry School',
    years: '2021-2025',
    location: 'Basking Ridge, NJ',
    logo: '/images/logosicons/pingry.png',
    focus: 'GPA 3.86-W · AP CompSci Principles 5/5 (self-study)',
    highlights: [
      'Public Forum Debate, 1st at Horace Mann Juniors (5-0)',
      'Boys’ swim, 1st exhibition 50m free at Lawrenceville State Champs',
      'PRIME engineering club · Muslim Affinity leadership',
    ],
  },
];
