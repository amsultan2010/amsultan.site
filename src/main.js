import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./styles.css";

gsap.registerPlugin(ScrollTrigger);

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

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
  const moveX = gsap.quickTo(cursor, "x", { duration: 0.25, ease: "power3" });
  const moveY = gsap.quickTo(cursor, "y", { duration: 0.25, ease: "power3" });

  window.addEventListener(
    "pointermove",
    ({ clientX, clientY }) => {
      cursor.classList.add("is-active");
      moveX(clientX);
      moveY(clientY);
    },
    { passive: true },
  );

  $$("a, button, .project-card, .photo").forEach((target) => {
    target.addEventListener("pointerenter", () => cursor.classList.add("is-hovering"));
    target.addEventListener("pointerleave", () => cursor.classList.remove("is-hovering"));
  });
}

function initMagneticLinks() {
  if (!window.matchMedia("(pointer: fine)").matches) return;

  $$(".magnetic").forEach((element) => {
    const moveX = gsap.quickTo(element, "x", { duration: 0.35, ease: "power3.out" });
    const moveY = gsap.quickTo(element, "y", { duration: 0.35, ease: "power3.out" });

    element.addEventListener("pointermove", (event) => {
      const bounds = element.getBoundingClientRect();
      moveX((event.clientX - bounds.left - bounds.width / 2) * 0.18);
      moveY((event.clientY - bounds.top - bounds.height / 2) * 0.18);
    });

    element.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
    });
  });
}

function initNavigation() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const target = $(link.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
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

function initMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const splitElements = $$("[data-split]");
  splitElements.forEach(splitCharacters);

  if (reduceMotion) {
    gsap.set(".scroll-progress", { scaleX: 1 });
    return;
  }

  const heroCharacters = $$(".hero-title .split-char");
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });

  intro
    .from(".site-header", { yPercent: -100, duration: 0.8 })
    .from(".hero-meta", { scaleX: 0, transformOrigin: "left", duration: 0.75 }, 0.12)
    .from(".hero-kicker", { autoAlpha: 0, y: 20, duration: 0.65 }, 0.3)
    .from(
      heroCharacters,
      {
        yPercent: 120,
        rotateX: -70,
        autoAlpha: 0,
        duration: 1.05,
        stagger: 0.035,
      },
      0.36,
    )
    .from(".hero-orbit", { scale: 0.45, rotation: -80, autoAlpha: 0, duration: 1.1 }, 0.55)
    .from(".hero-foot > *", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.82);

  gsap.to(".scroll-progress", {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.15,
    },
  });

  gsap.to(".ticker-track", {
    xPercent: -50,
    duration: 24,
    repeat: -1,
    ease: "none",
  });

  gsap.to(".hero-orbit", {
    rotation: 210,
    scale: 1.2,
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.to(".hero-title", {
    yPercent: -16,
    scale: 0.92,
    transformOrigin: "50% 0%",
    ease: "none",
    scrollTrigger: {
      trigger: ".hero",
      start: "top top",
      end: "bottom top",
      scrub: true,
    },
  });

  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    once: true,
    onEnter: (elements) =>
      gsap.from(elements, {
        y: 38,
        autoAlpha: 0,
        duration: 0.8,
        stagger: 0.08,
        ease: "power3.out",
      }),
  });

  $$("[data-reveal-lines]").forEach((element) => {
    const words = splitWords(element);
    gsap.from(words, {
      yPercent: 105,
      rotateX: -35,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.025,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
      },
    });
  });

  $$(".section-title").forEach((title) => {
    const characters = $$(".split-char", title);
    gsap.from(characters, {
      yPercent: 115,
      rotateZ: 4,
      autoAlpha: 0,
      duration: 0.75,
      stagger: 0.025,
      ease: "expo.out",
      scrollTrigger: {
        trigger: title,
        start: "top 84%",
      },
    });
  });

  gsap.from(".portrait-card", {
    clipPath: "inset(12% 10% 12% 10%)",
    autoAlpha: 0.35,
    duration: 1.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".portrait-card",
      start: "top 82%",
    },
  });

  gsap.to(".portrait-window img", {
    yPercent: -16,
    ease: "none",
    scrollTrigger: {
      trigger: ".portrait-card",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  $$(".experience-item").forEach((item, index) => {
    gsap.from(item.children, {
      x: index % 2 === 0 ? -32 : 32,
      autoAlpha: 0,
      duration: 0.72,
      stagger: 0.07,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 84%",
      },
    });
  });

  gsap.from(".stack-cloud span", {
    y: 20,
    scale: 0.9,
    autoAlpha: 0,
    duration: 0.5,
    stagger: 0.04,
    ease: "back.out(1.5)",
    scrollTrigger: {
      trigger: ".stack-cloud",
      start: "top 88%",
    },
  });

  $$(".photo").forEach((photo, index) => {
    const image = $("img", photo);
    gsap.from(photo, {
      y: index % 2 ? 90 : 50,
      rotate: index % 2 ? 2.5 : -2.5,
      autoAlpha: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: {
        trigger: photo,
        start: "top 90%",
      },
    });

    gsap.to(image, {
      yPercent: -15,
      ease: "none",
      scrollTrigger: {
        trigger: photo,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  gsap.from(".contact-link .split-char", {
    yPercent: 120,
    rotateX: -55,
    autoAlpha: 0,
    duration: 0.9,
    stagger: 0.045,
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".contact-title",
      start: "top 82%",
    },
  });

  const responsive = gsap.matchMedia();

  responsive.add("(min-width: 701px)", () => {
    const track = $(".work-track");
    const viewport = $(".work-viewport");
    if (!track || !viewport) return;

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
    const horizontal = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: viewport,
        start: "top top",
        end: () => `+=${distance() + window.innerHeight * 0.7}`,
        pin: true,
        scrub: 0.7,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    $$(".project-card").forEach((card) => {
      const visual = $(".project-visual > img, .project-poster", card);
      gsap.fromTo(
        visual,
        { scale: 1.08 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            containerAnimation: horizontal,
            start: "left right",
            end: "center center",
            scrub: true,
          },
        },
      );
    });

    const photoRail = $(".photo-rail");
    if (photoRail) {
      gsap.fromTo(
        photoRail,
        { xPercent: 4 },
        {
          xPercent: -14,
          ease: "none",
          scrollTrigger: {
            trigger: ".field-notes",
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        },
      );
    }
  });

  responsive.add("(max-width: 700px)", () => {
    $$(".project-card").forEach((card) => {
      gsap.from(card, {
        y: 50,
        autoAlpha: 0,
        duration: 0.75,
        ease: "power3.out",
        scrollTrigger: {
          trigger: card,
          start: "top 88%",
        },
      });
    });
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

initClock();
initCursor();
initMagneticLinks();
initNavigation();
initMotion();
