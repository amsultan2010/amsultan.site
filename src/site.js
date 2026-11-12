import { inject } from "@vercel/analytics";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./fonts.css";
import "./styles.css";

inject({ mode: import.meta.env.DEV ? "development" : "production" });
gsap.registerPlugin(ScrollTrigger);

const THEME_KEY = "theme";

const SIG_FACES = [
  { cls: "is-base", color: "var(--roy-red)", family: '"Host Grotesk", sans-serif', style: "italic", weight: "500", spec: (size) => `italic 500 ${size} "Host Grotesk"` },
  { cls: "is-script", color: "var(--roy-orange)", family: "Caveat, cursive", style: "normal", weight: "500", spec: (size) => `500 ${size} Caveat` },
  { cls: "is-serif", color: "var(--roy-yellow)", family: '"Instrument Serif", serif', style: "italic", weight: "400", spec: (size) => `italic 400 ${size} "Instrument Serif"` },
  { cls: "is-playfair", color: "var(--roy-green)", family: '"Playfair Display", serif', style: "italic", weight: "500", spec: (size) => `italic 500 ${size} "Playfair Display"` },
  { cls: "is-mono", color: "var(--roy-blue)", family: '"IBM Plex Mono", monospace', style: "normal", weight: "400", spec: (size) => `400 ${size} "IBM Plex Mono"` },
  { cls: "is-vibes", color: "var(--roy-indigo)", family: '"Great Vibes", cursive', style: "normal", weight: "400", spec: (size) => `400 ${size} "Great Vibes"` },
  { cls: "is-syne", color: "var(--roy-violet)", family: "Syne, sans-serif", style: "normal", weight: "700", spec: (size) => `700 ${size} Syne` },
];

const SIG_CLASS_NAMES = SIG_FACES.map((face) => face.cls);

function applyTheme(theme, persist) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme === "dark" ? "#1a1714" : "#f5f2ee");
  const button = document.querySelector("[data-theme-toggle]");
  if (button) {
    const dark = theme === "dark";
    button.setAttribute("aria-pressed", dark ? "true" : "false");
    button.setAttribute("aria-label", dark ? "switch to light" : "switch to dark");
  }
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* private mode can refuse storage. the choice still applies this visit. */
    }
  }
}

function initTheme() {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;
  applyTheme(document.documentElement.dataset.theme === "dark" ? "dark" : "light", false);
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next, true);
  });
}

function initTitle() {
  const base = document.title;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "please come back 😭" : base;
  });
}

function placeIndicator(tab, animate) {
  const indicator = document.querySelector(".tab-indicator");
  if (!indicator || !tab) return;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  gsap.to(indicator, {
    x: tab.offsetLeft,
    y: tab.offsetTop + tab.offsetHeight + 0.28 * rem,
    width: tab.offsetWidth,
    duration: animate ? 0.5 : 0,
    ease: "power3.out",
    overwrite: true,
  });
}

function revealPanel(panel, animate) {
  const nodes = [...panel.querySelectorAll("[data-reveal]")];
  if (!nodes.length) return;
  if (!animate) {
    gsap.set(nodes, { y: 0, autoAlpha: 1 });
    return;
  }
  const view = window.innerHeight * 0.92;
  const now = [];
  const later = [];
  nodes.forEach((el) => {
    if (el.getBoundingClientRect().top < view) now.push(el);
    else later.push(el);
  });
  if (now.length) {
    gsap.fromTo(
      now,
      { y: 18, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.045, ease: "power3.out", overwrite: true },
    );
  }
  later.forEach((el) => {
    if (el.dataset.armed) return;
    el.dataset.armed = "1";
    gsap.fromTo(
      el,
      { y: 18, autoAlpha: 0 },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.65,
        ease: "power3.out",
        immediateRender: false,
        scrollTrigger: { trigger: el, start: "top 90%", once: true },
      },
    );
  });
}

