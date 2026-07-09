'use client';

import { useEffect } from 'react';
import FitnessCharts from '@/components/FitnessCharts';

type Props = {
  runs: Parameters<typeof FitnessCharts>[0]['runs'];
  lifts: Parameters<typeof FitnessCharts>[0]['lifts'];
};

export default function FitnessClient({ runs, lifts }: Props) {
  useEffect(() => {
    document.documentElement.classList.remove('is-scroll-blocked');
  }, []);

  return (
    <div className="site-wrapper" style={{ opacity: 1, minHeight: '100vh' }}>
      <header className="site-head">
        <a href="/" className="site-head__brand vf-mono">
          abdullah sultan
        </a>
        <nav className="site-head__nav vf-mono" aria-label="primary">
          <a href="/#about">about</a>
          <a href="/#work">work</a>
          <a href="/#proof">proof</a>
          <a href="/#contact">contact</a>
        </nav>
        <a
          href="/"
          className="site-head__contrast vf-mono"
          style={{
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          home
        </a>
      </header>
      <main style={{ padding: '2rem var(--vf-pad) 4rem', maxWidth: 'calc(var(--vf-max) + 2 * var(--vf-pad))', margin: '0 auto' }}>
        <h1 className="vf-display" style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', margin: '0 0 0.5rem' }}>
          fitness
        </h1>
        <p className="vf-serif" style={{ marginBottom: '2rem', opacity: 0.85 }}>
          running and strength training progress.
        </p>
        <FitnessCharts runs={runs} lifts={lifts} />
      </main>
    </div>
  );
}
