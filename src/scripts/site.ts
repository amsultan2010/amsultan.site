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
  // lerp mode (not duration) = buttery glide, less wheel jitter on high-Hz displays
  const lenis = new Lenis({
    lerp: 0.075,
    smoothWheel: true,
    wheelMultiplier: 0.85,
    touchMultiplier: 1.4,
    syncTouch: false,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  document.documentElement.classList.add('lenis', 'lenis-smooth');

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
      scrub: true,
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
    yPercent: 120,
    rotateX: -55,
    opacity: 0,
    duration: 1,
    ease: 'power4.out',
    stagger: 0.028,
  });

  const hero = document.querySelector<HTMLElement>('.s-hero');
  const title = document.querySelector<HTMLElement>('.js-hero-title');
  const star = document.querySelector<HTMLElement>('.js-hero-star');
  const cue = document.querySelector<HTMLElement>('.js-scroll-cue');
  if (!hero || !title || prefersReducedMotion()) return;

  gsap.to(title, {
    yPercent: -18,
    scale: 0.92,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  if (star) {
    gsap.to(star, {
      rotate: 220,
      scale: 1.45,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  gsap.to('.s-hero__lede, .s-hero__actions', {
    y: -48,
    opacity: 0.1,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  if (cue) {
    gsap.to(cue, {
      opacity: 0,
      y: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: '20% top',
        scrub: true,
      },
    });
    gsap.to(cue, {
      y: 8,
      duration: 1.1,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }

  hero.querySelectorAll<HTMLElement>('.js-sep').forEach((sep, i) => {
    gsap.to(sep, {
      xPercent: i % 2 === 0 ? -12 : 12,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });

  // Magnetic letters + 3D title tilt (wodniack depth)
  const offsets = allChars.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));
  let tiltX = 0;
  let tiltY = 0;
  let tiltTX = 0;
  let tiltTY = 0;
  let magnetRaf = 0;

  const magnetLoop = () => {
    magnetRaf = requestAnimationFrame(magnetLoop);
    tiltX += (tiltTX - tiltX) * 0.08;
    tiltY += (tiltTY - tiltY) * 0.08;
    title.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;

    allChars.forEach((char, i) => {
      const o = offsets[i];
      o.x += (o.tx - o.x) * 0.16;
      o.y += (o.ty - o.y) * 0.16;
      const z = Math.abs(o.x) + Math.abs(o.y);
      char.style.transform = `translate3d(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px, ${z.toFixed(1)}px)`;
    });
  };
  magnetLoop();

  const onMove = (e: PointerEvent) => {
    const heroRect = hero.getBoundingClientRect();
    const nx = ((e.clientX - heroRect.left) / heroRect.width - 0.5) * 2;
    const ny = ((e.clientY - heroRect.top) / heroRect.height - 0.5) * 2;
    const inside =
      e.clientY >= heroRect.top - 40 && e.clientY <= heroRect.bottom + 40;

    if (!inside) {
      tiltTX = 0;
      tiltTY = 0;
      offsets.forEach((o) => {
        o.tx = 0;
        o.ty = 0;
      });
      return;
    }

    tiltTX = ny * -8;
    tiltTY = nx * 10;

    allChars.forEach((char, i) => {
      const r = char.getBoundingClientRect();
      const cx = r.left + r.width / 2 - offsets[i].x;
      const cy = r.top + r.height / 2 - offsets[i].y;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      const radius = 280;
      if (dist < radius) {
        const force = (1 - dist / radius) * 42;
        offsets[i].tx = (dx / dist) * force * -0.7;
        offsets[i].ty = (dy / dist) * force * -0.55;
      } else {
        offsets[i].tx = 0;
        offsets[i].ty = 0;
      }
    });
  };
  window.addEventListener('pointermove', onMove, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') cancelAnimationFrame(magnetRaf);
    else magnetLoop();
  });

  window.setInterval(() => {
    if (!allChars.length) return;
    const i = Math.floor(Math.random() * allChars.length);
    offsets[i].tx += (Math.random() - 0.5) * 14;
    offsets[i].ty += (Math.random() - 0.5) * 14;
    window.setTimeout(() => {
      offsets[i].tx *= 0.15;
      offsets[i].ty *= 0.15;
    }, 320);
  }, 1400);
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
        skewX: 16,
        opacity: 0.1,
        scaleY: 1.25,
      },
      {
        y: 0,
        skewX: 0,
        opacity: 1,
        scaleY: 1,
        ease: 'none',
        stagger: { each: 0.035, from: 'start' },
        scrollTrigger: {
          trigger: title,
          start: 'top 92%',
          end: 'top 38%',
          scrub: true,
        },
      },
    );
  });
}

function initRunways() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-runway').forEach((runway) => {
    const text = runway.querySelector<HTMLElement>('.js-runway-text');
    if (!text) return;

    const chars = splitChars(text, 'vf-warp-char');

    gsap.fromTo(
      text,
      { yPercent: 40, scale: 0.86 },
      {
        yPercent: -22,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: runway,
          start: 'top 95%',
          end: 'bottom 20%',
          scrub: 0.85,
        },
      },
    );

    if (chars.length) {
      gsap.fromTo(
        chars,
        { y: 50, skewX: 12, opacity: 0.15 },
        {
          y: 0,
          skewX: 0,
          opacity: 1,
          ease: 'none',
          stagger: { each: 0.028, from: 'start' },
          scrollTrigger: {
            trigger: runway,
            start: 'top 88%',
            end: 'center 45%',
            scrub: true,
          },
        },
      );
    }
  });
}

