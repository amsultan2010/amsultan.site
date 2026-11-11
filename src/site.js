import { inject } from "@vercel/analytics";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./fonts.css";
import "./styles.css";

inject({ mode: import.meta.env.DEV ? "development" : "production" });
gsap.registerPlugin(ScrollTrigger);

const THEME_KEY = "theme";

const SIG_FACES = [
  { cls: "is-base", color: "var(--roy-red)" },
  { cls: "is-script", color: "var(--roy-orange)" },
  { cls: "is-serif", color: "var(--roy-yellow)" },
  { cls: "is-base", color: "var(--roy-green)" },
  { cls: "is-script", color: "var(--roy-blue)" },
  { cls: "is-serif", color: "var(--roy-indigo)" },
  { cls: "is-base", color: "var(--roy-violet)" },
];

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

function selectTab(tabs, index, animate) {
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
      if (index >= 0) selectTab(tabs, index, motionOk());
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
  const live = sig.querySelector(".sig-live");
  const size = getComputedStyle(live).fontSize;
  const [baseReady, scriptReady, serifReady] = await Promise.all([
    loadFace(`italic 500 ${size} "Host Grotesk"`),
    loadFace(`500 ${size} Caveat`),
    loadFace(`italic 400 ${size} "Instrument Serif"`),
  ]);
  const probe = document.createElement("span");
  probe.textContent = "sultan";
  probe.style.cssText = `position:absolute;left:-9999px;top:0;visibility:hidden;white-space:nowrap;font-size:${size};line-height:1`;
  document.body.appendChild(probe);
  const widthOf = (family, style, weight) => {
    probe.style.fontFamily = family;
    probe.style.fontStyle = style;
    probe.style.fontWeight = weight;
    return probe.getBoundingClientRect().width || 1;
  };
  const base = widthOf('"Host Grotesk", "Helvetica Neue", sans-serif', "italic", "500");
  if (baseReady && scriptReady) {
    sig.style.setProperty("--script-fit", String(base / widthOf("Caveat, cursive", "normal", "500")));
  }
  if (baseReady && serifReady) {
    sig.style.setProperty("--serif-fit", String(base / widthOf('"Instrument Serif", Georgia, serif', "italic", "400")));
  }
  probe.remove();
}

