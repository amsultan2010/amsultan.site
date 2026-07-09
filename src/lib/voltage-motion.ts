import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createVoltageTerrain, type VoltageTerrainHandle } from './VoltageTerrain';

gsap.registerPlugin(ScrollTrigger);

let terrain: VoltageTerrainHandle | null = null;

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function isCoarsePointer() {
  return (
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  );
}

function initLenis() {
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
    // Keep CSS fallback topography visible when WebGL fails (common on iOS)
    if (fallback) fallback.style.opacity = '1';
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

function revealSite() {
  const wrapper = document.querySelector<HTMLElement>('.js-site-wrapper');
  if (wrapper) {
    wrapper.style.opacity = '1';
    wrapper.style.visibility = 'visible';
  }
  document.documentElement.classList.remove('is-scroll-blocked');
  document.querySelector('.js-intro')?.remove();
}

function runIntro(onDone: () => void) {
  const intro = document.querySelector<HTMLElement>('.js-intro');
  const wrapper = document.querySelector<HTMLElement>('.js-site-wrapper');
  if (!intro || !wrapper) {
    revealSite();
    onDone();
    return;
  }

  if (
    prefersReducedMotion() ||
    sessionStorage.getItem('vf-intro-seen') === '1'
  ) {
    sessionStorage.setItem('vf-intro-seen', '1');
    revealSite();
    onDone();
    return;
  }

  document.documentElement.classList.add('is-scroll-blocked');

  const panel = intro.querySelector<HTMLElement>('.js-intro-panel');
  const mark = intro.querySelector<HTMLElement>('.js-intro-mark');
  const skip = intro.querySelector<HTMLButtonElement>('.js-intro-skip');
  const borderT = intro.querySelector<HTMLElement>('.js-intro-border-t');
  const borderL = intro.querySelector<HTMLElement>('.js-intro-border-l');
  const borderR = intro.querySelector<HTMLElement>('.js-intro-border-r');

  wrapper.style.opacity = '0';
  if (mark) gsap.set(mark, { opacity: 0, y: 12 });
  if (panel) gsap.set(panel, { scaleY: 0, transformOrigin: '50% 100%' });
  if (borderT) gsap.set(borderT, { scaleX: 0 });
  if (borderL && borderR) gsap.set([borderL, borderR], { scaleY: 0 });

  let done = false;
  const finish = () => {
    if (done) return;
    done = true;
    sessionStorage.setItem('vf-intro-seen', '1');
    revealSite();
    ScrollTrigger.refresh();
    onDone();
  };

  const tl = gsap.timeline({ onComplete: finish });

  // Frame draw then wipe — wodniack intro rhythm
  if (borderT) tl.to(borderT, { scaleX: 1, duration: 0.45, ease: 'expo.out' }, 0);
  if (borderL && borderR) {
    tl.to([borderL, borderR], { scaleY: 1, duration: 0.55, ease: 'expo.out', stagger: 0.08 }, 0.1);
  }
  if (panel) tl.to(panel, { scaleY: 1, duration: 0.6, ease: 'expo.inOut' }, 0.25);
  if (mark) {
    tl.to(mark, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.55);
    tl.to(mark, { color: '#fffaf5', duration: 0.01 }, 0.55);
  }
  if (panel) tl.to(panel, { scaleY: 0, transformOrigin: '50% 0%', duration: 0.55, ease: 'expo.inOut' }, 1.05);
  if (mark) tl.to(mark, { opacity: 0, y: -10, duration: 0.3, ease: 'power2.in' }, 1.25);
  tl.to(wrapper, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 1.35);
  tl.to(intro, { autoAlpha: 0, duration: 0.25, ease: 'power2.in' }, 1.45);

  skip?.addEventListener('click', () => {
    tl.kill();
    finish();
  });

  // Safety: never leave the page stuck behind the intro
  window.setTimeout(finish, 2800);
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
  // Keep words intact so inline-block letters don't wrap mid-word.
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
      span.className = className;
      span.textContent = ch;
      word.appendChild(span);
      spans.push(span);
    });
    el.appendChild(word);
  });
  return spans;
}

