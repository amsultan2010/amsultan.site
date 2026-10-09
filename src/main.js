import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { ScrambleTextPlugin } from "gsap/ScrambleTextPlugin";
import { CustomEase } from "gsap/CustomEase";
import { inject } from "@vercel/analytics";
import { initSmoothScroll, lenis } from "./scroll.js";
import "./styles.css";
import { initPalette } from "./palette.js";
import { initRail } from "./rail.js";
import { initVisits } from "./visits.js";

inject({ mode: import.meta.env.DEV ? "development" : "production" });

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
      .to(index, { scale: 1.3, transformOrigin: "left center" }, 0)
      .to(icon, { rotate: -7, scale: 1.08 }, 0.03)
      .to(name, { x: 8 }, 0.06);

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

function initTagPreview() {
  if (!finePointer() || reducedMotion()) return;

  const chips = $$(".tag[data-tag]");
  if (!chips.length) return;

  // one card for every chip, so hovering never allocates dom mid-motion
  const card = document.createElement("div");
  card.className = "tag-preview";
  card.setAttribute("aria-hidden", "true");
  const frame = document.createElement("div");
  frame.className = "tag-preview-frame";
  const caption = document.createElement("p");
  caption.className = "tag-preview-caption mono";
  card.append(frame, caption);
  document.body.appendChild(card);

  const W = 300;
  const H = 268;
  const images = new Map();

  const moveX = gsap.quickTo(card, "x", { duration: 0.45, ease: "power3.out" });
  const moveY = gsap.quickTo(card, "y", { duration: 0.45, ease: "power3.out" });

  const place = (event, immediate) => {
    const x = gsap.utils.clamp(12, window.innerWidth - W - 12, event.clientX + 22);
    const y = gsap.utils.clamp(12, window.innerHeight - H - 12, event.clientY - H - 18);
    if (immediate) gsap.set(card, { x, y });
    moveX(x);
    moveY(y);
  };

  // travel lives on yPercent because quickTo already owns y
  const reveal = gsap
    .timeline({
      paused: true,
      defaults: { duration: D.fast, ease: E.out },
      onStart: () => gsap.set(card, { visibility: "visible" }),
      onReverseComplete: () => gsap.set(card, { visibility: "hidden" }),
    })
    .fromTo(
      card,
      { clipPath: "inset(0% 0% 100% 0%)", yPercent: 6 },
      { clipPath: "inset(0% 0% 0% 0%)", yPercent: 0 }
    );

  chips.forEach((chip) => {
    const name = chip.dataset.tag;

    chip.addEventListener("pointerenter", (event) => {
      let img = images.get(name);
      if (!img) {
        img = new Image();
        img.src = `/images/tags/${name}.jpg`;
        img.alt = "";
        img.width = 640;
        img.height = 480;
        images.set(name, img);
      }
      frame.replaceChildren(img);
      caption.textContent = name;
      place(event, true);
      reveal.play();
    });

    chip.addEventListener("pointermove", (event) => place(event, false));
    chip.addEventListener("pointerleave", () => reveal.reverse());
  });
}

// the closing cells and the right-now rows share one move: the arrow leaves
// through one side of its window and comes back in through the other. that is
// two tweens with a jump between them, which a css transition cannot express
function initArrowSwap() {
  if (!finePointer() || reducedMotion()) return;

  const travel = { down: [0, 1], out: [1, -1] };

  $$(".arrow-swap").forEach((frame) => {
    const host = frame.closest("a");
    const glyph = $("span", frame);
    if (!host || !glyph) return;

    const [dx, dy] = travel[frame.dataset.dir] ?? travel.out;
    const tl = gsap
      .timeline({ paused: true })
      .to(glyph, { xPercent: dx * 110, yPercent: dy * 110, duration: 0.2, ease: "power2.in" })
      .set(glyph, { xPercent: dx * -110, yPercent: dy * -110 })
      .to(glyph, { xPercent: 0, yPercent: 0, duration: D.fast, ease: E.out });

    host.addEventListener("pointerenter", () => tl.restart());
  });
}

