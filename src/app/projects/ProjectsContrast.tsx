'use client';

import { useEffect } from 'react';

export function ProjectsContrast() {
  useEffect(() => {
    document.documentElement.classList.remove('is-scroll-blocked');
    if (localStorage.getItem('vf-theme') === 'contrasted') {
      document.documentElement.classList.add('theme-contrasted');
    }

    const btn = document.querySelector('.js-contrast');
    const mask = document.querySelector('.js-contrast-mask') as HTMLElement | null;

    const onClick = () => {
      const root = document.documentElement;
      const next = !root.classList.contains('theme-contrasted');
      if (mask) {
        mask.style.transform = 'translate3d(0,0,0)';
        requestAnimationFrame(() => {
          root.classList.toggle('theme-contrasted', next);
          localStorage.setItem('vf-theme', next ? 'contrasted' : 'default');
          setTimeout(() => {
            mask.style.transform = 'translate3d(100%,0,0)';
            setTimeout(() => {
              mask.style.transform = 'translate3d(-100%,0,0)';
            }, 280);
          }, 40);
        });
      } else {
        root.classList.toggle('theme-contrasted', next);
        localStorage.setItem('vf-theme', next ? 'contrasted' : 'default');
      }
    };

    btn?.addEventListener('click', onClick);
    return () => btn?.removeEventListener('click', onClick);
  }, []);

  return null;
}