function splitHeroChars(el: HTMLElement) {
  const text = (el.textContent ?? '').toLowerCase();
  el.textContent = '';
  el.setAttribute('aria-label', text);
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

function initHero() {
  const lines = document.querySelectorAll<HTMLElement>('.js-hero-line');
  if (!lines.length) return;

  const allChars: HTMLElement[] = [];
  lines.forEach((line) => {
    allChars.push(...splitHeroChars(line));
  });

  gsap.from(allChars, {
    yPercent: 120,
    opacity: 0,
    duration: 1.1,
    ease: 'expo.out',
    stagger: 0.025,
  });

  const hero = document.querySelector<HTMLElement>('.s-hero');
  const title = document.querySelector<HTMLElement>('.js-hero-title');
  const star = document.querySelector<HTMLElement>('.js-hero-star');
  const cue = document.querySelector<HTMLElement>('.js-scroll-cue');
  if (!hero || !title || prefersReducedMotion()) return;

  gsap.to(title, {
    yPercent: -18,
    scale: 0.9,
    ease: 'none',
    scrollTrigger: {
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });

  if (star) {
    gsap.from(star, { rotate: 90, duration: 1.6, ease: 'expo.out', delay: 0.35 });
    gsap.to(star, {
      rotate: 220,
      scale: 1.35,
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
    y: -40,
    opacity: 0.15,
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

  // Living hero type — ambient on every device (no finger required)
  const offsets = allChars.map(() => ({ x: 0, y: 0, tx: 0, ty: 0 }));
  let tiltX = 0;
  let tiltY = 0;
  let tiltTX = 0;
  let tiltTY = 0;
  let magnetRaf = 0;
  let ambientT = 0;
  const coarse = isCoarsePointer();

  const magnetLoop = () => {
    magnetRaf = requestAnimationFrame(magnetLoop);
    ambientT += 0.016;

    if (coarse) {
      // Auto wave so phones get the same living magnet feel without pointer
      tiltTX = Math.sin(ambientT * 0.7) * 7;
      tiltTY = Math.cos(ambientT * 0.55) * 9;
      allChars.forEach((_, i) => {
        const phase = ambientT * 1.4 + i * 0.35;
        offsets[i].tx = Math.sin(phase) * 10;
        offsets[i].ty = Math.cos(phase * 0.85) * 7;
      });
    }

    tiltX += (tiltTX - tiltX) * 0.08;
    tiltY += (tiltTY - tiltY) * 0.08;
    title.style.transform = `rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`;

    allChars.forEach((char, i) => {
      const o = offsets[i];
      o.x += (o.tx - o.x) * 0.16;
      o.y += (o.ty - o.y) * 0.16;
      char.style.transform = `translate3d(${o.x.toFixed(2)}px, ${o.y.toFixed(2)}px, 0)`;
    });
  };
  magnetLoop();

  if (!coarse) {
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

      tiltTX = ny * -9;
      tiltTY = nx * 11;

      allChars.forEach((char, i) => {
        const r = char.getBoundingClientRect();
        const cx = r.left + r.width / 2 - offsets[i].x;
        const cy = r.top + r.height / 2 - offsets[i].y;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const radius = 320;
        if (dist < radius) {
          const force = (1 - dist / radius) * 38;
          offsets[i].tx = (dx / dist) * force * -0.75;
          offsets[i].ty = (dy / dist) * force * -0.58;
        } else {
          offsets[i].tx = 0;
          offsets[i].ty = 0;
        }
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') cancelAnimationFrame(magnetRaf);
    else magnetLoop();
  });

  const dirs = ['to-top', 'to-right', 'to-bottom', 'to-left'];
  const flipTick = () => {
    if (!allChars.length || Math.random() > 0.18) return;
    const start = Math.floor(Math.random() * allChars.length);
    const count = 1 + Math.floor(Math.random() * 3);
    for (let n = 0; n < count; n += 1) {
      const char = allChars[(start + n) % allChars.length];
      if (dirs.some((d) => char.classList.contains(d))) continue;
      const dir = dirs[Math.floor(Math.random() * dirs.length)];
      char.classList.add(dir);
      window.setTimeout(() => char.classList.remove(dir), 1000);
    }
  };
  flipTick();
  window.setInterval(flipTick, 120);
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
      { scaleX: 0.05, scaleY: 1.55, opacity: 0.12, skewX: 14, rotateY: -35 },
      {
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        skewX: 0,
        rotateY: 0,
        ease: 'none',
        stagger: { each: 0.06, from: 'center' },
        scrollTrigger: {
          trigger: section,
          start: 'top 96%',
          end: 'center 28%',
          scrub: 1.15,
        },
      },
    );

    gsap.to(letters, {
      yPercent: (i) => (i % 2 === 0 ? -28 : 28),
      rotate: (i) => (i % 2 === 0 ? -6 : 6),
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
    gsap.fromTo(
      sep,
      { y: 20, opacity: 0.25 },
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

    // Living instrument strip — random char flips while in view
    const chars = sep.querySelectorAll<HTMLElement>('.js-sep-char');
    if (!chars.length) return;

    let active = false;
    const setActive = (on: boolean) => {
      active = on;
    };
    ScrollTrigger.create({
      trigger: sep,
      start: 'top bottom',
      end: 'bottom top',
      onEnter: () => setActive(true),
      onEnterBack: () => setActive(true),
      onLeave: () => setActive(false),
      onLeaveBack: () => setActive(false),
      onToggle: (self) => setActive(self.isActive),
    });
    // IO backup — ST onEnter can miss on iOS address-bar resize
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => setActive(entry.isIntersecting));
        },
        { rootMargin: '20% 0px', threshold: 0 },
      );
      io.observe(sep);
    }
    // Kick if already on screen at boot
    const r = sep.getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) setActive(true);

    window.setInterval(() => {
      if (!active) return;
      chars.forEach((char) => {
        if (Math.random() > 0.16) return;
        char.classList.add('is-flip');
        window.setTimeout(() => char.classList.remove('is-flip'), 220);
      });
    }, 220);
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

  // Body copy: scrubbed char warp (not a plain fade) on every viewport
  if (!prefersReducedMotion()) {
    document.querySelectorAll<HTMLElement>('.js-about-copy .s-about__body').forEach((p) => {
      const chars = splitChars(p, 'vf-warp-char');
      if (!chars.length) return;
      gsap.fromTo(
        chars,
        { y: 48, skewX: 12, opacity: 0.12, rotateX: -28 },
        {
          y: 0,
          skewX: 0,
          opacity: 1,
          rotateX: 0,
          ease: 'none',
          stagger: { each: 0.012, from: 'start' },
          scrollTrigger: {
            trigger: p,
            start: 'top 90%',
            end: 'top 45%',
            scrub: true,
          },
        },
      );
    });

    document.querySelectorAll<HTMLElement>('.s-about__cred-school').forEach((title) => {
      const chars = splitChars(title, 'vf-warp-char');
      if (!chars.length) return;
      gsap.fromTo(
        chars,
        { y: 56, skewX: 14, opacity: 0.1, scaleY: 1.2 },
        {
          y: 0,
          skewX: 0,
          opacity: 1,
          scaleY: 1,
          ease: 'none',
          stagger: { each: 0.02, from: 'start' },
          scrollTrigger: {
            trigger: title,
            start: 'top 92%',
            end: 'top 50%',
            scrub: true,
          },
        },
      );
    });
  }

  gsap.from('.js-about-copy > *:not(.s-about__body):not(.js-reveal-lines)', {
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
    },
    y: 40,
    opacity: 0,
    duration: 0.75,
    stagger: 0.09,
    ease: 'power3.out',
  });

  gsap.from('.js-about-aside', {
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
    },
    y: 28,
    opacity: 0,
    duration: 0.75,
    ease: 'power3.out',
  });

  document.querySelectorAll<HTMLElement>('.js-about-cred').forEach((cred) => {
    const line = cred.querySelector('.s-about__cred-line');
    gsap.from(cred.querySelector('.s-about__cred-body'), {
      scrollTrigger: {
        trigger: cred,
        start: 'top 85%',
      },
      y: 40,
      opacity: 0,
      duration: 0.7,
      ease: 'power3.out',
    });
    if (line && !prefersReducedMotion()) {
      gsap.fromTo(
        line,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: cred,
            start: 'top 80%',
            end: 'bottom 40%',
            scrub: true,
          },
        },
      );
    }
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

  // Card glow — pointer on desktop; ambient in-view on touch (no extra desktop load)
  if (!prefersReducedMotion()) {
    const coarse = isCoarsePointer();
    document.querySelectorAll<HTMLElement>('.s-work__item').forEach((item, i) => {
      if (coarse) {
        let hot = false;
        const drift = { t: 0 };
        ScrollTrigger.create({
          trigger: item,
          start: 'top 85%',
          end: 'bottom 20%',
          onEnter: () => {
            hot = true;
            item.classList.add('is-hot');
          },
          onEnterBack: () => {
            hot = true;
            item.classList.add('is-hot');
          },
          onLeave: () => {
            hot = false;
            item.classList.remove('is-hot');
          },
          onLeaveBack: () => {
            hot = false;
            item.classList.remove('is-hot');
          },
        });
        gsap.to(drift, {
          t: 1,
          duration: 3.2 + (i % 3) * 0.4,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          onUpdate() {
            if (!hot) return;
            item.style.setProperty('--mx', `${20 + drift.t * 60}%`);
            item.style.setProperty('--my', `${30 + (1 - drift.t) * 40}%`);
          },
        });
        return;
      }

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

  if (prefersReducedMotion()) return;

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
      { scale: 1.14 },
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

    ScrollTrigger.create({
      trigger: item,
      containerAnimation: scrollTween,
      start: 'left 100%',
      end: 'left 20%',
      scrub: true,
      onUpdate: (self) => {
        const tilt = (0.5 - self.progress) * 30;
        item.style.setProperty('--tilt', `${tilt.toFixed(2)}deg`);
      },
    });
  });
}

function initProof() {
  const section = document.querySelector('.js-proof');
  if (!section) return;

  if (!prefersReducedMotion()) {
    document.querySelectorAll<HTMLElement>('.s-proof__lead-title').forEach((title) => {
      const chars = splitChars(title, 'vf-warp-char');
      if (!chars.length) return;
      gsap.fromTo(
        chars,
        { y: 52, skewX: 12, opacity: 0.1, rotateX: -30 },
        {
          y: 0,
          skewX: 0,
          opacity: 1,
          rotateX: 0,
          ease: 'none',
          stagger: { each: 0.018, from: 'start' },
          scrollTrigger: {
            trigger: title,
            start: 'top 92%',
            end: 'top 48%',
            scrub: true,
          },
        },
      );
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
        y: 110,
        rotate: i % 2 === 0 ? -18 : 18,
        scale: 0.82,
        opacity: 0.15,
      },
      {
        y: 0,
        rotate: i % 2 === 0 ? -2.5 : 2.5,
        scale: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 96%',
          end: 'top 48%',
          scrub: true,
        },
      },
    );
  });

  if (prefersReducedMotion()) return;

  // Soft 3D tilt — ambient float on coarse; pointer on desktop
  cards.forEach((card, i) => {
    if (isCoarsePointer()) {
      const state = { rx: 0, ry: 0, y: 0 };
      gsap.to(state, {
        rx: i % 2 === 0 ? -14 : 14,
        ry: i % 2 === 0 ? 16 : -16,
        y: i % 2 === 0 ? -10 : 10,
        duration: 2.2 + (i % 3) * 0.3,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        onUpdate: () => {
          card.style.setProperty('--rx', `${state.rx.toFixed(2)}deg`);
          card.style.setProperty('--ry', `${state.ry.toFixed(2)}deg`);
          card.style.setProperty('--float-y', `${state.y.toFixed(2)}px`);
        },
      });
      return;
    }
    card.addEventListener(
      'pointermove',
      (e) => {
        const r = card.getBoundingClientRect();
        const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
        const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
        card.style.setProperty('--rx', `${(-ny * 14).toFixed(2)}deg`);
        card.style.setProperty('--ry', `${(nx * 16).toFixed(2)}deg`);
      },
      { passive: true },
    );
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
}

function initContact() {
  const section = document.querySelector('.s-contact');
  const hover = document.querySelector<HTMLElement>('.js-contact-hover');
  const go = document.querySelector<HTMLElement>('.js-contact-go');
  const label = document.querySelector<HTMLElement>('.js-contact-go-label');
  if (!go || !hover) return;

  if (section && !prefersReducedMotion()) {
    gsap.from(hover, {
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        end: 'top 35%',
        scrub: true,
      },
      scale: 0.48,
      opacity: 0.15,
      y: 100,
      rotate: -8,
    });

    gsap.from('.s-contact__title, .s-contact__email, .s-contact__sub, .s-contact__links', {
      scrollTrigger: {
        trigger: section,
        start: 'top 65%',
      },
      y: 42,
      opacity: 0,
      duration: 0.8,
      stagger: 0.09,
      ease: 'expo.out',
    });
  }

  // GO pulse — idle breathing like wodniack CTA
  let pulse: gsap.core.Tween | null = null;
  if (!prefersReducedMotion() && label) {
    pulse = gsap.to(label, {
      scale: 1.08,
      duration: 1.6,
      yoyo: true,
      repeat: -1,
      ease: 'power1.inOut',
    });
  }

  // Magnetic pull on the GO circle
  if (!prefersReducedMotion() && !isCoarsePointer()) {
    let mx = 0;
    let my = 0;
    let mtx = 0;
    let mty = 0;
    let mraf = 0;
    const mloop = () => {
      mraf = requestAnimationFrame(mloop);
      mx += (mtx - mx) * 0.12;
      my += (mty - my) * 0.12;
      if (!hover.classList.contains('is-active')) {
        go.style.transform = `translate3d(${mx.toFixed(2)}px, ${my.toFixed(2)}px, 0)`;
      }
    };
    mloop();
    hover.addEventListener(
      'pointermove',
      (e) => {
        const r = hover.getBoundingClientRect();
        mtx = (e.clientX - (r.left + r.width / 2)) * 0.18;
        mty = (e.clientY - (r.top + r.height / 2)) * 0.18;
      },
      { passive: true },
    );
    hover.addEventListener('pointerleave', () => {
      mtx = 0;
      mty = 0;
    });
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') cancelAnimationFrame(mraf);
      else mloop();
    });
  }

  const chars = hover.querySelectorAll<HTMLElement>('.s-contact__cta-char');
  const enter = () => {
    hover.classList.add('is-active');
    go.style.transform = '';
    pulse?.pause();
    if (!prefersReducedMotion() && chars.length) {
      gsap.fromTo(
        chars,
        { yPercent: 110, opacity: 0 },
        { yPercent: 0, opacity: 1, duration: 0.55, stagger: 0.035, ease: 'expo.out', delay: 0.12 },
      );
    }
  };
  const leave = () => {
    hover.classList.remove('is-active');
    pulse?.play();
    go.style.transform = '';
  };

  hover.addEventListener('pointerenter', enter);
  hover.addEventListener('focusin', enter);
  hover.addEventListener('pointerleave', leave);
  hover.addEventListener('focusout', leave);
}