function motionOk() {
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function syncHiddenTriggers() {
  ScrollTrigger.getAll().forEach((st) => {
    const el = st.trigger;
    if (!el || !el.closest) return;
    if (el.closest("[hidden]")) st.disable(false);
    else st.enable(false);
  });
  ScrollTrigger.refresh();
}

function syncTabHash(panel) {
  const next = panel.id === "panel-internships" ? "" : `#${panel.id}`;
  if (location.hash === next) return;
  history.replaceState(null, "", `${location.pathname}${location.search}${next}`);
}

function selectTab(tabs, index, animate, fromHash) {
  const previous = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
  let opened = null;
  tabs.forEach((tab, i) => {
    const on = i === index;
    tab.setAttribute("aria-selected", on ? "true" : "false");
    tab.tabIndex = on ? 0 : -1;
    const panel = document.getElementById(tab.getAttribute("aria-controls"));
    if (!panel) return;
    panel.hidden = !on;
    if (on) opened = { tab, panel };
  });
  if (!opened) return;
  placeIndicator(opened.tab, animate);
  syncHiddenTriggers();
  revealPanel(opened.panel, animate);
  if (!fromHash && index !== previous) syncTabHash(opened.panel);
}

function initTabs() {
  const list = document.querySelector("[role='tablist']");
  if (!list) return;
  const tabs = [...list.querySelectorAll("[role='tab']")];
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => selectTab(tabs, i, motionOk()));
    tab.addEventListener("keydown", (event) => {
      let next = null;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (i + 1) % tabs.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next === null) return;
      event.preventDefault();
      selectTab(tabs, next, motionOk());
      tabs[next].focus();
    });
  });

  const open = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
  placeIndicator(tabs[Math.max(open, 0)], false);
  if (open >= 0) revealPanel(document.getElementById(tabs[open].getAttribute("aria-controls")), motionOk());
  addEventListener("resize", () => {
    const current = tabs.find((tab) => tab.getAttribute("aria-selected") === "true");
    placeIndicator(current, false);
  });

  const revealHash = () => {
    const hash = location.hash.replace(/^#/, "");
    if (!hash) return;
    let id = hash;
    try {
      id = decodeURIComponent(hash);
    } catch {
      return;
    }
    const target = document.getElementById(id);
    if (!target) return;
    const panel = target.closest("[role='tabpanel']");
    if (panel?.hidden) {
      const index = tabs.findIndex((tab) => tab.getAttribute("aria-controls") === panel.id);
      if (index >= 0) selectTab(tabs, index, motionOk(), true);
    }
    requestAnimationFrame(() => target.scrollIntoView({ block: "start" }));
  };

  revealHash();
  window.addEventListener("hashchange", revealHash);
}

async function loadFace(spec) {
  if (!document.fonts?.load) return false;
  try {
    await document.fonts.load(spec, "sultan");
    return document.fonts.check(spec, "sultan");
  } catch {
    return false;
  }
}

async function fitSignature(sig) {
  const name = sig.closest("h1");
  if (name) name.style.fontSize = "";
  const size = getComputedStyle(name || sig).fontSize;
  const ready = await Promise.all(SIG_FACES.map((face) => loadFace(face.spec(size))));
  if (!ready[0]) return;
  const ctx = document.createElement("canvas").getContext("2d");
  const ink = (text, family, style, weight) => {
    ctx.font = `${style} ${weight} ${size} ${family}`;
    const measured = ctx.measureText(text);
    return {
      h: (measured.actualBoundingBoxAscent || 0) + (measured.actualBoundingBoxDescent || 0) || 1,
      w: measured.width || 1,
    };
  };
  const target = ink("abdullah", '"Host Grotesk", sans-serif', "normal", "500");
  const gap = ink(" ", '"Host Grotesk", sans-serif', "normal", "500").w;
  const faces = SIG_FACES.flatMap((face, index) => (ready[index] ? [{ face, ink: ink("sultan", face.family, face.style, face.weight) }] : []));
  if (!faces.length) return;
  const baseScale = target.h / faces[0].ink.h;
  const widthCap = faces[0].ink.w * baseScale * 1.22;
  sig.style.fontSize = `${baseScale}em`;
  let widest = 0;
  faces.forEach((item) => {
    let scale = target.h / item.ink.h;
    if (item.ink.w * scale > widthCap) scale = widthCap / item.ink.w;
    widest = Math.max(widest, item.ink.w * scale);
    if (item.face.cls !== "is-base") sig.style.setProperty(`--${item.face.cls}-fit`, String(scale / baseScale));
  });
  const box = name?.parentElement;
  if (!name || !box) return;
  const avail = box.clientWidth - 8;
  const used = target.w + gap + widest;
  if (!avail || !used) return;
  name.style.fontSize = `${parseFloat(size) * (avail / used)}px`;
  const shown = sig.querySelector(".sig-live");
  if (!shown) return;
  let shrink = 1;
  faces.forEach((item) => {
    shown.classList.remove(...SIG_CLASS_NAMES);
    shown.classList.add(item.face.cls);
    const end = shown.getBoundingClientRect().right;
    const limit = box.getBoundingClientRect().right - 4;
    if (end > limit) shrink = Math.min(shrink, (limit - name.getBoundingClientRect().left) / (end - name.getBoundingClientRect().left));
  });
  if (shrink < 0.999) name.style.fontSize = `${parseFloat(name.style.fontSize) * shrink}px`;
  shown.classList.remove(...SIG_CLASS_NAMES);
  shown.classList.add("is-base");
  sig.style.minWidth = "0px";
  sig.style.width = `${Math.ceil(shown.getBoundingClientRect().width)}px`;
}