function initStretch() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-stretch').forEach((section) => {
    const letters = section.querySelectorAll<HTMLElement>('.js-stretch-letter');
    if (!letters.length) return;

    gsap.fromTo(
      letters,
      { scaleX: 0.08, scaleY: 1.35, opacity: 0.15, skewX: 8 },
      {
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        skewX: 0,
        ease: 'none',
        stagger: { each: 0.055, from: 'center' },
        scrollTrigger: {
          trigger: section,
          start: 'top 92%',
          end: 'center 32%',
          scrub: 1.1,
        },
      },
    );

    gsap.to(letters, {
      yPercent: (i) => (i % 2 === 0 ? -22 : 22),
      rotate: (i) => (i % 2 === 0 ? -4 : 4),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

function initSeparators() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-sep').forEach((sep) => {
    // Hero marquees already get parallax in initHero
    if (sep.closest('.s-hero')) return;

    gsap.fromTo(
      sep,
      { y: 28, opacity: 0.2 },
      {
        y: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sep,
          start: 'top 96%',
          end: 'top 60%',
          scrub: true,
        },
      },
    );
  });
}

function initBands() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.vf-band').forEach((band) => {
    gsap.fromTo(
      band,
      { xPercent: -6, opacity: 0.35 },
      {
        xPercent: 0,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: band,
          start: 'top 92%',
          end: 'top 55%',
          scrub: true,
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
      scrub: true,
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
    y: 48,
    opacity: 0,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
  });

  // Peak-End: big numbers land hard when they enter
  if (!prefersReducedMotion()) {
    document.querySelectorAll<HTMLElement>('.s-proof__value[data-value]').forEach((el) => {
      const raw = el.dataset.value ?? el.textContent ?? '';
      const match = raw.match(/([\d.]+)/);
      if (!match) return;
      const target = Number.parseFloat(match[1]);
      if (!Number.isFinite(target)) return;
      const prefix = raw.slice(0, raw.indexOf(match[1]));
      const suffix = raw.slice(raw.indexOf(match[1]) + match[1].length);
      const state = { v: 0 };
      gsap.to(state, {
        v: target,
        duration: 1.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          const decimals = match[1].includes('.') ? 2 : 0;
          el.textContent = `${prefix}${state.v.toFixed(decimals)}${suffix}`;
        },
      });
    });
  }

  gsap.from('.js-proof-lead', {
    scrollTrigger: {
      trigger: '.s-proof__lead',
      start: 'top 80%',
    },
    y: 36,
    opacity: 0,
    duration: 0.65,
    stagger: 0.1,
    ease: 'power3.out',
  });

  gsap.from('.js-proof-skill', {
    scrollTrigger: {
      trigger: '.s-proof__skills',
      start: 'top 85%',
    },
    y: 28,
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
          scrub: true,
        },
      },
    );
  });
}