function initScrollbar() {
  const bar = document.querySelector<HTMLElement>('.site-scrollbar');
  const thumb = document.querySelector<HTMLElement>('.js-scrollbar-thumb');
  if (!bar || !thumb || prefersReducedMotion()) return;

  document.documentElement.classList.add('has-scrollbar');

  const set = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    const height = Math.max(36, (window.innerHeight / document.documentElement.scrollHeight) * window.innerHeight);
    const top = progress * (window.innerHeight - height);
    bar.style.setProperty('--scrollbar-height', `${height}px`);
    bar.style.setProperty('--scrollbar-top', `${top}px`);
  };

  set();
  window.addEventListener('scroll', set, { passive: true });
  window.addEventListener('resize', set, { passive: true });
  const lenis = (window as unknown as { lenis?: Lenis }).lenis;
  lenis?.on('scroll', set);

  let dragging = false;
  let startY = 0;
  let startScroll = 0;

  const onStart = (e: MouseEvent | TouchEvent) => {
    dragging = true;
    bar.classList.add('is-dragging');
    startY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
    startScroll = window.scrollY;
    e.preventDefault();
  };
  const onMove = (e: MouseEvent | TouchEvent) => {
    if (!dragging) return;
    const y = e instanceof MouseEvent ? e.clientY : e.touches?.[0]?.clientY;
    if (y == null) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const delta = ((y - startY) / window.innerHeight) * max;
    window.scrollTo(0, startScroll + delta);
    e.preventDefault();
  };
  const onEnd = () => {
    dragging = false;
    bar.classList.remove('is-dragging');
  };

  thumb.addEventListener('mousedown', onStart);
  thumb.addEventListener('touchstart', onStart, { passive: false });
  document.addEventListener('mousemove', onMove, { passive: false });
  document.addEventListener('touchmove', onMove, { passive: false });
  document.addEventListener('mouseup', onEnd);
  document.addEventListener('touchend', onEnd);
}

