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

function initPhotoCarousel() {
  const rail = $(".photo-rail");
  const viewport = $(".photo-viewport");
  const photos = $$(".photo");
  const prev = $(".photo-nav-prev");
  const next = $(".photo-nav-next");
  const indexLabel = $("[data-photo-index]");
  if (!rail || !viewport || !photos.length || !prev || !next) return;

  let index = 0;
  let prevIndex = 0;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const maxIndex = () => {
    const gap = Number.parseFloat(getComputedStyle(rail).gap) || 16;
    const step = photos[0].offsetWidth + gap;
    const visible = Math.max(1, Math.floor((viewport.clientWidth || window.innerWidth) / step));
    return Math.max(0, photos.length - visible);
  };

  const syncFocus = () => {
    if (reduceMotion) {
      gsap.set(photos, { scale: 1, opacity: 1, rotateY: 0 });
      gsap.set(
        photos.map((photo) => $("img", photo)).filter(Boolean),
        { xPercent: 0, scale: 1 },
      );
      return;
    }

    const bounds = viewport.getBoundingClientRect();
    const center = bounds.left + bounds.width / 2;

    photos.forEach((photo) => {
      const rect = photo.getBoundingClientRect();
      const photoCenter = rect.left + rect.width / 2;
      const norm = (photoCenter - center) / Math.max(rect.width, 1);
      const focus = 1 - gsap.utils.clamp(0, 1, Math.abs(norm) * 0.9);

      gsap.set(photo, {
        scale: 0.92 + focus * 0.08,
        opacity: 0.5 + focus * 0.5,
        rotateY: gsap.utils.clamp(-7, 7, -norm * 8),
      });

      const img = $("img", photo);
      if (img) {
        gsap.set(img, {
          xPercent: gsap.utils.clamp(-10, 10, -norm * 12),
          scale: 1.08 - focus * 0.08,
        });
      }
    });
  };

  const animateIndexLabel = (nextValue) => {
    if (!indexLabel) return;
    const label = String(nextValue + 1).padStart(2, "0");
    if (reduceMotion) {
      indexLabel.textContent = label;
      return;
    }

    const direction = nextValue >= prevIndex ? 1 : -1;
    gsap.killTweensOf(indexLabel);
    indexLabel.textContent = label;
    gsap.fromTo(
      indexLabel,
      { yPercent: direction * 110, autoAlpha: 0 },
      { yPercent: 0, autoAlpha: 1, duration: 0.38, ease: "power3.out", overwrite: true },
    );
  };

  const update = (animate = true) => {
    const gap = Number.parseFloat(getComputedStyle(rail).gap) || 16;
    const step = photos[0].offsetWidth + gap;
    const clamped = Math.min(Math.max(index, 0), maxIndex());
    index = clamped;

    const duration = reduceMotion || !animate ? 0 : 0.75;
    gsap.to(rail, {
      x: -index * step,
      ease: "power3.out",
      duration,
      overwrite: true,
      onUpdate: syncFocus,
      onComplete: syncFocus,
    });
    if (duration === 0) syncFocus();

    if (animate) animateIndexLabel(index);
    else if (indexLabel) indexLabel.textContent = String(index + 1).padStart(2, "0");

    prev.disabled = index <= 0;
    next.disabled = index >= maxIndex();
    prevIndex = index;
  };

  prev.addEventListener("click", () => {
    index -= 1;
    update();
  });
  next.addEventListener("click", () => {
    index += 1;
    update();
  });

  window.addEventListener(
    "keydown",
    (event) => {
      const section = $(".field-notes");
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const inView = rect.top < window.innerHeight * 0.75 && rect.bottom > window.innerHeight * 0.25;
      if (!inView) return;
      if (event.key === "ArrowLeft") {
        index -= 1;
        update();
      }
      if (event.key === "ArrowRight") {
        index += 1;
        update();
      }
    },
  );

  window.addEventListener("resize", () => update(false), { passive: true });
  update(false);
}

function initMotion() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("[data-split]").forEach(splitCharacters);

  if (reduceMotion) {
    gsap.set(".scroll-progress", { scaleX: 1 });
    initPhotoCarousel();
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
    .from(".hero-foot > *", { y: 24, autoAlpha: 0, duration: 0.7, stagger: 0.08 }, 0.55);

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
    .to(".hero-meta", { y: -40, autoAlpha: 0 }, 0)
    .to(".hero-foot", { y: -50, autoAlpha: 0 }, 0);

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

  gsap.from(".about-bio, .about-actions, .about-kicker", {
    y: 28,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".about-lead",
      start: "top 80%",
    },
  });

  gsap.fromTo(
    ".portrait-window",
    { clipPath: "inset(12% 10% 12% 10%)", rotate: -8, autoAlpha: 0.35 },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      rotate: -2.5,
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
    yPercent: -14,
    scale: 1.08,
    ease: "none",
    scrollTrigger: {
      trigger: ".portrait-card",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
    },
  });

  gsap.from(".portrait-stamp", {
    y: 20,
    rotate: -8,
    autoAlpha: 0,
    duration: 0.65,
    ease: "back.out(1.4)",
    scrollTrigger: {
      trigger: ".portrait-card",
      start: "top 70%",
    },
  });

  gsap.from(".focus-card", {
    y: 48,
    autoAlpha: 0,
    duration: 0.7,
    stagger: 0.08,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".focus-board",
      start: "top 85%",
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
  });

  $$(".experience-item").forEach((item) => {
    gsap.from(item, {
      y: 36,
      autoAlpha: 0,
      duration: 0.7,
      ease: "power3.out",
      scrollTrigger: {
        trigger: item,
        start: "top 86%",
      },
    });
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

    gsap.from(photo, {
      y: 40,
      autoAlpha: 0,
      duration: 0.7,
      delay: Math.min(index, 4) * 0.04,
      ease: "power3.out",
      scrollTrigger: {
        trigger: ".field-notes",
        start: "top 80%",
      },
    });

    gsap.to(image, {
      scale: 1.06,
      ease: "none",
      scrollTrigger: {
        trigger: ".field-notes",
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });

  initPhotoCarousel();

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
    const cards = $$(".project-card");
    if (!track || !viewport) return;

    const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);

    const syncProjectFocus = () => {
      const center = window.innerWidth / 2;
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const norm = (cardCenter - center) / (window.innerWidth * 0.55);
        const focus = 1 - gsap.utils.clamp(0, 1, Math.abs(norm));

        gsap.set(card, {
          scale: 0.93 + focus * 0.07,
          rotateY: gsap.utils.clamp(-10, 10, -norm * 12),
          z: focus * 48,
        });

        const visual = $(".project-visual", card);
        if (visual) {
          gsap.set(visual, { opacity: 0.5 + focus * 0.5 });
        }
      });
    };

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
        onUpdate: syncProjectFocus,
        onRefresh: syncProjectFocus,
      },
    });

    syncProjectFocus();

    cards.forEach((card) => {
      const visual = $(".project-visual > img", card);
      const copy = $(".project-copy", card);

      if (visual) {
        gsap.fromTo(
          visual,
          { scale: 1.14, xPercent: -4 },
          {
            scale: 1,
            xPercent: 0,
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
          { y: 22, autoAlpha: 0.35 },
          {
            y: 0,
            autoAlpha: 1,
            ease: "none",
            scrollTrigger: {
              trigger: card,
              containerAnimation: horizontal,
              start: "left 90%",
              end: "left 48%",
              scrub: true,
            },
          },
        );
      }
    });

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
