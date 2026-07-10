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
  $$("[data-split]").forEach(splitCharacters);

  if (reduceMotion) {
    gsap.set(".scroll-progress", { scaleX: 1 });
    return;
  }

  const heroCharacters = $$(".hero-title .split-char");
  const intro = gsap.timeline({ defaults: { ease: "expo.out" } });

  intro
    .from(".site-header", { yPercent: -100, duration: 0.8 })
    .from(".hero-meta", { scaleX: 0, transformOrigin: "left", duration: 0.75 }, 0.12)
    .from(
      heroCharacters,
      {
        yPercent: 120,
        rotateX: -70,
        autoAlpha: 0,
        duration: 1.05,
        stagger: 0.035,
      },
      0.28,
    )
    .from(".hero-orbit", { scale: 0.45, rotation: -80, autoAlpha: 0, duration: 1.1 }, 0.5)
    .from(".hero-foot > *", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.75);

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

  gsap.to(".grain", {
    opacity: 0.09,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
    },
  });

  // Hero exit scrub
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".hero",
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    })
    .to(".hero-title", { yPercent: -22, scale: 0.88, transformOrigin: "50% 0%" }, 0)
    .to(".hero-orbit", { rotation: 240, scale: 1.35 }, 0)
    .to(".hero-meta", { y: -40, autoAlpha: 0 }, 0)
    .to(".hero-foot", { y: -50, autoAlpha: 0 }, 0);

  // Runway stretch words
  $$("[data-runway]").forEach((text) => {
    const runway = text.closest(".runway");
    gsap.fromTo(
      text,
      { scaleX: 0.08, scaleY: 1.45, opacity: 0.2, skewX: 12 },
      {
        scaleX: 1,
        scaleY: 1,
        opacity: 1,
        skewX: 0,
        ease: "none",
        scrollTrigger: {
          trigger: runway,
          start: "top 90%",
          end: "center 35%",
          scrub: 1,
        },
      },
    );

    gsap.to(text, {
      yPercent: -18,
      ease: "none",
      scrollTrigger: {
        trigger: runway,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  // About statement word reveal + scrub
  $$("[data-reveal-lines]").forEach((element) => {
    const words = splitWords(element);
    gsap.from(words, {
      yPercent: 110,
      rotateX: -40,
      autoAlpha: 0,
      duration: 0.85,
      stagger: 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: element,
        start: "top 82%",
      },
    });
  });

  gsap.from(".about-details > *", {
    y: 36,
    autoAlpha: 0,
    duration: 0.75,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about-details",
      start: "top 85%",
    },
  });

  gsap.fromTo(
    ".portrait-card",
    { clipPath: "inset(14% 12% 14% 12%)", autoAlpha: 0.3 },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      autoAlpha: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".portrait-card",
        start: "top 90%",
        end: "top 45%",
        scrub: true,
      },
    },
  );

  gsap.to(".portrait-window img", {
    yPercent: -18,
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
      trigger: ".portrait-card",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.from(".now-list li", {
    x: 40,
    autoAlpha: 0,
    duration: 0.65,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".now-list",
      start: "top 80%",
    },
  });

  $$(".section-title").forEach((title) => {
    const characters = $$(".split-char", title);
    gsap.from(characters, {
      yPercent: 120,
      rotateZ: 6,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.03,
      ease: "expo.out",
      scrollTrigger: {
        trigger: title,
        start: "top 84%",
      },
    });

    gsap.to(title, {
      xPercent: -4,
      ease: "none",
      scrollTrigger: {
        trigger: title,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  $$(".experience-item").forEach((item) => {
    gsap.from(item, {
      y: 50,
      autoAlpha: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 86%",
      },
    });

    gsap.fromTo(
      item,
      { x: -24 },
      {
        x: 24,
        ease: "none",
        scrollTrigger: {
          trigger: item,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
  });

  gsap.from(".stack-cloud span", {
    y: 24,
    scale: 0.85,
    autoAlpha: 0,
    duration: 0.45,
    stagger: 0.035,
    ease: "back.out(1.4)",
    scrollTrigger: {
      trigger: ".stack-cloud",
      start: "top 88%",
    },
  });

  $$(".photo").forEach((photo, index) => {
    const image = $("img", photo);

    gsap.fromTo(
      photo,
      {
        y: index % 2 ? 120 : 60,
        rotate: index % 2 ? 4 : -4,
        autoAlpha: 0,
      },
      {
        y: 0,
        rotate: index % 2 ? 1.5 : -1.5,
        autoAlpha: 1,
        ease: "none",
        scrollTrigger: {
          trigger: photo,
          start: "top 95%",
          end: "top 55%",
          scrub: true,
        },
      },
    );

    gsap.to(image, {
      yPercent: -18,
      scale: 1.12,
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

  gsap.from(".contact-foot > *", {
    y: 30,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.1,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".contact-foot",
      start: "top 90%",
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
        end: () => `+=${distance() + window.innerHeight * 0.85}`,
        pin: true,
        scrub: 0.65,
        invalidateOnRefresh: true,
        anticipatePin: 1,
      },
    });

    $$(".project-card").forEach((card) => {
      const visual = $(".project-visual > img", card);
      const copy = $(".project-copy", card);

      if (visual) {
        gsap.fromTo(
          visual,
          { scale: 1.16, rotate: -2 },
          {
            scale: 1,
            rotate: 0,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontal,
              start: "left 95%",
              end: "left 35%",
              scrub: true,
            },
          },
        );
      }

      if (copy) {
        gsap.fromTo(
          copy,
          { y: 40, autoAlpha: 0.35 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontal,
              start: "left 90%",
              end: "left 45%",
              scrub: true,
            },
          },
        );
      }

      gsap.fromTo(
        card,
        { rotateY: 8 },
        {
          rotateY: 0,
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

    // Pinned photo rail with horizontal scrub
    const photoRail = $(".photo-rail");
    const photosSection = $(".field-notes");
    if (photoRail && photosSection) {
      const photoDistance = () => Math.max(0, photoRail.scrollWidth - window.innerWidth + 64);

      gsap.to(photoRail, {
        x: () => -photoDistance(),
        ease: "none",
        scrollTrigger: {
          trigger: photosSection,
          start: "top top",
          end: () => `+=${photoDistance() + window.innerHeight * 0.4}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    }

    // Contact wallpaper parallax
    gsap.fromTo(
      ".contact-bg",
      { yPercent: -12, scale: 1.12 },
      {
        yPercent: 12,
        scale: 1,
        ease: "none",
        scrollTrigger: {
          trigger: ".contact",
          start: "top bottom",
          end: "bottom top",
          scrub: true,
        },
      },
    );
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

      const visual = $(".project-visual > img", card);
      if (!visual) return;

      gsap.fromTo(
        visual,
        { scale: 1.12 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: card,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        },
      );
    });
  });

  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

initClock();
initCursor();
initMagneticLinks();
initNavigation();
initMotion();