function initCursor() {
  const root = document.querySelector<HTMLElement>('.js-cursor');
  const ring = document.querySelector<HTMLElement>('.js-cursor-ring');
  const dot = document.querySelector<HTMLElement>('.js-cursor-dot');
  if (!root || !ring || !dot) return;
  // Custom cursor is pointer-only chrome; keep it off coarse touch UIs
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
    rx += (x - rx) * 0.12;
    ry += (y - ry) * 0.12;
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

  const hot = 'a, button, .js-magnetic, .s-work__item, .js-contact-go, .js-contact-hover, .js-scramble, .js-margin-card';
  document.querySelectorAll(hot).forEach((el) => {
    el.addEventListener('mouseenter', () => root.classList.add('is-hot'));
    el.addEventListener('mouseleave', () => root.classList.remove('is-hot'));
  });

  document.addEventListener('mousedown', () => root.classList.add('is-down'));
  document.addEventListener('mouseup', () => root.classList.remove('is-down'));

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') cancelAnimationFrame(raf);
    else loop();
  });
}

function initMagneticButtons() {
  if (prefersReducedMotion()) return;
  const coarse = isCoarsePointer();

  document.querySelectorAll<HTMLElement>('.js-magnetic').forEach((el, i) => {
    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let t = i * 0.7;

    const loop = () => {
      raf = requestAnimationFrame(loop);
      t += 0.016;
      if (coarse) {
        tx = Math.sin(t * 1.3 + i) * 6;
        ty = Math.cos(t * 1.1 + i) * 4;
      }
      x += (tx - x) * 0.16;
      y += (ty - y) * 0.16;
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    };
    loop();

    if (!coarse) {
      el.addEventListener(
        'pointermove',
        (e) => {
          const r = el.getBoundingClientRect();
          tx = (e.clientX - (r.left + r.width / 2)) * 0.45;
          ty = (e.clientY - (r.top + r.height / 2)) * 0.45;
        },
        { passive: true },
      );
      el.addEventListener('pointerleave', () => {
        tx = 0;
        ty = 0;
      });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') cancelAnimationFrame(raf);
      else loop();
    });
  });
}

