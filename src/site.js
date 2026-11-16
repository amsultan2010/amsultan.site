import { inject } from "@vercel/analytics";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./fonts.css";
import "./styles.css";

inject({ mode: import.meta.env.DEV ? "development" : "production" });
gsap.registerPlugin(ScrollTrigger);

const SIG_FACES = [
  { cls: "is-base", color: "var(--cyan)", family: '"Host Grotesk", sans-serif', style: "italic", weight: "500", spec: (size) => `italic 500 ${size} "Host Grotesk"` },
];

const SIG_CLASS_NAMES = SIG_FACES.map((face) => face.cls);

const PAGE_TITLE = "Abdullah Sultan - ML/RL";

function initTitle() {
  document.title = PAGE_TITLE;
  document.addEventListener("visibilitychange", () => {
    document.title = document.hidden ? "please come back 😭" : PAGE_TITLE;
  });
}

function placeIndicator(tab, animate) {
  const indicator = document.querySelector(".tab-indicator");
  const list = tab?.closest("[role='tablist']");
  if (!indicator || !tab) return;
  const box = {
    x: tab.offsetLeft,
    y: tab.offsetTop,
    width: tab.offsetWidth,
    height: tab.offsetHeight,
    overwrite: true,
  };
  if (animate) gsap.to(indicator, { ...box, duration: 0.5, ease: "power3.out" });
  else gsap.set(indicator, box);
  list?.classList.add("tabs-ready");
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
  if (!document.hidden) document.title = PAGE_TITLE;
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
  let next = parseFloat(size);
  if (avail && used && used > avail) next = parseFloat(size) * (avail / used);
  if (next < parseFloat(size)) name.style.fontSize = `${next}px`;
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
  if (shrink < 0.999) name.style.fontSize = `${(parseFloat(name.style.fontSize) || next) * shrink}px`;
  const mark = document.createElement("span");
  mark.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
  name.insertBefore(mark, sig);
  const line = mark.getBoundingClientRect().bottom;
  mark.remove();
  sig._shifts = {};
  sig._widths = {};
  shown.style.transform = "none";
  widest = 0;
  faces.forEach((item) => {
    shown.classList.remove(...SIG_CLASS_NAMES);
    shown.classList.add(item.face.cls);
    shown.style.transform = "none";
    const probe = mark.cloneNode();
    shown.appendChild(probe);
    const shift = line - probe.getBoundingClientRect().bottom;
    probe.remove();
    sig._shifts[item.face.cls] = shift;
    const width = Math.ceil(shown.getBoundingClientRect().width);
    sig._widths[item.face.cls] = width;
    if (width > widest) widest = width;
  });
  shown.classList.remove(...SIG_CLASS_NAMES);
  shown.classList.add("is-base");
  shown.style.transform = `translateY(${sig._shifts["is-base"] || 0}px)`;
  sig.style.minWidth = `${widest}px`;
  sig.style.width = `${widest}px`;
  const pen = sig.querySelector(".sig-pen");
  if (pen && sig._widths["is-base"]) {
    pen.style.width = `${sig._widths["is-base"]}px`;
    pen.style.right = "auto";
  }
}

function bindSignatureFit(sig) {
  if (!sig || sig.dataset.fitBound) return;
  sig.dataset.fitBound = "1";
  let frame = 0;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => fitSignature(sig));
  });
}

function initSignature(context) {
  const sig = document.querySelector("[data-sig]");
  if (!sig) return;
  bindSignatureFit(sig);
  const start = async () => {
    if (context.isReverted) return;
    await fitSignature(sig);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
  else start();
}

function initMotion() {
  const mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: reduce)", () => {
    gsap.set("[data-enter], [data-reveal]", { y: 0, autoAlpha: 1 });
    const sig = document.querySelector("[data-sig]");
    bindSignatureFit(sig);
    if (sig && document.fonts?.ready) document.fonts.ready.then(() => fitSignature(sig));
    else if (sig) fitSignature(sig);
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
    if (plate) {
      gsap.set(plate, { scale: 1.08 });
      gsap.to(plate, {
        yPercent: 10,
        ease: "none",
        scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: 0.7 },
      });
    }

    const pfp = document.querySelector(".stage-info .pfp");
    if (pfp) {
      pfp.addEventListener("pointerenter", () => gsap.to(pfp, { scale: 1.045, duration: 0.45, ease: "power2.out" }));
      pfp.addEventListener("pointerleave", () => gsap.to(pfp, { scale: 1, duration: 0.6, ease: "power2.out" }));
    }
  });
}