function initContact() {
  const section = document.querySelector('.s-contact');
  const go = document.querySelector<HTMLElement>('.js-contact-go');
  const reveal = document.querySelector<HTMLElement>('.js-contact-reveal');
  const label = document.querySelector<HTMLElement>('.js-contact-go-label');
  if (!go || !reveal) return;

  if (section && !prefersReducedMotion()) {
    gsap.from(label, {
      scrollTrigger: {
        trigger: section,
        start: 'top 75%',
        end: 'top 28%',
        scrub: true,
      },
      scale: 0.4,
      opacity: 0.15,
      y: 120,
      rotate: -6,
    });

    gsap.from('.s-contact__title, .s-contact__email, .s-contact__sub, .s-contact__links', {
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
      },
      y: 36,
      opacity: 0,
      duration: 0.7,
      stagger: 0.08,
      ease: 'power3.out',
    });
  }

  const letters = reveal.querySelectorAll('.js-contact-letter');
  gsap.set(letters, { y: 24, opacity: 0, rotateX: -40 });

  let goTiltX = 0;
  let goTiltY = 0;
  let goTX = 0;
  let goTY = 0;
  let goRaf = 0;

  if (!prefersReducedMotion()) {
    const loop = () => {
      goRaf = requestAnimationFrame(loop);
      goTiltX += (goTX - goTiltX) * 0.1;
      goTiltY += (goTY - goTiltY) * 0.1;
      go.style.transform = `rotateX(${goTiltX.toFixed(2)}deg) rotateY(${goTiltY.toFixed(2)}deg)`;
    };
    loop();

    go.addEventListener(
      'pointermove',
      (e) => {
        const r = go.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        goTX = ny * -12;
        goTY = nx * 14;
      },
      { passive: true },
    );
    go.addEventListener('pointerleave', () => {
      goTX = 0;
      goTY = 0;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') cancelAnimationFrame(goRaf);
      else loop();
    });
  }

  const enter = () => {
    gsap.to(letters, {
      y: 0,
      opacity: 1,
      rotateX: 0,
      duration: 0.4,
      stagger: 0.04,
      ease: 'power3.out',
    });
    if (label) gsap.to(label, { color: 'var(--vf-mark)', duration: 0.25 });
  };
  const leave = () => {
    gsap.to(letters, {
      y: 24,
      opacity: 0,
      rotateX: -40,
      duration: 0.28,
      stagger: 0.02,
      ease: 'power2.in',
    });
    if (label) gsap.to(label, { color: 'var(--vf-ink)', duration: 0.25 });
  };

  go.addEventListener('mouseenter', enter);
  go.addEventListener('focus', enter);
  go.addEventListener('mouseleave', leave);
  go.addEventListener('blur', leave);
}

