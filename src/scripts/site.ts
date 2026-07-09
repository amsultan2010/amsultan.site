import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createVoltageTerrain, type VoltageTerrainHandle } from './VoltageTerrain';

gsap.registerPlugin(ScrollTrigger);

let terrain: VoltageTerrainHandle | null = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initLenis() {
  // Slow, heavy, smooth — less jitter than short duration + high wheel gain
  const lenis = new Lenis({
    duration: 1.85,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 0.72,
    touchMultiplier: 1.05,
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  // Keep lag smoothing off so Lenis + ScrollTrigger stay in lockstep
  gsap.ticker.lagSmoothing(0);

  (window as unknown as { lenis: Lenis }).lenis = lenis;
  return lenis;
}

function initTerrain() {
  const canvas = document.querySelector<HTMLCanvasElement>('.js-terrain-canvas');
  const fallback = document.querySelector<HTMLElement>('.site-terrain__fallback');
  if (!canvas) return;

  terrain = createVoltageTerrain({
    canvas,
    reducedMotion: prefersReducedMotion(),
  });

  if (!terrain) {
    canvas.remove();
    return;
  }

  fallback?.remove();

  if (document.documentElement.classList.contains('theme-contrasted')) {
    terrain.setContrasted(true);
  }

  ScrollTrigger.create({
    trigger: document.documentElement,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      terrain?.setScroll(self.progress);
    },
  });

  document.querySelectorAll<HTMLElement>('.js-rule').forEach((rule) => {
    ScrollTrigger.create({
      trigger: rule,
      start: 'top 70%',
      once: true,
      onEnter: () => terrain?.pulse(),
    });
  });
}

function runIntro(onDone: () => void) {
  const intro = document.querySelector<HTMLElement>('.js-intro');
  const wrapper = document.querySelector<HTMLElement>('.js-site-wrapper');
  if (!intro || !wrapper) {
    onDone();
    return;
  }

  if (prefersReducedMotion() || sessionStorage.getItem('vf-intro-seen') === '1') {
    intro.remove();
    wrapper.style.opacity = '1';
    document.documentElement.classList.remove('is-scroll-blocked');
    onDone();
    return;
  }

  const panel = intro.querySelector<HTMLElement>('.js-intro-panel');
  const mark = intro.querySelector<HTMLElement>('.js-intro-mark');
  const skip = intro.querySelector<HTMLButtonElement>('.js-intro-skip');

  wrapper.style.opacity = '0';
  gsap.set(mark, { opacity: 0, y: 12 });
  gsap.set(panel, { scaleY: 0, transformOrigin: '50% 100%' });

  const finish = () => {
    sessionStorage.setItem('vf-intro-seen', '1');
    gsap.set(wrapper, { opacity: 1 });
    intro.remove();
    document.documentElement.classList.remove('is-scroll-blocked');
    ScrollTrigger.refresh();
    onDone();
  };

  const tl = gsap.timeline({ onComplete: finish });

  tl.to(panel, { scaleY: 1, duration: 0.55, ease: 'power3.inOut' }, 0);
  tl.to(mark, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.35);
  tl.to(mark, { color: '#fffaf5', duration: 0.01 }, 0.35);
  tl.to(panel, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.5, ease: 'power3.inOut' }, 0.95);
  tl.to(mark, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, 1.15);
  tl.to(wrapper, { opacity: 1, duration: 0.35, ease: 'power2.out' }, 1.25);
  tl.to(intro, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 1.35);

  skip?.addEventListener('click', () => {
    tl.kill();
    finish();
  });
}

function initContrastToggle() {
  const btn = document.querySelector<HTMLButtonElement>('.js-contrast');
  const mask = document.querySelector<HTMLElement>('.js-contrast-mask');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const root = document.documentElement;
    const next = !root.classList.contains('theme-contrasted');

    if (mask && !prefersReducedMotion()) {
      gsap
        .timeline()
        .to(mask, { x: '0%', duration: 0.35, ease: 'power3.in' })
        .add(() => {
          root.classList.toggle('theme-contrasted', next);
          localStorage.setItem('vf-theme', next ? 'contrasted' : 'default');
          terrain?.setContrasted(next);
        })
        .to(mask, { x: '100%', duration: 0.35, ease: 'power3.out' })
        .set(mask, { x: '-100%' });
    } else {
      root.classList.toggle('theme-contrasted', next);
      localStorage.setItem('vf-theme', next ? 'contrasted' : 'default');
      terrain?.setContrasted(next);
    }
  });

  if (localStorage.getItem('vf-theme') === 'contrasted') {
    document.documentElement.classList.add('theme-contrasted');
  }
}

