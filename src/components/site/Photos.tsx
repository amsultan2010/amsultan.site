import type { CSSProperties } from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { photos } from '@/data/photos';

function loadAscii() {
  const asciiPath = path.join(process.cwd(), 'public/images/myascii.txt');
  if (fs.existsSync(asciiPath)) {
    return fs.readFileSync(asciiPath, 'utf8').trimEnd();
  }
  return 'abdullah';
}

export function Photos() {
  const ascii = loadAscii();

  return (
    <section id="margin" className="s-margin" aria-label="photos">
      <div className="s-margin__layout">
        <article className="s-margin__ascii js-margin-card">
          <p className="vf-mono s-margin__label">ascii</p>
          <div className="s-margin__ascii-frame">
            <pre className="s-margin__pre">{ascii}</pre>
          </div>
        </article>

        <div className="s-margin__grid">
          {photos.map((photo, i) => (
            <article
              className={`s-margin__card js-margin-card ${i % 7 === 0 ? 's-margin__card--wide' : ''} ${i % 11 === 3 ? 's-margin__card--tall' : ''}`}
              style={
                {
                  '--rot': `${(i % 2 === 0 ? -1 : 1) * (1.2 + (i % 3) * 0.7)}deg`,
                } as CSSProperties
              }
              key={photo.id}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.src} alt={photo.alt} loading="lazy" decoding="async" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