function initActionFill() {
  if (!finePointer() || reducedMotion()) return;

  $$(".action-cell").forEach((cell) => {
    const fill = $(".action-fill", cell);
    if (!fill) return;

    // from here the script owns the layer, so the css fallback stands down
    cell.classList.add("is-wired");
    gsap.set(fill, { y: 0, yPercent: 101 });

    const tl = gsap
      .timeline({ paused: true })
      .to(fill, { yPercent: 0, duration: 0.45, ease: E.inOut });

    cell.addEventListener("pointerenter", () => tl.play());
    cell.addEventListener("pointerleave", () => tl.reverse());
    // the text colour flips on focus in css, so the layer has to follow it or a
    // keyboard user gets ink on ink
    cell.addEventListener("focus", () => tl.play());
    cell.addEventListener("blur", () => tl.reverse());
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

    const pad = Number(element.dataset.pad) || 0;
    const format = (n) => n.toLocaleString("en-US").padStart(pad, "0");

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

// the marquee speeds up and reverses with the scroll direction. the rows used
// to skew with it too, which read as the whole page wobbling, so they don't
function initScrollVelocity(marqueeTween) {
  if (reducedMotion() || !marqueeTween) return;

  ScrollTrigger.create({
    onUpdate: (self) => {
      const speed = gsap.utils.clamp(0.35, 4, Math.abs(self.getVelocity()) / 900 + 0.6);
      marqueeTween.timeScale(self.direction === -1 ? -speed : speed);
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

  toggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    setMenuOpen(!nav.classList.contains("is-open"));
  });

  mq.addEventListener("change", () => setMenuOpen(false));

  document.addEventListener("click", (event) => {
    if (!nav?.classList.contains("is-open")) return;
    if (nav.contains(event.target) || toggle?.contains(event.target)) return;
    setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuOpen(false);
  });

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

  // the loader is an opening, not a toll: once per session, never on the way
  // back from a link. storage can throw in a private window, so it is guarded
  let seen = false;
  try {
    seen = sessionStorage.getItem("loader-seen") === "1";
    sessionStorage.setItem("loader-seen", "1");
  } catch {
    seen = false;
  }

  if (!loader || reduceMotion || seen) {
    loader?.remove();
    onDone();
    return;
  }

  document.body.classList.add("is-loading");
  const state = { value: 0 };

  gsap.to(state, {
    value: 100,
    duration: 0.8,
    ease: "power2.inOut",
    onUpdate: () => {
      const n = Math.round(state.value);
      if (bar) bar.style.width = `${n}%`;
      if (pct) pct.textContent = String(n);
    },
    onComplete: () => {
      gsap.to(loader, {
        yPercent: -110,
        duration: 0.65,
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

  // the strip is one joined bar, so it breathes as one piece. yPercent, because
  // the hero exit scrub already owns y on this element
  gsap.to(".hero-orbit", {
    yPercent: -12,
    duration: 2.6,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
  });

  // the hero keeps roughly twenty looping tweens alive. once it is scrolled past
  // they are still writing transforms every frame for nothing, which is most of
  // the jank further down the page
  const hero = $(".hero");
  if (hero) {
    const ambient = [drift, topo, ...layers, ...shapes].filter(Boolean);
    ScrollTrigger.create({
      trigger: hero,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => {
        gsap
          .getTweensOf(ambient)
          .filter((tween) => tween.repeat() === -1)
          .forEach((tween) => (self.isActive ? tween.play() : tween.pause()));
      },
    });
  }

  if (!window.matchMedia("(pointer: fine)").matches) return;

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
    gsap.set(".portrait-mask", { clipPath: "inset(0% 0% 0% 0%)" });
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

  // same treatment for the marquee: it only earns its frame cost while visible
  const marqueeEl = $(".marquee");
  if (marqueeEl && marqueeTween) {
    ScrollTrigger.create({
      trigger: marqueeEl,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? marqueeTween.play() : marqueeTween.pause()),
    });
  }

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

  // scrubbed drifts differ by width, and the wide ones do not exist on a phone
  const drift = gsap.matchMedia();

  // about: the statement is display type, so it gets the display verb. letters
  // rise out of a mask one line after the next, then each tag stamps on
  const statementLines = $$(".about-line");
  if (statementLines.length) {
    const statement = gsap.timeline({
      defaults: { ease: E.out },
      scrollTrigger: { trigger: ".about-statement", start: "top 82%", once: true },
    });

    statementLines.forEach((line, index) => {
      const at = index * 0.16;
      statement
        .from($$(".split-char", line), { yPercent: 118, duration: D.slow, stagger: 0.016 }, at)
        .from(
          $(".about-line-tag", line),
          { scale: 0, rotate: -16, duration: D.base, ease: "back.out(1.7)" },
          at + 0.5,
        );
    });

    // and they keep moving after they land: each line slides at its own rate
    // while the band crosses the viewport, pulling the staircase toward the
    // middle. the outer two only ever move inward, so nothing leaves the gutter
    drift.add("(min-width: 821px)", () => {
      [
        [0, 9],
        [4, -4],
        [0, -9],
      ].forEach(([from, to], index) => {
        if (!statementLines[index]) return;
        gsap.fromTo(
          statementLines[index],
          { xPercent: from },
          {
            xPercent: to,
            ease: "none",
            scrollTrigger: {
              trigger: ".about-statement",
              start: "top bottom",
              end: "bottom top",
              scrub: 0.8,
            },
          },
        );
      });
    });
  }

  // the four claims are ruled cells, so they arrive as cells: each one wipes in
  // from its leading edge and brings its rule with it. batched, so a phone that
  // only has two of them on screen only plays two
  gsap.set(".about-points li", { clipPath: "inset(0% 100% 0% 0%)" });
  ScrollTrigger.batch(".about-points li", {
    start: "top 86%",
    once: true,
    onEnter: (cells) =>
      gsap.to(cells, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: D.slow,
        stagger: 0.12,
        ease: E.inOut,
        clearProps: "clipPath",
      }),
  });

  // the punchline is laid down like a strip of tape, then the one reversed
  // phrase is stamped onto it from above
  const closer = $(".about-closer");
  if (closer) {
    const mark = $(".about-closer-mark", closer);

    gsap
      .timeline({ scrollTrigger: { trigger: closer, start: "top 84%", once: true } })
      .fromTo(
        ".about-closer-text",
        { clipPath: "inset(-15% 100% -15% -3%)" },
        {
          clipPath: "inset(-15% -3% -15% -3%)",
          duration: D.epic,
          ease: E.inOut,
          clearProps: "clipPath",
        },
        0,
      )
      .from(".about-closer em", { scale: 1.6, autoAlpha: 0, duration: D.fast, ease: "power4.in" }, 0.8)
      .from(mark, { scale: 0, duration: D.slow, ease: E.out }, 0.3);

    // the mark turns with the scroll, and its arms keep turning on their own
    // for as long as the band is on screen
    gsap.to(mark, {
      rotate: 200,
      ease: "none",
      scrollTrigger: { trigger: closer, start: "top bottom", end: "bottom top", scrub: 1 },
    });

    const spin = gsap.to($("g", mark), {
      rotate: 360,
      svgOrigin: "50 50",
      duration: 26,
      repeat: -1,
      ease: "none",
    });
    const spinView = ScrollTrigger.create({
      trigger: closer,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? spin.play() : spin.pause()),
    });
    if (!spinView.isActive) spin.pause();
  }

  // the spec sheet: both labels rise out of their own bar, the rows unroll
  // downward, and each fact decodes into place as its row opens
  gsap.from(".sheet-label > *", {
    yPercent: 140,
    duration: D.base,
    stagger: 0.06,
    ease: E.out,
    scrollTrigger: { trigger: ".about-sheet", start: "top 88%", once: true },
  });

  gsap.set(".about-facts div, .verb-strip li", { clipPath: "inset(0% 0% 100% 0%)" });
  ScrollTrigger.batch(".about-facts div, .verb-strip li", {
    start: "top 92%",
    once: true,
    onEnter: (rows) =>
      gsap.to(rows, {
        clipPath: "inset(0% 0% 0% 0%)",
        duration: D.base,
        stagger: 0.07,
        ease: E.out,
        clearProps: "clipPath",
      }),
  });

  $$(".about-facts dd").forEach((fact, index) => {
    gsap.to(fact, {
      duration: D.slow,
      delay: 0.15 + index * 0.12,
      ease: "none",
      scrambleText: { text: fact.textContent, chars: "lowerCase", speed: 0.5 },
      scrollTrigger: { trigger: fact, start: "top 92%", once: true },
    });
  });

  // the two closing cells come up from the floor of the section
  gsap.fromTo(
    ".action-cell",
    { clipPath: "inset(100% 0% 0% 0%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      duration: D.slow,
      stagger: 0.1,
      ease: E.out,
      clearProps: "clipPath",
      scrollTrigger: { trigger: ".about-actions", start: "top 94%", once: true },
    },
  );

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

  // section heads: the word rises out of its own bar, its echoes slide in from
  // the edge they run off, and the count cell opens from that same edge
  $$(".section-head").forEach((head) => {
    gsap
      .timeline({
        defaults: { ease: E.out },
        scrollTrigger: { trigger: head, start: "top 88%", once: true },
      })
      .from($$(".section-display .split-char", head), { yPercent: 125, duration: D.slow, stagger: 0.03 }, 0)
      .from($$(".section-echo i", head), { xPercent: 70, autoAlpha: 0, duration: D.slow, stagger: 0.06 }, 0.12)
      .fromTo(
        $(".section-meta", head),
        { clipPath: "inset(0% 0% 0% 100%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: D.base, ease: E.inOut, clearProps: "clipPath" },
        0.2,
      );
  });

  // the echo is hidden on a phone, so its scrub only exists where it shows. each
  // head slides at a different rate, which is what makes it read as depth. the
  // run moves away from the word, so a gap opens rather than a letter being cut
  drift.add("(min-width: 701px)", () => {
    $$(".section-echo-run").forEach((run, index) => {
      gsap.fromTo(
        run,
        { xPercent: 0 },
        {
          xPercent: [9, 15, 6][index % 3],
          ease: "none",
          scrollTrigger: {
            trigger: run,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5 + (index % 3) * 0.25,
          },
        },
      );
    });
  });

  // each built row is staged on its own trigger. hover owns the index scale,
  // the mark's rotation and the name's x, so the entrance stays off all three:
  // a hover that lands mid-entrance would otherwise record the wrong rest state
  $$(".work-row").forEach((row) => {
    const shot = $(".work-row-shot", row);

    gsap
      .timeline({
        defaults: { ease: E.out },
        scrollTrigger: { trigger: row, start: "top 84%", once: true },
      })
      .from($(".work-index", row), { yPercent: 120, autoAlpha: 0, duration: D.base }, 0)
      .from($(".work-row-icon", row), { y: 22, autoAlpha: 0, duration: D.base }, 0.05)
      .fromTo(
        $(".work-name", row),
        { clipPath: "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: D.slow, ease: E.inOut, clearProps: "clipPath" },
        0.08,
      )
      .from($$(".work-points li", row), { x: -22, autoAlpha: 0, duration: D.base, stagger: 0.07 }, 0.2)
      .from($$(".work-meta, .work-go", row), { y: 12, autoAlpha: 0, duration: D.fast, stagger: 0.06 }, 0.4);

    // the shot has its own trigger because on a phone it sits a screen below
    // the top of its row. the frame unmasks from its top edge while the image
    // inside settles back from overscale. the end inset is negative so the hard
    // shadow is already showing when the clip is dropped
    if (shot) {
      gsap
        .timeline({
          defaults: { duration: D.epic, ease: E.out },
          scrollTrigger: { trigger: shot, start: "top 88%", once: true },
        })
        .fromTo(
          shot,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(-8% -8% -10% -8%)", clearProps: "clipPath" },
          0,
        )
        .from($("img", shot), { scale: 1.3, clearProps: "transform" }, 0);
    }
  });

  $$(".lead-item").forEach((item) => {
    const heading = $("h3", item);
    const chars = heading ? splitCharacters(heading) : [];

    const mark = $(".zc-mark", item);
    const reveal = gsap
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
      .from(chars, { yPercent: 110, autoAlpha: 0, duration: D.base, stagger: 0.02 }, 0.1)
      .from($$(".lead-points li, .zc-cta", item), {
        y: 16,
        autoAlpha: 0,
        duration: D.fast,
        stagger: 0.06,
      }, 0.25);

    // only one row carries a mark, and an empty target makes gsap warn
    if (mark) {
      reveal.from(mark, { scale: 0.7, rotate: -12, autoAlpha: 0, duration: D.base }, 0.08);
    }

    item.addEventListener("pointerenter", () => {
      gsap.to($(".lead-num", item), { scale: 1.12, duration: 0.3, ease: "power2.out" });
    });
    item.addEventListener("pointerleave", () => {
      gsap.to($(".lead-num", item), { scale: 1, duration: 0.35, ease: "power2.out" });
    });
  });

  // fluent and learning: the label rises in its bar, then every word rises out
  // of its own mask, the second panel a beat behind the first
  $$(".stack-panel").forEach((panel, index) => {
    gsap
      .timeline({
        defaults: { ease: E.out },
        scrollTrigger: { trigger: panel, start: "top 90%", once: true },
      })
      .from($$(".stack-label > *", panel), { yPercent: 140, duration: D.base, stagger: 0.06 }, index * 0.1)
      .from($$(".stack-list li > *", panel), { yPercent: 125, duration: D.slow, stagger: 0.05 }, index * 0.1 + 0.12);
  });

  $$(".record-cells").forEach((cells) => {
    const marks = $$(".record-mark", cells);
    const reveal = gsap
      .timeline({
        defaults: { ease: E.out },
        scrollTrigger: {
          trigger: cells,
          start: "top 88%",
          once: true,
        },
      })
      .from($$(".record-cell > *", cells), { y: 18, autoAlpha: 0, duration: D.fast, stagger: 0.04 }, 0);

    // the awards row leads with a number, not a mark. clearProps hands transform
    // back to css, which owns the hover lift
    if (marks.length) {
      reveal.from(
        marks,
        {
          scale: 0.6,
          rotate: -10,
          duration: D.base,
          stagger: 0.05,
          ease: "back.out(1.7)",
          clearProps: "transform",
        },
        0.05,
      );
    }
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

  revealLines(".contact-pitch", "top 84%");
  revealLines(".lead-lede", "top 88%");
  revealLines(".verb-strip em", "top 90%");

  // two more parallax rates so depth reads as depth, not as one shared drift
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

  // ambient: the status dot keeps breathing long after every entrance is done
  gsap.to(".status-dot, .hero-rail-live i, .stack-pulse", {
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
initPalette();
initRail();
initVisits();
initCursor();
initMagnetic();
initTilt();
initWorkRowHover();
initTagPreview();
initArrowSwap();
initActionFill();
initNavScramble();
initNavigation();
initCounters();
initLoader(() => {
  initMotion();
  requestAnimationFrame(() => ScrollTrigger.refresh());
});