function initProgress() {
  const bar = document.querySelector<HTMLElement>('.js-progress');
  if (!bar || prefersReducedMotion()) return;

  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.3,
    },
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

function splitChars(el: HTMLElement, className: string) {
  const text = (el.textContent ?? '').toLowerCase();
  el.textContent = '';
  el.setAttribute('aria-label', text);
  const spans: HTMLElement[] = [];
  [...text].forEach((ch) => {
    const span = document.createElement('span');
    span.className = className;
    span.textContent = ch === ' ' ? '\u00a0' : ch;
    el.appendChild(span);
    spans.push(span);
  });
  return spans;
}

function initHero() {
  const lines = document.querySelectorAll<HTMLElement>('.js-hero-line');
  if (!lines.length) return;

  const allChars: HTMLElement[] = [];
  lines.forEach((line) => {
    allChars.push(...splitChars(line, 's-hero__char js-magnet-char'));
  });

  gsap.from(allChars, {
    yPercent: 110,
    opacity: 0,
    duration: 0.85,
    ease: 'power4.out',
    stagger: 0.025,
  });

  const hero = document.querySelector('.s-hero');
  const title = document.querySelector<HTMLElement>('.s-hero__title');
  if (hero && title && !prefersReducedMotion()) {
    // Scroll warp on the title block (not chars) so magnetic can own char transforms
    gsap.to(title, {
      yPercent: -14,
      skewX: 6,
      scale: 0.96,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.7,
      },
    });

    gsap.to('.s-hero__lede, .s-hero__actions, .s-hero__ticks', {
      y: -36,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });

    // Magnetic chars — document pointer so it always fires
    const onMove = (e: PointerEvent) => {
      const heroRect = hero.getBoundingClientRect();
      if (e.clientY < heroRect.top - 40 || e.clientY > heroRect.bottom + 40) {
        gsap.to(allChars, { x: 0, y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
        return;
      }

      allChars.forEach((char) => {
        const r = char.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const radius = 240;
        if (dist < radius) {
          const force = (1 - dist / radius) * 32;
          gsap.to(char, {
            x: (dx / dist) * force * -0.6,
            y: (dy / dist) * force * -0.5,
            duration: 0.22,
            ease: 'power2.out',
            overwrite: 'auto',
          });
        } else {
          gsap.to(char, { x: 0, y: 0, duration: 0.4, ease: 'power3.out', overwrite: 'auto' });
        }
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
  }
}

function initTextWarp() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-warp').forEach((title) => {
    const chars = splitChars(title, 'vf-warp-char');
    if (!chars.length) return;

    gsap.fromTo(
      chars,
      {
        y: 70,
        skewX: 18,
        rotate: 4,
        opacity: 0,
        scaleY: 1.35,
      },
      {
        y: 0,
        skewX: 0,
        rotate: 0,
        opacity: 1,
        scaleY: 1,
        ease: 'none',
        stagger: { each: 0.04, from: 'start' },
        scrollTrigger: {
          trigger: title,
          start: 'top 95%',
          end: 'top 35%',
          scrub: 1,
        },
      },
    );
  });
}

function initChapters() {
  document.querySelectorAll<HTMLElement>('.js-chapter').forEach((chapter) => {
    const parts = chapter.querySelectorAll('.js-chapter-index, .js-chapter-lede');
    gsap.from(parts, {
      y: 36,
      opacity: 0,
      duration: 0.75,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: chapter,
        start: 'top 80%',
      },
    });
  });
}

function initRules() {
  document.querySelectorAll<HTMLElement>('.js-rule').forEach((rule) => {
    gsap.fromTo(
      rule,
      { scaleX: 0 },
      {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: rule,
          start: 'top 90%',
          end: 'top 60%',
          scrub: true,
        },
      },
    );
  });
}

