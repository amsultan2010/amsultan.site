/**
 * Fresh mobile motion stack — no Lenis, no ScrollTrigger scrub/pin.
 * CSS transitions + IntersectionObserver + rAF ambient loops.
 * Only runs when html has .touch-ready (set in index.astro).
 */

const GLYPHS = 'abcdefghijklmnopqrstuvwxyz01##////<>';

function reduced() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function observe(
  el: Element,
  onIn: () => void,
  onOut?: () => void,
  rootMargin = '0px 0px -8% 0px',
) {
  if (!('IntersectionObserver' in window)) {
    onIn();
    return () => undefined;
  }
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) onIn();
        else onOut?.();
      });
    },
    { rootMargin, threshold: 0.08 },
  );
  io.observe(el);
  return () => io.disconnect();
}

function markIn(el: Element) {
  el.classList.add('is-in');
}

function markOut(el: Element) {
  el.classList.remove('is-in');
}

function staggerChildren(parent: Element, selector: string, step = 28) {
  parent.querySelectorAll(selector).forEach((child, i) => {
    (child as HTMLElement).style.transitionDelay = `${i * step}ms`;
  });
}

function splitWarp(el: HTMLElement) {
  if (el.dataset.mmSplit === '1') return;
  const text = (el.textContent ?? '').toLowerCase();
  el.textContent = '';
  el.setAttribute('aria-label', text);
  el.dataset.mmSplit = '1';
  text.split(/(\s+)/).forEach((token) => {
    if (!token) return;
    if (/^\s+$/.test(token)) {
      el.appendChild(document.createTextNode(token.replace(/ /g, '\u00a0')));
      return;
    }
    const word = document.createElement('span');
    word.className = 'vf-warp-word';
    [...token].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 'vf-warp-char';
      span.textContent = ch;
      word.appendChild(span);
    });
    el.appendChild(word);
  });
}

function splitHero(el: HTMLElement) {
  if (el.dataset.mmSplit === '1') return [] as HTMLElement[];
  const text = (el.textContent ?? '').toLowerCase();
  el.textContent = '';
  el.setAttribute('aria-label', text);
  el.dataset.mmSplit = '1';
  const spans: HTMLElement[] = [];
  [...text].forEach((ch) => {
    const span = document.createElement('span');
    span.className = 's-hero__char js-magnet-char';
    const inner = document.createElement('span');
    inner.className = 's-hero__char-inner';
    const letter = ch === ' ' ? '\u00a0' : ch;
    inner.dataset.letter = letter;
    inner.textContent = letter;
    span.appendChild(inner);
    el.appendChild(span);
    spans.push(span);
  });
  return spans;
}

function scrambleOnce(el: HTMLElement, original: string) {
  let frame = 0;
  const max = 14;
  const timer = window.setInterval(() => {
    el.textContent = [...original]
      .map((ch, i) => {
        if (ch === ' ') return ' ';
        if (frame / max > i / original.length) return original[i];
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      })
      .join('');
    frame += 1;
    if (frame > max) {
      window.clearInterval(timer);
      el.textContent = original;
    }
  }, 20);
}