function drawFace(live, pen, face) {
  const sig = live.closest("[data-sig]");
  const tl = gsap.timeline();
  tl.to(live, { clipPath: "inset(0 0 0 100%)", duration: 0.22, ease: "power2.in" }, 0)
    .to(pen, { scaleX: 0, transformOrigin: "right center", duration: 0.22, ease: "power2.in" }, 0)
    .add(() => {
      live.classList.remove(...SIG_CLASS_NAMES);
      live.classList.add(face.cls);
      live.style.color = face.color;
      if (sig) {
        sig.style.color = face.color;
        sig.style.minWidth = "0px";
        sig.style.width = `${Math.ceil(live.getBoundingClientRect().width)}px`;
      }
    })
    .set(live, { clipPath: "inset(0 100% 0 0)" })
    .set(pen, { scaleX: 0, transformOrigin: "left center" })
    .to(live, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.62, ease: "power2.out" })
    .to(pen, { scaleX: 1, duration: 0.62, ease: "power2.out" }, "<");
  return tl;
}

function initSignature(context) {
  const sig = document.querySelector("[data-sig]");
  if (!sig) return;
  if (!sig.dataset.fitBound) {
    sig.dataset.fitBound = "1";
    let frame = 0;
    window.addEventListener("resize", () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fitSignature(sig));
    });
  }
  const live = sig.querySelector(".sig-live");
  const pen = sig.querySelector(".sig-pen");
  const start = async () => {
    if (context.isReverted) return;
    await fitSignature(sig);
    if (context.isReverted) return;
    context.add(() => {
      const cycle = gsap.timeline({ repeat: -1, delay: 1.35 });
      SIG_FACES.forEach((face, i) => {
        if (i === 0) return;
        cycle.add(drawFace(live, pen, face));
        cycle.to({}, { duration: 1.2 });
      });
      cycle.add(drawFace(live, pen, SIG_FACES[0]));
      cycle.to({}, { duration: 1.35 });
      return () => {
        live.classList.remove("is-script", "is-serif");
        live.classList.add("is-base");
        live.style.removeProperty("color");
        sig.style.removeProperty("color");
        gsap.set(live, { clearProps: "clipPath" });
        gsap.set(pen, { clearProps: "scaleX,transformOrigin" });
      };
    });
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
}

function initMotion() {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set("[data-enter], [data-reveal]", { y: 0, autoAlpha: 1 });
  });
  mm.add("(prefers-reduced-motion: no-preference)", (context) => {
    initSignature(context);

    const enter = document.querySelectorAll("[data-enter]");
    if (enter.length) {
      gsap.to(enter, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.08, ease: "power3.out" });
    }

    const below = [...document.querySelectorAll("[data-reveal]")].filter((el) => !el.closest("[role='tabpanel']"));
    below.forEach((el) => {
      gsap.fromTo(
        el,
        { y: 18, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        },
      );
    });

    const plate = document.querySelector(".plate img");
    const shapes = document.querySelectorAll(".shape");
    if (plate) gsap.set(plate, { scale: 1.08 });
    if (plate || shapes.length) {
      const parallax = gsap.timeline({
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.7 },
      });
      if (plate) parallax.to(plate, { yPercent: 10, ease: "none" }, 0);
      if (shapes.length) parallax.to(shapes, { y: (i) => 28 + i * 14, ease: "none" }, 0);
    }
    if (shapes.length) {
      gsap.set(shapes, { rotation: (i, el) => Number(el.dataset.tilt || 0) });
      gsap.to(shapes, {
        x: (i) => (i % 2 ? 16 : -18),
        duration: (i) => 8 + (i % 6) * 0.7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }

    const pfp = document.querySelector(".stage-info .pfp");
    if (pfp) {
      pfp.addEventListener("pointerenter", () => gsap.to(pfp, { scale: 1.045, duration: 0.45, ease: "power2.out" }));
      pfp.addEventListener("pointerleave", () => gsap.to(pfp, { scale: 1, duration: 0.6, ease: "power2.out" }));
    }
  });
}

initTheme();
initTitle();
initTabs();
initMotion();