function initAbout() {
  const section = document.querySelector('.js-about');
  if (!section) return;

  gsap.from('.js-about-copy > *', {
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
    },
    y: 36,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
  });

  gsap.from('.js-about-aside', {
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
    },
    x: 30,
    opacity: 0,
    duration: 0.7,
    ease: 'power3.out',
  });

  gsap.from('.js-about-cred', {
    scrollTrigger: {
      trigger: '.s-about__creds',
      start: 'top 80%',
    },
    y: 50,
    opacity: 0,
    duration: 0.65,
    stagger: 0.12,
    ease: 'power3.out',
  });
}

function initWork() {
  const section = document.querySelector<HTMLElement>('.js-work');
  const track = document.querySelector<HTMLElement>('.js-work-track');
  if (!section || !track) return;

  const getScroll = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

  gsap.from('.s-work__item', {
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
    },
    y: 50,
    opacity: 0,
    duration: 0.65,
    stagger: 0.08,
    ease: 'power3.out',
  });

  // Cursor glow on work cards
  if (!prefersReducedMotion()) {
    document.querySelectorAll<HTMLElement>('.s-work__item').forEach((item) => {
      item.addEventListener('pointermove', (e) => {
        const r = item.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        item.style.setProperty('--mx', `${x}%`);
        item.style.setProperty('--my', `${y}%`);
        item.classList.add('is-hot');
      });
      item.addEventListener('pointerleave', () => {
        item.classList.remove('is-hot');
      });
    });
  }

  if (prefersReducedMotion() || window.innerWidth < 768) {
    track.style.overflowX = 'auto';
    return;
  }

  const scrollTween = gsap.to(track, {
    x: () => -getScroll(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${getScroll() + window.innerHeight * 1.1}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  document.querySelectorAll<HTMLElement>('.s-work__item').forEach((item) => {
    gsap.fromTo(
      item.querySelector('.s-work__media img'),
      { scale: 1.1 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          containerAnimation: scrollTween,
          start: 'left 90%',
          end: 'left 40%',
          scrub: true,
        },
      },
    );
  });
}

function initProof() {
  const section = document.querySelector('.js-proof');
  if (!section) return;

  gsap.from('.js-proof-stat', {
    scrollTrigger: {
      trigger: '.s-proof__stats',
      start: 'top 80%',
    },
    y: 36,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out',
  });

  gsap.from('.js-proof-lead', {
    scrollTrigger: {
      trigger: '.s-proof__lead',
      start: 'top 80%',
    },
    y: 30,
    opacity: 0,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out',
  });

  gsap.from('.js-proof-skill', {
    scrollTrigger: {
      trigger: '.s-proof__skills',
      start: 'top 85%',
    },
    y: 24,
    opacity: 0,
    duration: 0.55,
    stagger: 0.08,
    ease: 'power3.out',
  });
}

function initMargin() {
  const cards = document.querySelectorAll<HTMLElement>('.js-margin-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    gsap.fromTo(
      card,
      {
        y: 80,
        rotate: i % 2 === 0 ? -10 : 10,
        opacity: 0,
      },
      {
        y: 0,
        rotate: i % 2 === 0 ? -2 : 2,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 92%',
          end: 'top 58%',
          scrub: 0.7,
        },
      },
    );
  });
}

function initContact() {
  const section = document.querySelector('.s-contact');
  if (!section || prefersReducedMotion()) return;

  gsap.from('.s-contact__sub, .s-contact__go, .s-contact__email, .s-contact__links', {
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
    },
    y: 40,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
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
      const lenis = (window as unknown as { lenis?: Lenis }).lenis;
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -20 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function boot() {
  document.documentElement.classList.add('is-scroll-blocked');
  initContrastToggle();
  initNav();
  initClock();
  // Terrain boots immediately so the first paint isn't a flat orange void
  initTerrain();

  const afterIntro = () => {
    initLenis();
    initProgress();
    initHero();
    initTextWarp();
    initChapters();
    initRules();
    initAbout();
    initWork();
    initProof();
    initMargin();
    initContact();
    ScrollTrigger.refresh();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runIntro(afterIntro), { once: true });
  } else {
    runIntro(afterIntro);
  }
}

boot();