function initScramble() {
  if (prefersReducedMotion()) return;
  const glyphs = 'abcdefghijklmnopqrstuvwxyz01##////<>';

  const runScramble = (el: HTMLElement, original: string) => {
    let frame = 0;
    const max = 16;
    const timer = window.setInterval(() => {
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
    }, 18);
    return timer;
  };

  document.querySelectorAll<HTMLElement>('.js-scramble').forEach((el) => {
    const original = (el.textContent ?? '').trim();
    if (!original) return;

    let timer = 0;
    // Auto-scramble when scrolled into view — no hover/tap
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      end: 'bottom 15%',
      onEnter: () => {
        window.clearInterval(timer);
        timer = runScramble(el, original);
      },
      onEnterBack: () => {
        window.clearInterval(timer);
        timer = runScramble(el, original);
      },
    });

    if (!isCoarsePointer()) {
      el.addEventListener('pointerenter', () => {
        window.clearInterval(timer);
        timer = runScramble(el, original);
      });
      el.addEventListener('pointerleave', () => {
        window.clearInterval(timer);
        el.textContent = original;
      });
    }
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

function initRevealLines() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-reveal-lines').forEach((el) => {
    const chars = splitChars(el, 'vf-warp-char');
    if (!chars.length) return;
    gsap.fromTo(
      chars,
      { yPercent: 110, opacity: 0, rotateX: -40, skewX: 10 },
      {
        yPercent: 0,
        opacity: 1,
        rotateX: 0,
        skewX: 0,
        ease: 'none',
        stagger: { each: 0.02, from: 'start' },
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          end: 'top 42%',
          scrub: true,
        },
      },
    );
  });
}

