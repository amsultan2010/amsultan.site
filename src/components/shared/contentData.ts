import type { ContentViewData } from '../portfolio/ContentViewer';

/** Active writing — no stub “coming soon” papers. */
export const contentMap: Record<string, ContentViewData> = {
  'lab-notes': {
    type: 'blog',
    slug: 'lab-notes',
    title: 'the lab replaces abdullahOS',
    publishedAt: '2026-07-08',
    tags: ['lab', 'portfolio'],
    readingTime: 2,
    summary: 'Why the macOS clone retired and what the lab keeps.',
    markdown: `the desktop shell was fun to build, but it read like every other macos portfolio.

the lab keeps the personal DNA — ascii brand, chronograph, a real tiny terminal — without the glass dock and traffic lights.

homepage stays sharp for founders and recruiters. the lab is where the toys live.`,
  },
  'building-in-riyadh': {
    type: 'blog',
    slug: 'building-in-riyadh',
    title: 'building in riyadh',
    publishedAt: '2026-06-01',
    tags: ['notes', 'builder'],
    readingTime: 2,
    summary: 'Student builder notes from Riyadh — tutoring, F1 media, agent tools.',
    markdown: `i ship from riyadh: tutoringbyabdullah, the downforce blog, and a small quant suite as technical proof.

if you want to talk products, education, or agent workflows — email me.`,
  },
};