function initClock() {
  const nodes = document.querySelectorAll("[data-clock]");
  if (!nodes.length) return;
  const format = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Riyadh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const update = () => {
    const now = new Date();
    const text = format.format(now);
    nodes.forEach((node) => {
      node.textContent = text;
      if ("dateTime" in node) node.dateTime = now.toISOString();
    });
  };
  update();
  window.setInterval(update, 30000);
}

function initShapes() {
  const fields = document.querySelectorAll(".shape-field");
  if (!fields.length) return;
  const shapes = [
    ["dot", "1%", "18%", "0.7rem", "0.7rem", "2.4s"],
    ["slash", "2%", "63%", "5.2rem", "", "2.8s"],
    ["pill", "6%", "28%", "4.4rem", "0.85rem", "3.1s"],
    ["ring", "7%", "88%", "4.6rem", "4.6rem", "2.6s"],
    ["block", "11%", "8%", "2.8rem", "2.8rem", "3.4s"],
    ["dot", "14%", "54%", "0.85rem", "0.85rem", "2.2s"],
    ["slash flip", "16%", "76%", "4.8rem", "", "2.5s"],
    ["ring", "20%", "40%", "3.4rem", "3.4rem", "2.9s"],
    ["pill", "22%", "6%", "5.6rem", "1rem", "3.2s"],
    ["dot", "26%", "92%", "1rem", "1rem", "2.1s"],
    ["block", "28%", "22%", "3.6rem", "3.6rem", "2.7s"],
    ["slash", "33%", "68%", "6.4rem", "", "3s"],
    ["ring", "35%", "14%", "5.2rem", "5.2rem", "2.4s"],
    ["dot", "39%", "48%", "0.75rem", "0.75rem", "2.6s"],
    ["pill", "42%", "90%", "4.2rem", "0.8rem", "2.3s"],
    ["slash flip", "46%", "6%", "5.5rem", "", "2.8s"],
    ["block", "48%", "58%", "2.6rem", "2.6rem", "3.3s"],
    ["dot", "52%", "33%", "1.05rem", "1.05rem", "2.2s"],
    ["ring", "55%", "78%", "6.4rem", "6.4rem", "2.7s"],
    ["slash", "57%", "24%", "4.6rem", "", "2.4s"],
    ["pill", "61%", "46%", "6.2rem", "1.05rem", "3.1s"],
    ["dot", "66%", "8%", "0.8rem", "0.8rem", "2.5s"],
    ["block", "68%", "70%", "4.2rem", "4.2rem", "2.9s"],
    ["slash flip", "72%", "40%", "5.8rem", "", "2.3s"],
    ["ring", "74%", "16%", "3.8rem", "3.8rem", "2.6s"],
    ["dot", "79%", "56%", "0.7rem", "0.7rem", "2.1s"],
    ["pill", "81%", "88%", "5rem", "0.9rem", "2.8s"],
    ["slash", "85%", "28%", "6rem", "", "3.2s"],
    ["block", "87%", "48%", "3.1rem", "3.1rem", "2.4s"],
    ["dot", "91%", "74%", "1.1rem", "1.1rem", "2.7s"],
    ["ring", "93%", "10%", "4.8rem", "4.8rem", "2.5s"],
    ["slash flip", "96%", "82%", "4.4rem", "", "2.2s"],
    ["pill", "98%", "36%", "5.4rem", "0.95rem", "3s"],
    ["dot", "5%", "42%", "0.65rem", "0.65rem", "2.9s"],
    ["block", "19%", "60%", "2.2rem", "2.2rem", "2.6s"],
    ["ring", "63%", "92%", "3.2rem", "3.2rem", "3.3s"],
  ];
  fields.forEach((field) => {
    const frag = document.createDocumentFragment();
    shapes.forEach(([cls, top, left, width, height, duration]) => {
      const el = document.createElement("span");
      el.className = `gutter-shape ${cls}`;
      el.style.top = top;
      el.style.left = left;
      el.style.width = width;
      if (height) el.style.height = height;
      el.style.animationDuration = duration;
      frag.append(el);
    });
    field.append(frag);
  });
}

initClock();
initShapes();
initTitle();
initTabs();
initMotion();
