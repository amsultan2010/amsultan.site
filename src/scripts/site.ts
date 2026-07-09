import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function initLenis() {
  const lenis = new Lenis({
    duration: 1.25,
    smoothWheel: true,
  });

  lenis.on('scroll', ScrollTrigger.update);

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  (window as unknown as { lenis: Lenis }).lenis = lenis;
  return lenis;
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

  const linesV = intro.querySelectorAll('.js-intro-line-v');
  const linesH = intro.querySelectorAll('.js-intro-line-h');
  const mark = intro.querySelector('.js-intro-mark');
  const skip = intro.querySelector<HTMLButtonElement>('.js-intro-skip');
  const borderTop = intro.querySelector('.site-intro__border--top');
  const borderSides = intro.querySelectorAll('.site-intro__border--left, .site-intro__border--right');

  wrapper.style.opacity = '0';

  const finish = () => {
    sessionStorage.setItem('vf-intro-seen', '1');
    wrapper.style.opacity = '1';
    intro.remove();
    document.documentElement.classList.remove('is-scroll-blocked');
    document.dispatchEvent(new CustomEvent('vf:intro-done'));
    ScrollTrigger.refresh();
    onDone();
  };

  const tl = gsap.timeline({ onComplete: finish });

  tl.to(mark, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0);
  tl.fromTo(
    linesV,
    { scaleY: 0 },
    { scaleY: 1, duration: 0.7, ease: 'power4.inOut', stagger: 0.1 },
    0.15,
  );
  tl.fromTo(
    linesH,
    { scaleX: 0 },
    { scaleX: 1, duration: 0.45, ease: 'power4.inOut', stagger: 0.05 },
    0.55,
  );
  if (borderTop) {
    tl.fromTo(borderTop, { scaleY: 0 }, { scaleY: 1, duration: 1.2, ease: 'power3.inOut' }, 0.4);
  }
  if (borderSides.length) {
    tl.fromTo(borderSides, { scaleX: 0 }, { scaleX: 1, duration: 1.2, ease: 'power3.inOut' }, 0.4);
  }
  tl.to(wrapper, { opacity: 1, duration: 0.01 }, 1.5);
  tl.to(intro, { autoAlpha: 0, duration: 0.45, ease: 'power2.in' }, 1.9);

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
        })
        .to(mask, { x: '100%', duration: 0.35, ease: 'power3.out' })
        .set(mask, { x: '-100%' });
    } else {
      root.classList.toggle('theme-contrasted', next);
      localStorage.setItem('vf-theme', next ? 'contrasted' : 'default');
    }
  });

  if (localStorage.getItem('vf-theme') === 'contrasted') {
    document.documentElement.classList.add('theme-contrasted');
  }
}

