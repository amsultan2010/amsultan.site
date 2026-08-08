import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

let lenis;

function initSmoothScroll() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return null;

  lenis = new Lenis({
    autoRaf: false,
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.2,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

function scrollToTarget(target) {
  if (!target) return;
  if (lenis) {
    lenis.scrollTo(target, { offset: -24, duration: 1.2 });
  } else {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function splitCharacters(element) {
  if (!element || element.dataset.splitReady) return $$(".split-char", element);

  const label = element.textContent.trim();
  element.dataset.splitReady = "true";
  element.setAttribute("aria-label", label);
  element.textContent = "";

  [...label].forEach((character) => {
    const span = document.createElement("span");
    span.className = "split-char";
    span.setAttribute("aria-hidden", "true");
    span.textContent = character === " " ? "\u00a0" : character;
    element.append(span);
  });

  return $$(".split-char", element);
}

function splitWords(element) {
  if (!element || element.dataset.wordsReady) return $$(".reveal-word", element);

  const label = element.textContent.trim().replace(/\s+/g, " ");
  element.dataset.wordsReady = "true";
  element.setAttribute("aria-label", label);
  element.textContent = "";

  label.split(" ").forEach((word, index, words) => {
    const span = document.createElement("span");
    span.className = "reveal-word";
    span.setAttribute("aria-hidden", "true");
    span.style.display = "inline-block";
    span.textContent = word;
    element.append(span);
    if (index < words.length - 1) element.append(" ");
  });

  return $$(".reveal-word", element);
}

function initClock() {
  const clock = $("[data-clock]");
  if (!clock) return;

  const update = () => {
    clock.textContent = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Riyadh",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(new Date());
  };

  update();
  window.setInterval(update, 30_000);
}

function initCursor() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  const cursor = $(".cursor");
  if (!cursor) return;

  gsap.set(cursor, { xPercent: -50, yPercent: -50 });
  const moveX = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3" });
  const moveY = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3" });

  window.addEventListener(
    "pointermove",
    ({ clientX, clientY }) => {
      cursor.classList.add("is-active");
      moveX(clientX);
      moveY(clientY);
    },
    { passive: true },
  );

  $$("a, button, .work-row, .verb-strip li, .lead-item, .contact-card").forEach((target) => {
    target.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
    target.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
  });
}

function initMagnetic() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  $$(".magnetic").forEach((element) => {
    const moveX = gsap.quickTo(element, "x", { duration: 0.3, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.3, ease: "power3.out" });

    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      moveX((event.clientX - bounds.left - bounds.width / 2) * 0.28);
      moveY((event.clientY - bounds.top - bounds.height / 2) * 0.28);
    });

    element.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

function initNavigation() {
  const nav = $(".primary-nav");
  const toggle = $(".menu-toggle");
  const mq = window.matchMedia("(max-width: 960px)");

  const setMenuOpen = (open) => {
    if (!nav || !toggle) return;
    nav.classList.toggle("is-open", open);
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "close menu" : "open menu");
    document.body.classList.toggle("menu-open", open && mq.matches);
  };

  toggle?.addEventListener("click", () => {
    setMenuOpen(!nav.classList.contains("is-open"));
  });

  mq.addEventListener("change", () => setMenuOpen(false));

  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = $(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      setMenuOpen(false);
      scrollToTarget(target);
    });
  });

  $$("[data-section]").forEach((link) => {
    const section = $(`#${link.dataset.section}`);
    if (!section) return;
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onToggle: ({ isActive }) => link.classList.toggle("is-active", isActive),
    });
  });
}

function initLoader(onDone) {
  const loader = $(".loader");
  const bar = $(".loader-bar");
  const pct = $("[data-loader-pct]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!loader || reduceMotion) {
    loader?.remove();
    onDone();
    return;
  }

  document.body.classList.add("is-loading");
  const state = { value: 0 };

  gsap.to(state, {
    value: 100,
    duration: 0.95,
    ease: "power2.inOut",
    onUpdate: () => {
      const n = Math.round(state.value);
      if (bar) bar.style.width = `${n}%`;
      if (pct) pct.textContent = String(n);
    },
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -110,
        duration: 0.75,
        ease: "power4.inOut",
        onComplete: () => {
          loader.remove();
          document.body.classList.remove("is-loading");
          onDone();
        },
      });
    },
  });
}

function initHeroMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const topo = $(".hero-topo");
  const drift = $(".topo-drift");
  const layers = $$(".topo-layer");
  const shapes = $$("[data-shape]");
  if (!topo || reduceMotion) return;

  // solid contour drift, no dashoffset (that was chopping the lines)
  if (drift) {
    gsap.to(drift, {
      x: 36,
      y: -18,
      duration: 12,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  }

  layers.forEach((layer, index) => {
    gsap.to(layer, {
      x: index % 2 === 0 ? -22 : 26,
      y: index % 2 === 0 ? 14 : -16,
      duration: 8 + index * 2.5,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
    });
  });

  gsap.to(topo, {
    opacity: 0.42,
    duration: 5,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  const bounce = [
    { y: -28, x: 10, rotate: 8, duration: 2.4 },
    { y: -18, x: -12, rotate: -6, duration: 2.9 },
    { y: -34, x: 8, rotate: 4, duration: 3.2 },
    { y: -22, x: -16, rotate: -10, duration: 2.6 },
    { y: -30, x: 14, rotate: 12, duration: 2.8 },
    { y: -16, x: -8, rotate: -4, duration: 2.3 },
    { y: -26, x: 12, rotate: 16, duration: 3.0 },
    { y: -20, x: -14, rotate: -14, duration: 2.7 },
    { y: -36, x: 6, rotate: 7, duration: 3.3 },
    { y: -14, x: -10, rotate: -8, duration: 2.1 },
    { y: -24, x: 16, rotate: 11, duration: 2.85 },
    { y: -32, x: -6, rotate: -9, duration: 3.1 },
  ];

  shapes.forEach((shape, index) => {
    const motion = bounce[index % bounce.length];
    gsap.set(shape, { transformOrigin: "50% 50%" });
    gsap.to(shape, {
      y: motion.y,
      x: motion.x,
      rotate: `+=${motion.rotate}`,
      duration: motion.duration,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: index * 0.1,
    });
  });

  if (!window.matchMedia("(pointer: fine)").matches) return;

  const hero = $(".hero");
  const moveX = gsap.quickTo(topo, "x", { duration: 0.9, ease: "power3.out" });
  const moveY = gsap.quickTo(topo, "y", { duration: 0.9, ease: "power3.out" });

  hero?.addEventListener(
    "pointermove",
    (event) => {
      const rect = hero.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      moveX(nx * -30);
      moveY(ny * -20);
    },
    { passive: true },
  );
}

function initMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("[data-split]").forEach(splitCharacters);

  if (reduceMotion) {
    gsap.set(".scroll-progress", { scaleX: 1 });
    gsap.set(".portrait-mask, .cut-figure", { clipPath: "inset(0% 0% 0% 0%)" });
    return;
  }

  const heroChars = $$(".hero-title .split-char");
  const intro = gsap.timeline({
    defaults: { ease: "expo.out" },
    onComplete: () => initHeroMotion(),
  });

  intro
    .from(".site-header", { y: -72, autoAlpha: 0, duration: 0.65 }, 0)
    .from(".hero-rail", { y: -18, autoAlpha: 0, duration: 0.55 }, 0.08)
    .from(
      heroChars,
      {
        yPercent: 120,
        autoAlpha: 0,
        duration: 1,
        stagger: 0.025,
      },
      0.12,
    )
    .from(".hero-kicker, .hero-orbit span", { y: 16, autoAlpha: 0, duration: 0.5, stagger: 0.04 }, 0.4)
    .from(".hero-foot > *", { y: 24, autoAlpha: 0, duration: 0.55, stagger: 0.08 }, 0.48)
    .from(".hero-bg", { autoAlpha: 0, duration: 1.05 }, 0.12);

  gsap.to(".scroll-progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.2,
    },
  });

  gsap.to(".marquee-track", {
    xPercent: -50,
    duration: 24,
    repeat: -1,
    ease: "none",
  });

  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: 0.6,
      },
    })
    .to(".hero-title", { yPercent: -12, opacity: 0.35 }, 0)
    .to(".hero-rail, .hero-foot, .hero-orbit, .hero-kicker", { opacity: 0, y: -24 }, 0)
    .to(".hero-bg", { yPercent: 18, opacity: 0.35 }, 0);

  $$("[data-reveal-lines]").forEach((element) => {
    const words = splitWords(element);
    gsap.from(words, {
      yPercent: 100,
      autoAlpha: 0,
      duration: 0.75,
      stagger: 0.05,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        toggleActions: "play none none none",
      },
    });
  });

  gsap.from(".about-meta, .about-bio, .about-actions", {
    y: 28,
    autoAlpha: 0,
    duration: 0.65,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about-copy",
      start: "top 80%",
      toggleActions: "play none none none",
    },
  });

  gsap.fromTo(
    ".portrait-mask",
    { clipPath: "inset(16% 12% 16% 12%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      scrollTrigger: {
        trigger: ".about-portrait",
        start: "top 80%",
        end: "top 45%",
        scrub: 0.5,
      },
    },
  );

  gsap.to(".portrait-mask img", {
    yPercent: -10,
    ease: "none",
    scrollTrigger: {
      trigger: ".about-portrait",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.5,
    },
  });

  gsap.from(".about-portrait figcaption", {
    y: 16,
    autoAlpha: 0,
    duration: 0.5,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about-portrait",
      start: "top 70%",
      toggleActions: "play none none none",
    },
  });

  gsap.from(".verb-strip li", {
    y: 28,
    autoAlpha: 0,
    duration: 0.55,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".verb-strip",
      start: "top 88%",
      toggleActions: "play none none none",
    },
  });

  $$(".section-display").forEach((title) => {
    const chars = $$(".split-char", title);
    if (!chars.length) return;
    gsap.from(chars, {
      yPercent: 110,
      autoAlpha: 0,
      duration: 0.7,
      stagger: 0.022,
      ease: "power3.out",
      scrollTrigger: {
        trigger: title,
        start: "top 88%",
        toggleActions: "play none none none",
      },
    });
  });

  gsap.from(".work-row", {
    y: 28,
    autoAlpha: 0,
    duration: 0.55,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".work-list",
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });

  $$(".lead-item").forEach((item) => {
    gsap.from(item, {
      y: 36,
      autoAlpha: 0,
      duration: 0.65,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 90%",
        toggleActions: "play none none none",
      },
    });

    item.addEventListener("pointerenter", () => {
      gsap.to($(".lead-num", item), { scale: 1.12, duration: 0.3, ease: "power2.out" });
    });
    item.addEventListener("pointerleave", () => {
      gsap.to($(".lead-num", item), { scale: 1, duration: 0.35, ease: "power2.out" });
    });
  });

  gsap.from(".stack-row span", {
    y: 18,
    autoAlpha: 0,
    duration: 0.4,
    stagger: 0.03,
    ease: "power2.out",
    scrollTrigger: {
      trigger: ".stack-row",
      start: "top 92%",
      toggleActions: "play none none none",
    },
  });

  $$(".cut").forEach((cut) => {
    gsap.from($(".cut-copy", cut).children, {
      y: 32,
      autoAlpha: 0,
      duration: 0.6,
      stagger: 0.08,
      ease: "power3.out",
      scrollTrigger: {
        trigger: cut,
        start: "top 78%",
        toggleActions: "play none none none",
      },
    });

    gsap.fromTo(
      $(".cut-figure", cut),
      { clipPath: "inset(0% 0% 100% 0%)" },
      {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: cut,
          start: "top 78%",
          toggleActions: "play none none none",
        },
      },
    );

    gsap.to($(".cut-figure img", cut), {
      yPercent: -6,
      ease: "none",
      scrollTrigger: {
        trigger: cut,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });
  });

  gsap.from(".contact-link .split-char", {
    yPercent: 110,
    autoAlpha: 0,
    duration: 0.8,
    stagger: 0.035,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".contact-title",
      start: "top 85%",
      toggleActions: "play none none none",
    },
  });

  gsap.from(".contact-top > *, .contact-pitch", {
    y: 28,
    autoAlpha: 0,
    duration: 0.6,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".contact-frame",
      start: "top 82%",
      toggleActions: "play none none none",
    },
  });

  // cards are magnetic, so gsap owns their x/y — fade only, never tween y here
  gsap.from(".contact-card", {
    autoAlpha: 0,
    duration: 0.6,
    stagger: 0.07,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".contact-frame",
      start: "top 82%",
      toggleActions: "play none none none",
    },
  });

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
    lenis?.resize();
  });
}

initSmoothScroll();
initClock();
initCursor();
initMagnetic();
initNavigation();
initLoader(() => {
  initMotion();
  requestAnimationFrame(() => ScrollTrigger.refresh());
});