function initProgress() {
  const bar = document.querySelector<HTMLElement>('.js-progress');
  if (!bar || reduced()) return;
  const sync = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${p})`;
  };
  sync();
  window.addEventListener('scroll', sync, { passive: true });
}

function initHero() {
  const hero = document.querySelector<HTMLElement>('.s-hero');
  if (!hero) return;

  const allChars: HTMLElement[] = [];
  hero.querySelectorAll<HTMLElement>('.js-hero-line').forEach((line) => {
    allChars.push(...splitHero(line));
  });
  allChars.forEach((char, i) => {
    char.style.transitionDelay = `${80 + i * 28}ms`;
  });

  markIn(hero);

  if (reduced()) return;

  const dirs = ['to-top', 'to-right', 'to-bottom', 'to-left'] as const;
  const flip = () => {
    if (!allChars.length || Math.random() > 0.6) return;
    const start = Math.floor(Math.random() * allChars.length);
    const count = 2 + Math.floor(Math.random() * 4);
    for (let n = 0; n < count; n += 1) {
      const char = allChars[(start + n) % allChars.length];
      if (dirs.some((d) => char.classList.contains(d))) continue;
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      char.classList.add(dir);
      window.setTimeout(() => char.classList.remove(dir), 900);
    }
  };
  flip();
  window.setInterval(flip, 75);

  // Soft ambient magnet wave
  let t = 0;
  let raf = 0;
  const title = hero.querySelector<HTMLElement>('.js-hero-title');
  const loop = () => {
    raf = requestAnimationFrame(loop);
    t += 0.016;
    if (title) {
      title.style.transform = `rotateX(${(Math.sin(t * 0.55) * 6).toFixed(2)}deg) rotateY(${(Math.cos(t * 0.4) * 5).toFixed(2)}deg)`;
    }
    allChars.forEach((char, i) => {
      const x = Math.sin(t * 1.3 + i * 0.35) * 8;
      const y = Math.cos(t * 1.05 + i * 0.28) * 6;
      char.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    });
  };
  loop();
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') cancelAnimationFrame(raf);
    else loop();
  });
}

function initStretch() {
  document.querySelectorAll<HTMLElement>('.js-stretch').forEach((section) => {
    observe(section, () => markIn(section), () => {
      if (!reduced()) markOut(section);
    });
  });
}

function initWarps() {
  const targets = document.querySelectorAll<HTMLElement>(
    '.js-warp, .js-reveal-lines, .js-about-copy .s-about__body, .s-about__cred-school, .s-proof__lead-title',
  );
  targets.forEach((el) => {
    splitWarp(el);
    el.classList.add('mm-warp');
    staggerChildren(el, '.vf-warp-char', 18);
    observe(el, () => markIn(el));
  });
}

function initSeparators() {
  document.querySelectorAll<HTMLElement>('.js-sep').forEach((sep) => {
    sep.classList.add('mm-enter');
    let active = false;
    observe(
      sep,
      () => {
        markIn(sep);
        active = true;
      },
      () => {
        active = false;
      },
      '12% 0px',
    );

    if (reduced()) return;
    const chars = sep.querySelectorAll<HTMLElement>('.js-sep-char');
    window.setInterval(() => {
      if (!active) return;
      chars.forEach((char) => {
        if (Math.random() > 0.32) return;
        char.classList.add('is-flip');
        window.setTimeout(() => char.classList.remove('is-flip'), 300);
      });
    }, 85);
  });
}

function initWork() {
  const section = document.querySelector<HTMLElement>('.js-work');
  const track = document.querySelector<HTMLElement>('.js-work-track');
  if (!section || !track) return;

  section.classList.add('is-touch-work');

  section.querySelectorAll<HTMLElement>('.s-work__item').forEach((item, i) => {
    item.style.transitionDelay = `${i * 70}ms`;
    observe(
      item,
      () => {
        markIn(item);
        item.classList.add('is-hot');
        const drift = () => {
          if (!item.classList.contains('is-hot')) return;
          const t = (Date.now() / 1000 + i) % 1;
          item.style.setProperty('--mx', `${20 + t * 60}%`);
          item.style.setProperty('--my', `${30 + (1 - t) * 40}%`);
          requestAnimationFrame(drift);
        };
        requestAnimationFrame(drift);
      },
      () => {
        item.classList.remove('is-hot');
      },
      '0px 0px -12% 0px',
    );
  });
}

function initMargin() {
  document.querySelectorAll<HTMLElement>('.js-margin-card').forEach((card, i) => {
    card.style.transitionDelay = `${(i % 6) * 55}ms`;
    observe(card, () => markIn(card));
  });
}

function initContact() {
  const section = document.querySelector<HTMLElement>('.s-contact');
  const hover = document.querySelector<HTMLElement>('.js-contact-hover');
  if (!section || !hover) return;

  const enter = () => {
    hover.classList.add('is-active');
    const chars = hover.querySelectorAll<HTMLElement>('.s-contact__cta-char');
    chars.forEach((ch, i) => {
      ch.style.opacity = '0';
      ch.style.transform = 'translateY(110%)';
      window.setTimeout(() => {
        ch.style.transition = 'opacity 0.45s ease, transform 0.55s cubic-bezier(0.16, 1, 0.3, 1)';
        ch.style.opacity = '1';
        ch.style.transform = 'none';
      }, 80 + i * 35);
    });
  };

  observe(
    section,
    () => {
      markIn(section);
      markIn(hover);
      window.setTimeout(enter, 450);
    },
    undefined,
    '0px 0px -10% 0px',
  );

  hover.addEventListener('pointerdown', () => {
    if (hover.classList.contains('is-active')) hover.classList.remove('is-active');
    else enter();
  });

  ['.s-contact__title', '.s-contact__email', '.s-contact__sub', '.s-contact__links'].forEach(
    (sel) => {
      const el = section.querySelector(sel);
      if (el) el.classList.add('mm-enter');
    },
  );
}

function initEnters() {
  const selectors = [
    '.js-about-copy > *:not(.s-about__body):not(.js-reveal-lines)',
    '.js-about-aside',
    '.js-about-cred',
    '.js-proof-lead',
    '.js-proof-skill',
    '.js-chapter',
    '.vf-band',
    '.js-rule',
  ];
  selectors.forEach((sel) => {
    document.querySelectorAll(sel).forEach((el, i) => {
      el.classList.add('mm-enter');
      if (i % 4 === 1) el.classList.add('mm-enter-delay-1');
      if (i % 4 === 2) el.classList.add('mm-enter-delay-2');
      if (i % 4 === 3) el.classList.add('mm-enter-delay-3');
      observe(el, () => markIn(el));
    });
  });
}

function initScramble() {
  if (reduced()) return;
  document.querySelectorAll<HTMLElement>('.js-scramble').forEach((el) => {
    const original = (el.textContent ?? '').trim();
    if (!original) return;
    observe(el, () => scrambleOnce(el, original));
  });
}

function initLivingLabels() {
  if (reduced()) return;
  const labels = document.querySelectorAll<HTMLElement>(
    '.s-proof__block-label, .s-about__aside-label, .s-about__edu-label, .s-margin__label, .s-work__count',
  );
  labels.forEach((el) => {
    const original = (el.textContent ?? '').trim();
    if (!original || original.length > 18) return;
    let active = false;
    observe(
      el,
      () => {
        active = true;
      },
      () => {
        active = false;
        el.textContent = original;
      },
    );
    window.setInterval(() => {
      if (!active || Math.random() > 0.4) return;
      scrambleOnce(el, original);
    }, 1100);
  });
}

function initNav() {
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"], a[href^="/#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href) return;
      const id = href.includes('#') ? `#${href.split('#')[1]}` : href;
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      if (href.startsWith('/#') && window.location.pathname !== '/') return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  const links = document.querySelectorAll<HTMLAnchorElement>('.js-nav-link');
  const sections = ['about', 'work', 'proof', 'contact']
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);
  const setActive = (id: string) => {
    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.section === id);
    });
  };
  sections.forEach((section) => {
    observe(
      section,
      () => setActive(section.id),
      undefined,
      '-40% 0px -40% 0px',
    );
  });
}