function initHero() {
  const words = document.querySelectorAll<HTMLElement>('.js-hero-word');
  if (!words.length) return;

  words.forEach((word) => {
    const text = word.textContent ?? '';
    word.textContent = '';
    word.setAttribute('aria-label', text);
    [...text].forEach((ch) => {
      const span = document.createElement('span');
      span.className = 's-hero__char';
      span.textContent = ch === ' ' ? '\u00a0' : ch;
      word.appendChild(span);
    });
  });

  const chars = document.querySelectorAll('.s-hero__char');
  gsap.from(chars, {
    yPercent: 110,
    opacity: 0,
    duration: 0.9,
    ease: 'power4.out',
    stagger: 0.03,
    delay: 0.05,
  });

  // Parallax hero on scroll
  const hero = document.querySelector('.s-hero');
  if (hero && !prefersReducedMotion()) {
    gsap.to('.s-hero__title', {
      yPercent: -18,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
    gsap.to('.s-hero__lede, .s-hero__actions', {
      yPercent: -40,
      opacity: 0.2,
      ease: 'none',
      scrollTrigger: {
        trigger: hero,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  }

  if (!prefersReducedMotion()) {
    setInterval(() => {
      const list = Array.from(document.querySelectorAll<HTMLElement>('.s-hero__char'));
      if (!list.length) return;
      const el = list[Math.floor(Math.random() * list.length)];
      const dx = (Math.random() - 0.5) * 18;
      const dy = (Math.random() - 0.5) * 18;
      gsap.fromTo(
        el,
        { x: 0, y: 0 },
        { x: dx, y: dy, duration: 0.35, yoyo: true, repeat: 1, ease: 'power2.inOut' },
      );
    }, 2200);
  }
}

function initRunways() {
  document.querySelectorAll<HTMLElement>('.js-runway').forEach((runway) => {
    const text = runway.querySelector('.js-runway-text');
    if (!text) return;

    gsap.fromTo(
      text,
      { yPercent: 40, opacity: 0.15, scale: 0.92 },
      {
        yPercent: -20,
        opacity: 1,
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: runway,
          start: 'top 90%',
          end: 'bottom 20%',
          scrub: 0.8,
        },
      },
    );
  });
}

function initStretch() {
  if (prefersReducedMotion()) return;

  document.querySelectorAll<HTMLElement>('.js-stretch').forEach((section) => {
    const letters = section.querySelectorAll<HTMLElement>('.js-stretch-letter');
    if (!letters.length) return;

    gsap.fromTo(
      letters,
      { scaleX: 0.35, opacity: 0.35 },
      {
        scaleX: 1,
        opacity: 1,
        ease: 'none',
        stagger: { each: 0.04, from: 'center' },
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          end: 'center 40%',
          scrub: 0.9,
        },
      },
    );

    gsap.to(letters, {
      yPercent: (i) => (i % 2 === 0 ? -12 : 12),
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
  document.querySelectorAll<HTMLElement>('.a-sep').forEach((sep) => {
    gsap.fromTo(
      sep,
      { scaleX: 0.4, opacity: 0.3 },
      {
        scaleX: 1,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: sep,
          start: 'top 95%',
          end: 'top 50%',
          scrub: true,
        },
      },
    );
  });
}

function initAbout() {
  const section = document.querySelector('.js-about');
  if (!section) return;

  gsap.from('.js-about-wall', {
    scrollTrigger: {
      trigger: section,
      start: 'top 80%',
      end: 'center center',
      scrub: 0.8,
    },
    scaleY: 0.15,
    opacity: 0,
    stagger: 0.08,
  });

  gsap.from('.js-about-copy > *', {
    scrollTrigger: {
      trigger: section,
      start: 'top 70%',
      end: 'top 30%',
      scrub: 0.6,
    },
    y: 80,
    opacity: 0,
    stagger: 0.08,
  });

  gsap.from('.s-about__cred', {
    scrollTrigger: {
      trigger: '.s-about__creds',
      start: 'top 80%',
      end: 'top 40%',
      scrub: 0.5,
    },
    x: -40,
    opacity: 0,
    stagger: 0.15,
  });
}

function initWork() {
  const section = document.querySelector<HTMLElement>('.js-work');
  const track = document.querySelector<HTMLElement>('.js-work-track');
  if (!section || !track) return;

  const getScroll = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

  // Item entrance
  gsap.from('.s-work__item', {
    scrollTrigger: {
      trigger: section,
      start: 'top 75%',
    },
    y: 60,
    opacity: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: 'power3.out',
  });

  if (prefersReducedMotion() || window.innerWidth < 768) {
    track.style.overflowX = 'auto';
    return;
  }

  // Longer pin runway like wodniack
  const scrollTween = gsap.to(track, {
    x: () => -getScroll(),
    ease: 'none',
    scrollTrigger: {
      trigger: section,
      start: 'top top',
      end: () => `+=${getScroll() + window.innerHeight * 1.35}`,
      scrub: 1,
      pin: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  document.querySelectorAll<HTMLElement>('.s-work__item').forEach((item) => {
    gsap.fromTo(
      item.querySelector('.s-work__media'),
      { scale: 1.12 },
      {
        scale: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: item,
          containerAnimation: scrollTween,
          start: 'left 90%',
          end: 'left 35%',
          scrub: true,
        },
      },
    );
  });
}

function initMargin() {
  const cards = document.querySelectorAll<HTMLElement>('.js-margin-card');
  if (!cards.length) return;

  cards.forEach((card, i) => {
    gsap.fromTo(
      card,
      {
        y: 100,
        rotate: i % 2 === 0 ? -14 : 14,
        opacity: 0,
      },
      {
        y: 0,
        rotate: i % 2 === 0 ? -3 : 3,
        opacity: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top 95%',
          end: 'top 55%',
          scrub: 0.7,
        },
      },
    );
  });
}

function initContact() {
  const section = document.querySelector('.s-contact');
  const go = document.querySelector<HTMLElement>('.js-contact-go');
  const reveal = document.querySelector<HTMLElement>('.js-contact-reveal');
  if (!go || !reveal) return;

  if (section && !prefersReducedMotion()) {
    gsap.from('.s-contact__go-label', {
      scrollTrigger: {
        trigger: section,
        start: 'top 70%',
        end: 'top 30%',
        scrub: 0.6,
      },
      scale: 0.6,
      opacity: 0.2,
      y: 80,
    });
  }

  const letters = reveal.querySelectorAll('.js-contact-letter');

  const enter = () => {
    gsap.to(letters, {
      y: 0,
      opacity: 1,
      duration: 0.35,
      stagger: 0.03,
      ease: 'power3.out',
    });
  };
  const leave = () => {
    gsap.to(letters, {
      y: 20,
      opacity: 0,
      duration: 0.25,
      stagger: 0.02,
      ease: 'power2.in',
    });
  };

  go.addEventListener('mouseenter', enter);
  go.addEventListener('focus', enter);
  go.addEventListener('mouseleave', leave);
  go.addEventListener('blur', leave);

  gsap.set(letters, { y: 20, opacity: 0 });
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

  const afterIntro = () => {
    initLenis();
    initHero();
    initRunways();
    initStretch();
    initSeparators();
    initAbout();
    initWork();
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