function initClipReveals() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-proof-skill, .js-work-item').forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: 'inset(12% 8% 12% 8%)', opacity: 0.35 },
      {
        clipPath: 'inset(0% 0% 0% 0%)',
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top 92%',
          end: 'top 55%',
          scrub: true,
        },
      },
    );
  });
}

function initNoisePulse() {
  const noise = document.querySelector<HTMLElement>('.js-noise');
  if (!noise || prefersReducedMotion()) return;

  gsap.to(noise, {
    opacity: 0.08,
    duration: 2.4,
    yoyo: true,
    repeat: -1,
    ease: 'sine.inOut',
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

function initFadeUps() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-fade-up').forEach((el, i) => {
    gsap.from(el, {
      y: 36,
      opacity: 0,
      duration: 0.9,
      delay: 0.15 + i * 0.08,
      ease: 'expo.out',
    });
  });
}

function initLivingLabels() {
  if (prefersReducedMotion()) return;

  // Soft ambient scramble on mono labels while in view — instrument chatter
  const labels = document.querySelectorAll<HTMLElement>(
    '.s-proof__block-label, .s-about__aside-label, .s-about__edu-label, .s-margin__label, .s-work__count',
  );
  const glyphs = 'abcdefghijklmnopqrstuvwxyz##/';

  labels.forEach((el) => {
    const original = (el.textContent ?? '').trim();
    if (!original || original.length > 18) return;

    let active = false;
    let tick = 0;
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      end: 'bottom 10%',
      onEnter: () => {
        active = true;
      },
      onEnterBack: () => {
        active = true;
      },
      onLeave: () => {
        active = false;
        window.clearInterval(tick);
        tick = 0;
        el.textContent = original;
      },
      onLeaveBack: () => {
        active = false;
        window.clearInterval(tick);
        tick = 0;
        el.textContent = original;
      },
    });

    const cadence = isCoarsePointer() ? 1400 : 2400;
    window.setInterval(() => {
      if (!active || Math.random() > (isCoarsePointer() ? 0.2 : 0.08) || tick) return;
      let frame = 0;
      const max = 6;
      tick = window.setInterval(() => {
        el.textContent = [...original]
          .map((ch, i) => {
            if (ch === ' ') return ' ';
            if (frame / max > i / original.length) return original[i];
            return glyphs[Math.floor(Math.random() * glyphs.length)];
          })
          .join('');
        frame += 1;
        if (frame > max) {
          window.clearInterval(tick);
          tick = 0;
          el.textContent = original;
        }
      }, 24);
    }, cadence);
  });
}