function initClock() {
  const el = document.querySelector<HTMLElement>('.js-clock');
  if (!el) return;
  const tick = () => {
    el.textContent = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Riyadh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  };
  tick();
  window.setInterval(tick, 30_000);
}

function initContrast() {
  const btn = document.querySelector<HTMLElement>('.js-contrast');
  if (!btn) return;
  const root = document.documentElement;
  btn.addEventListener('click', () => {
    const next = !root.classList.contains('theme-contrasted');
    root.classList.toggle('theme-contrasted', next);
    localStorage.setItem('vf-theme', next ? 'contrasted' : 'default');
  });
  if (localStorage.getItem('vf-theme') === 'contrasted') {
    root.classList.add('theme-contrasted');
  }
}

function initNoise() {
  const noise = document.querySelector<HTMLElement>('.js-noise');
  if (!noise || reduced()) return;
  let up = true;
  window.setInterval(() => {
    noise.style.opacity = up ? '0.09' : '0.04';
    up = !up;
  }, 2400);
}

export function bootMobile() {
  document.documentElement.classList.add('touch-ready');
  document.documentElement.classList.remove('is-scroll-blocked', 'lenis', 'lenis-smooth');
  document.querySelector('.js-intro')?.remove();

  const wrapper = document.querySelector<HTMLElement>('.js-site-wrapper');
  if (wrapper) {
    wrapper.style.opacity = '1';
    wrapper.style.visibility = 'visible';
  }

  initContrast();
  initNav();
  initClock();
  initProgress();
  initNoise();
  initHero();
  initStretch();
  initWarps();
  initSeparators();
  initWork();
  initMargin();
  initContact();
  initEnters();
  initScramble();
  initLivingLabels();
}
