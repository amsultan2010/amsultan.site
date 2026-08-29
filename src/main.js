import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, ScrambleTextPlugin, CustomEase);
ScrollTrigger.config({ ignoreMobileResize: true });

// two signature eases for the whole site, so timing reads as one system
CustomEase.create("out", "0.16, 1, 0.3, 1");
CustomEase.create("inOut", "0.65, 0, 0.35, 1");

const D = { fast: 0.35, base: 0.7, slow: 1.1, epic: 1.6 };
const E = { out: "out", inOut: "inOut" };

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

  const label = element.textContent.trim().replace(/\s+/g, " ");
  element.dataset.splitReady = "true";
  element.setAttribute("aria-label", label);
  element.textContent = "";

  // chars live inside a per-word wrapper, otherwise every inline-block char is a
  // line-break opportunity and words split mid-letter on narrow screens
  label.split(" ").forEach((word, index, words) => {
    const wordSpan = document.createElement("span");
    wordSpan.className = "split-word";
    wordSpan.setAttribute("aria-hidden", "true");

    [...word].forEach((character) => {
      const span = document.createElement("span");
      span.className = "split-char";
      span.textContent = character;
      wordSpan.append(span);
    });

    element.append(wordSpan);
    if (index < words.length - 1) element.append(" ");
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

  const label = $("span", cursor);

  $$("a, button, .work-row, .verb-strip li, .lead-item, .contact-card").forEach((target) => {
    const text = target.dataset.cursor || "";
    target.addEventListener("pointerenter", () => {
      cursor.classList.add("is-hovering");
      if (!text || !label) return;
      label.textContent = text;
      cursor.classList.add("is-labelled");
    });
    target.addEventListener("pointerleave", () => {
      cursor.classList.remove("is-hovering", "is-labelled");
      if (label) label.textContent = "";
    });
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

function initWorkRowHover() {
  if (!finePointer() || reducedMotion()) return;

  $$(".work-row").forEach((row) => {
    const index = $(".work-index", row);
    const icon = $(".work-row-icon", row);
    const name = $(".work-name", row);
    const digits = index?.textContent ?? "";

    // choreographed, so it cannot be a css transition: three parts on three offsets
    const tl = gsap
      .timeline({ paused: true, defaults: { duration: D.fast, ease: E.out } })
      .to(index, { scale: 1.35, transformOrigin: "left center" }, 0)
      .to(icon, { rotate: -7, scale: 1.08 }, 0.03)
      .to(name, { x: 14 }, 0.06);

    row.addEventListener("pointerenter", () => {
      tl.play();
      if (digits) {
        gsap.to(index, {
          duration: 0.5,
          ease: "none",
          scrambleText: { text: digits, chars: "0123456789", speed: 0.8 },
        });
      }
    });
    row.addEventListener("pointerleave", () => tl.reverse());
  });
}

function initNavScramble() {
  if (!finePointer() || reducedMotion()) return;

  $$(".primary-nav a, .lead-item h3").forEach((element) => {
    const original = element.textContent;
    const host = element.closest(".lead-item") || element;
    host.addEventListener("pointerenter", () => {
      gsap.to(element, {
        duration: 0.55,
        ease: "none",
        scrambleText: { text: original, chars: "lowerCase", speed: 0.7 },
      });
    });
  });
}

function initTilt() {
  if (!finePointer() || reducedMotion()) return;

  $$(".contact-card").forEach((card) => {
    const tiltX = gsap.quickTo(card, "rotationX", { duration: 0.5, ease: "power3" });
    const tiltY = gsap.quickTo(card, "rotationY", { duration: 0.5, ease: "power3" });

    card.addEventListener("pointermove", (event) => {
      const bounds = card.getBoundingClientRect();
      tiltX(((event.clientY - bounds.top) / bounds.height - 0.5) * -12);
      tiltY(((event.clientX - bounds.left) / bounds.width - 0.5) * 14);
    });
    card.addEventListener("pointerleave", () => {
      tiltX(0);
      tiltY(0);
    });
  });
}

function initCounters() {
  $$("[data-count]").forEach((element) => {
    const end = Number(element.dataset.count);
    if (!Number.isFinite(end)) return;

    const format = (n) => n.toLocaleString("en-US");

    if (reducedMotion()) {
      element.textContent = format(end);
      return;
    }

    // text stays at its final value until the tween starts, so SplitText measures
    // real line widths on the paragraphs these numbers sit inside
    const state = { value: 0 };
    gsap.to(state, {
      value: end,
      onStart: () => {
        element.textContent = "0";
      },
      duration: D.epic,
      ease: E.out,
      snap: { value: 1 },
      onUpdate: () => {
        element.textContent = format(Math.round(state.value));
      },
      scrollTrigger: { trigger: element, start: "top 92%", once: true },
    });
  });
}

// scroll velocity feeds two things: a slight skew on list rows, and the marquee
// speeding up and reversing with the scroll direction
function initScrollVelocity(marqueeTween) {
  if (reducedMotion()) return;

  const rows = $$(".work-row, .lead-item");
  const setSkew = gsap.quickSetter(rows, "skewY", "deg");
  const clamp = gsap.utils.clamp(-4, 4);
  const proxy = { skew: 0 };

  gsap.set(rows, { transformOrigin: "right center", force3D: true });

  ScrollTrigger.create({
    onUpdate: (self) => {
      const velocity = self.getVelocity();

      if (marqueeTween) {
        const speed = gsap.utils.clamp(0.35, 4, Math.abs(velocity) / 900 + 0.6);
        marqueeTween.timeScale(self.direction === -1 ? -speed : speed);
      }

      const skew = clamp(velocity / -520);
      if (Math.abs(skew) <= Math.abs(proxy.skew)) return;
      proxy.skew = skew;
      setSkew(skew);
      gsap.to(proxy, {
        skew: 0,
        duration: 0.8,
        ease: "power3",
        overwrite: true,
        onUpdate: () => setSkew(proxy.skew),
      });
    },
  });
}

// masked line reveal, the default for body copy: lines rise out of an overflow
// clip instead of every paragraph fading up the same way
function revealLines(selector, start = "top 85%") {
  $$(selector).forEach((element) => {
    SplitText.create(element, {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      linesClass: "line-mask",
      onSplit(self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: D.slow,
          stagger: 0.07,
          ease: E.out,
          scrollTrigger: { trigger: element, start, once: true },
        });
      },
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

  gsap.to(".hero-orbit span", {
    y: -5,
    duration: 2.6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    stagger: { each: 0.28, from: "center" },
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
    // clearProps so gsap doesn't leave the desktop translateX(-50%) inline and
    // break the header's mobile positioning after a resize or rotate
    .from(".site-header", { y: -72, autoAlpha: 0, duration: 0.65, clearProps: "transform" }, 0)
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
    .from(".hero-bg", { autoAlpha: 0, duration: 1.05 }, 0.12)
    .from(
      ".hero-topo path",
      { drawSVG: "0% 0%", duration: 1.3, stagger: 0.04, ease: "power2.out" },
      0.2,
    )
    .from(
      "[data-shape]",
      { scale: 0, autoAlpha: 0, duration: 0.7, stagger: { each: 0.035, from: "random" } },
      0.35,
    );

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

  const marqueeTween = gsap.to(".marquee-track", {
    xPercent: -50,
    duration: 24,
    repeat: -1,
    ease: "none",
  });

  initScrollVelocity(marqueeTween);

  // explicit fromTo + immediateRender:false, otherwise this scrub timeline samples
  // its start values while the intro `from` tweens still hold them at 0 and the
  // hero bg/rail stay invisible until a reload happens to win the race
  const heroExit = gsap.matchMedia();

  // desktop gets the one pinned set piece on the page: the two title lines pull
  // apart in opposite directions while the field behind them pushes forward
  heroExit.add("(min-width: 900px)", () => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "+=60%",
          pin: true,
          anticipatePin: 1,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      })
      .fromTo(
        ".hero-line-fill",
        { xPercent: 0, opacity: 1 },
        { xPercent: -13, opacity: 0.12, immediateRender: false },
        0,
      )
      .fromTo(
        ".hero-line-stroke",
        { xPercent: 0, opacity: 1 },
        { xPercent: 15, opacity: 0.12, immediateRender: false },
        0,
      )
      .fromTo(
        ".hero-rail, .hero-foot, .hero-orbit, .hero-kicker",
        { opacity: 1, y: 0 },
        { opacity: 0, y: -28, immediateRender: false },
        0,
      )
      .fromTo(
        ".hero-bg",
        { scale: 1, opacity: 1 },
        { scale: 1.22, opacity: 0.22, immediateRender: false },
        0,
      )
      .fromTo(
        ".hero-shapes",
        { scale: 1, opacity: 1 },
        { scale: 1.45, opacity: 0, immediateRender: false },
        0,
      );
  });

  heroExit.add("(max-width: 899px)", () => {
    gsap
      .timeline({
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
        },
      })
      .fromTo(
        ".hero-title",
        { yPercent: 0, opacity: 1 },
        { yPercent: -12, opacity: 0.35, immediateRender: false },
        0,
      )
      .fromTo(
        ".hero-rail, .hero-foot, .hero-orbit, .hero-kicker",
        { opacity: 1, y: 0 },
        { opacity: 0, y: -24, immediateRender: false },
        0,
      )
      .fromTo(
        ".hero-bg",
        { yPercent: 0, opacity: 1 },
        { yPercent: 18, opacity: 0.35, immediateRender: false },
        0,
      );
  });

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

  gsap.from(".about-meta, .about-actions", {
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
    const heading = $("h3", item);
    const chars = heading ? splitCharacters(heading) : [];

    gsap
      .timeline({
        defaults: { ease: E.out },
        scrollTrigger: {
          trigger: item,
          start: "top 88%",
          once: true,
        },
      })
      .from($(".lead-num", item), { yPercent: 70, autoAlpha: 0, duration: D.base }, 0)
      .from($(".lead-body .mono", item), { y: 18, autoAlpha: 0, duration: D.fast }, 0.05)
      .from(chars, { yPercent: 110, autoAlpha: 0, duration: D.base, stagger: 0.02 }, 0.1);

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

  gsap.from(".contact-top > *", {
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

  // cards are magnetic, so gsap owns their x/y: fade only, never tween y here
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

  revealLines(".about-bio", "top 82%");
  revealLines(".contact-pitch", "top 84%");
  revealLines(".lead-body p.serif", "top 88%");
  revealLines(".verb-strip em", "top 90%");

  // three more parallax rates so depth reads as depth, not as one shared drift
  gsap.set(".portrait-mask img", { scale: 1.14 });
  gsap.to(".portrait-mask img", {
    yPercent: -7,
    ease: "none",
    scrollTrigger: {
      trigger: ".about-portrait",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.7,
    },
  });

  gsap.to(".about-portrait figcaption", {
    y: -34,
    ease: "none",
    scrollTrigger: {
      trigger: ".about-portrait",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
    },
  });

  gsap.to(".stack-row span", {
    y: (index) => -10 - (index % 3) * 9,
    ease: "none",
    scrollTrigger: {
      trigger: ".stack",
      start: "top bottom",
      end: "bottom top",
      scrub: 0.9,
    },
  });

  // ambient: the status dot keeps breathing long after every entrance is done
  gsap.to(".status-dot, .hero-rail-live i", {
    scale: 1.5,
    opacity: 0.45,
    duration: 1.4,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  document.fonts.ready.then(() => {
    ScrollTrigger.refresh();
    lenis?.resize();
  });

  // lazy images below the fold land long after fonts do and shift every trigger
  // position under them, which is most of the page on a phone
  window.addEventListener("load", () => {
    ScrollTrigger.refresh();
    lenis?.resize();
  });
}

initSmoothScroll();
initClock();
initCursor();
initMagnetic();
initTilt();
initWorkRowHover();
initNavScramble();
initNavigation();
initCounters();
initLoader(() => {
  initMotion();
  requestAnimationFrame(() => ScrollTrigger.refresh());
});
