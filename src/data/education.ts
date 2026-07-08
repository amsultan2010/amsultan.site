export type EducationEntry = {
  school: string;
  years: string;
  location: string;
  logo: string;
  highlights: string[];
};

export const EDUCATION: EducationEntry[] = [
  {
    school: 'American International School in Riyadh',
    years: '2025–present',
    location: 'Riyadh, Saudi Arabia',
    logo: '/images/logosicons/aisr.png',
    highlights: [
      'AP Precalc, AP Psych, AP CompSci A',
      'Aspiring Doctors Club lead',
      '#2 varsity tennis seed',
    ],
  },
  {
    school: 'The Pingry School',
    years: '2021–2025',
    location: 'Basking Ridge, NJ',
    logo: '/images/logosicons/pingry.png',
    highlights: [
      'AP CompSci Principles 5/5',
      'Public Forum Debate — 1st at Horace Mann Juniors',
      'Engineering + Muslim Affinity leadership',
    ],
  },
];