function initCursor() {
  const root = document.querySelector<HTMLElement>('.js-cursor');
  const ring = document.querySelector<HTMLElement>('.js-cursor-ring');
  const dot = document.querySelector<HTMLElement>('.js-cursor-dot');
  if (!root || !ring || !dot) return;
  if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

  document.body.classList.add('has-cursor');
  root.classList.add('is-on');

  let x = window.innerWidth / 2;
  let y = window.innerHeight / 2;
  let rx = x;
  let ry = y;
  let raf = 0;

  const loop = () => {
    raf = requestAnimationFrame(loop);
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`;
    dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  loop();

  window.addEventListener(
    'pointermove',
    (e) => {
      x = e.clientX;
      y = e.clientY;
    },
    { passive: true },
  );

  const hot = 'a, button, .js-magnetic, .s-work__item, .js-contact-go, .js-scramble';
  document.querySelectorAll(hot).forEach((el) => {
    el.addEventListener('mouseenter', () => root.classList.add('is-hot'));
    el.addEventListener('mouseleave', () => root.classList.remove('is-hot'));
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') cancelAnimationFrame(raf);
    else loop();
  });
}

function initMagneticButtons() {
  if (prefersReducedMotion() || window.matchMedia('(pointer: coarse)').matches) return;

  document.querySelectorAll<HTMLElement>('.js-magnetic').forEach((el) => {
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };
    loop();

    el.addEventListener(
      'pointermove',
      (e) => {
        const r = el.getBoundingClientRect();
        tx = (e.clientX - (r.left + r.width / 2)) * 0.28;
        ty = (e.clientY - (r.top + r.height / 2)) * 0.28;
      },
      { passive: true },
    );
    el.addEventListener('pointerleave', () => {
      tx = 0;
      ty = 0;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') cancelAnimationFrame(raf);
      else loop();
    });
  });
}

function initScramble() {
  if (prefersReducedMotion()) return;
  const glyphs = 'abcdefghijklmnopqrstuvwxyz####////';

  document.querySelectorAll<HTMLElement>('.js-scramble').forEach((el) => {
    const original = (el.textContent ?? '').trim();
    if (!original) return;

    let timer = 0;
    el.addEventListener('mouseenter', () => {
      window.clearInterval(timer);
      let frame = 0;
      const max = 10;
      timer = window.setInterval(() => {
        el.textContent = [...original]
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            if (frame / max > i / original.length) return original[i];
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('');
        frame += 1;
        if (frame > max) {
          window.clearInterval(timer);
          el.textContent = original;
        }
      }, 28);
    });
    el.addEventListener('mouseleave', () => {
      window.clearInterval(timer);
      el.textContent = original;
    });
  });
}

function initActiveNav() {
  const links = document.querySelectorAll<HTMLAnchorElement>('.js-nav-link');
  if (!links.length) return;

  const sections = ['about', 'work', 'proof', 'contact']
    .map((id) => document.getElementById(id))
    .filter((el): el is HTMLElement => !!el);

  const setActive = (id: string) => {
    links.forEach((link) => {
      link.classList.toggle('is-active', link.dataset.section === id);
    });
  };

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onEnter: () => setActive(section.id),
      onEnterBack: () => setActive(section.id),
    });
  });
}

function initImageParallax() {
  if (prefersReducedMotion()) return;

  // Margin photos only — work strip already has its own pin/scrub motion
  document.querySelectorAll<HTMLElement>('.s-margin__card img').forEach((img) => {
    gsap.fromTo(
      img,
      { yPercent: -10, scale: 1.14 },
      {
        yPercent: 10,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: img.parentElement,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      },
    );
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
      if (lenis) lenis.scrollTo(target as HTMLElement, { offset: -48 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });
}

function boot() {
  document.documentElement.classList.add('is-scroll-blocked');
  initContrastToggle();
  initNav();
  initClock();
  initTerrain();

  const afterIntro = () => {
    initLenis();
    initProgress();
    initCursor();
    initMagneticButtons();
    initScramble();
    initHero();
    initTextWarp();
    initRunways();
    initStretch();
    initSeparators();
    initBands();
    initChapters();
    initRules();
    initAbout();
    initWork();
    initProof();
    initMargin();
    initImageParallax();
    initContact();
    initActiveNav();
    ScrollTrigger.refresh();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runIntro(afterIntro), { once: true });
  } else {
    runIntro(afterIntro);
  }
}

boot();