export function initVoltageMotion() {
  document.documentElement.classList.add('is-scroll-blocked');

  initContrastToggle();
  initNav();
  initClock();
  initTerrain();

  const afterIntro = () => {
    revealSite();
    try {
      initLenis();
      initProgress();
      initScrollbar();
      initCursor();
      initMagneticButtons();
      initScramble();
      initNoisePulse();
      initHero();
      initFadeUps();
      initTextWarp();
      initRevealLines();
      initRunways();
      initStretch();
      initSeparators();
      initBands();
      initChapters();
      initRules();
      initAbout();
      initWork();
      initClipReveals();
      initProof();
      initMargin();
      initImageParallax();
      initContact();
      initLivingLabels();
      initActiveNav();
      ScrollTrigger.refresh();
      requestAnimationFrame(() => ScrollTrigger.refresh());
      window.setTimeout(() => ScrollTrigger.refresh(), 400);
      window.addEventListener('orientationchange', () => {
        window.setTimeout(() => ScrollTrigger.refresh(), 250);
      });
    } catch (err) {
      console.error('[voltage] init failed', err);
      revealSite();
    }
  };

  window.setTimeout(revealSite, 2800);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => runIntro(afterIntro), { once: true });
  } else {
    runIntro(afterIntro);
  }
}
