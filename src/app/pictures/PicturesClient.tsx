'use client';

import { useEffect, useState } from 'react';
import { photos as photoData } from '@/data/photos';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

type Photo = (typeof photoData)[number];

export default function PicturesClient({ photos }: { photos: Photo[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

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
          <a href="/#margin">photos</a>
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

      <main className="archive" style={{ paddingBottom: '4rem' }}>
        <header className="archive__head">
          <div className="archive__head-copy">
            <p className="vf-band">gallery</p>
            <h1 className="archive__title vf-display">pictures</h1>
            <p className="archive__lede vf-serif">moments from life, work, and travel.</p>
          </div>
          <a href="/#margin" className="archive__back vf-mono">
            ← back
          </a>
        </header>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '0.85rem',
            padding: '0 var(--vf-pad) 3rem',
            maxWidth: 'calc(var(--vf-max) + 2 * var(--vf-pad))',
            margin: '0 auto',
          }}
        >
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => {
                setCurrentIndex(index);
                setLightboxOpen(true);
              }}
              style={{
                border: '1px solid var(--vf-line)',
                padding: '0.35rem',
                background: 'color-mix(in srgb, var(--vf-ink) 4%, transparent)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', display: 'block' }}
              />
            </button>
          ))}
        </div>
      </main>

      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={currentIndex}
        slides={photos.map((p) => ({ src: p.src, alt: p.alt }))}
      />
    </div>
  );
}
