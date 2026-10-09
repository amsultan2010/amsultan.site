// two draggable rails: film and show covers after the lead section, and the
// objects i actually keep around further up the page
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import "./rail.css";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

const D = { fast: 0.35, base: 0.7, slow: 1.1 };

const WATCHING = [
  { title: "the odyssey", kind: "film", src: "/images/watchlist/movies/the-odyssey.jpg", w: 379, h: 600,
    alt: "the odyssey poster: a plumed bronze helmet seen from behind against a blue sky" },
  { title: "f1", kind: "film", src: "/images/watchlist/movies/f1.jpg", w: 349, h: 440,
    alt: "f1 poster: a driver in a helmet beside a formula one car on track" },
  { title: "whiplash", kind: "film", src: "/images/watchlist/movies/whiplash.jpg", w: 330, h: 440,
    alt: "whiplash poster: a young drummer lit gold behind a jazz kit" },
  { title: "the message", kind: "film", src: "/images/watchlist/movies/the-message.jpg", w: 267, h: 374,
    alt: "the message poster: a desert caravan under a wide sky" },
  { title: "interstellar", kind: "film", src: "/images/watchlist/movies/interstellar.jpg", w: 297, h: 440,
    alt: "interstellar poster: a lone astronaut on an ice plain under a pale sky" },
  { title: "lanterns", kind: "show", src: "/images/watchlist/shows/lanterns.jpg", w: 293, h: 440,
    alt: "lanterns poster: two men walking down an empty street under a green sky" },
  { title: "the mentalist", kind: "show", src: "/images/watchlist/shows/the-mentalist.jpg", w: 293, h: 440,
    alt: "the mentalist poster: the lead in a dark suit beside a red and teal panel" },
  { title: "moon knight", kind: "show", src: "/images/watchlist/shows/moon-knight.jpg", w: 293, h: 440,
    alt: "moon knight poster: a masked figure in a white suit and wrapped hood" },
  { title: "invincible", kind: "show", src: "/images/watchlist/shows/invincible.jpg", w: 352, h: 440,
    alt: "invincible poster: an illustrated hero in a blue and yellow suit mid flight" },
  { title: "jojo's bizarre adventure", kind: "show", src: "/images/watchlist/shows/jojo.jpg", w: 311, h: 440,
    alt: "jojo's bizarre adventure steel ball run poster: riders racing horses down a desert canyon under a blue sky" },
];

// trim is the solid part of each cutout inside its own file, as [x, y, w, h] in
// file pixels. measured once from the alpha channel at alpha above 96, so a soft
// cast shadow does not count. the rail sizes that box, never the canvas
const OBJECTS = [
  { title: "the kicks", src: "/images/objects/shoes.png", w: 520, h: 346,
    trim: [29, 62, 460, 245],
    alt: "a pair of red and white nike air jordan 1 high top sneakers" },
  { title: "where i learn", src: "/images/objects/aisr.png", w: 314, h: 313,
    trim: [0, 0, 314, 313],
    alt: "the american international school riyadh seal, an open book inside a blue and gold ring" },
  { title: "what i code on", src: "/images/objects/macbook.png", w: 520, h: 520,
    trim: [61, 139, 398, 242],
    alt: "a midnight blue macbook air open, showing a blue wallpaper" },
  { title: "pokemon of choice", src: "/images/objects/garchomp.png", w: 496, h: 520,
    trim: [0, 0, 496, 520],
    alt: "garchomp, a navy and red land shark dragon pokemon, mid roar" },
  { title: "what i write on", src: "/images/objects/ipad.png", w: 311, h: 520,
    trim: [7, 3, 297, 371],
    alt: "a blue ipad air seen from the front and back at an angle" },
  { title: "home", src: "/images/objects/saudi.png", w: 520, h: 346,
    trim: [0, 0, 520, 346],
    alt: "the flag of saudi arabia, white arabic script and a sword on green" },
  { title: "my sport", src: "/images/objects/tennis.webp", w: 520, h: 520,
    trim: [40, 36, 437, 431],
    alt: "a bright green felt tennis ball with a white seam" },
  { title: "how i relax", src: "/images/objects/steamdeck.png", w: 520, h: 292,
    trim: [74, 71, 372, 172],
    alt: "a steam deck handheld console running a game on its screen" },
  { title: "who i support", src: "/images/objects/astonmartin.png", w: 520, h: 520,
    trim: [30, 102, 462, 316],
    alt: "the aston martin cognizant formula one team wordmark and winged badge" },
  { title: "smash main", src: "/images/objects/incineroar.png", w: 247, h: 241,
    trim: [22, 2, 213, 233],
    alt: "incineroar, a red and black wrestler cat pokemon, in a fighting stance" },
  { title: "my second brain", src: "/images/objects/claude.png", w: 520, h: 112,
    trim: [0, 0, 520, 112],
    alt: "the claude wordmark beside its orange asterisk mark" },
];

// fisher-yates, so the order is genuinely different every load rather than a
// rotation of the same sequence
function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// the widest cutout is held to this many base widths, or the claude wordmark at
// 4.6 to 1 would take a third of the screen on its own
const MAX_SPAN = 1.9;

// equal visible area: every cutout covers a square of one base unit, reshaped to
// its own aspect ratio, so a wide object gets a wide cell instead of a letterbox.
// its width in base units is then the root of that ratio
const aspectOf = ({ trim }) => trim[2] / trim[3];
const spanOf = (item) => Math.min(Math.sqrt(aspectOf(item)), MAX_SPAN);

// the file is drawn larger than its cell by whatever transparent padding it
// carries, then slid so the middle of the trimmed box lands on the cell centre
function fitObject(figure, item) {
  const [x, y, w, h] = item.trim;
  figure.style.setProperty("--span", spanOf(item).toFixed(3));
  figure.style.setProperty("--bleed", (item.w / w).toFixed(3));
  figure.style.setProperty("--shift-x", `${((x + w / 2) / item.w * -100).toFixed(2)}%`);
  figure.style.setProperty("--shift-y", `${((y + h / 2) / item.h * -100).toFixed(2)}%`);
}

function buildItem(item, variant, isClone) {
  const figure = document.createElement("figure");
  figure.className = `rail-item rail-item-${variant}`;
  if (isClone) figure.setAttribute("aria-hidden", "true");
  if (item.trim) fitObject(figure, item);

  const cover = document.createElement("div");
  cover.className = "rail-cover";

  const img = document.createElement("img");
  img.src = item.src;
  img.alt = isClone ? "" : item.alt;
  img.width = item.w;
  img.height = item.h;
  img.loading = "lazy";
  img.decoding = "async";
  img.draggable = false;
  cover.append(img);

  const caption = document.createElement("figcaption");
  caption.className = "rail-caption";

  const inner = document.createElement("span");
  inner.className = "rail-caption-inner";

  const title = document.createElement("span");
  title.className = "rail-title";
  title.textContent = item.title;
  inner.append(title);

  if (item.kind) {
    const kind = document.createElement("span");
    kind.className = "mono rail-kind";
    kind.textContent = item.kind;
    inner.append(kind);
  }

  caption.append(inner);
  figure.append(cover, caption);

  return figure;
}

function el(tag, className, ...children) {
  const node = document.createElement(tag);
  node.className = className;
  node.append(...children);
  return node;
}

// a line and the mask it rises out of. the entrance moves the inner span and the
// outer one clips it, so nothing in the head is faded in on opacity alone
const masked = (className, ...children) =>
  el("p", `${className} rail-mask`, el("span", "rail-rise", ...children));

// drawn rather than typed: a text arrow falls back to whatever face has the
// glyph, and on some phones that face is the emoji one
function buildArrow() {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "rail-arrow");
  svg.setAttribute("viewBox", "0 0 26 10");
  svg.setAttribute("aria-hidden", "true");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", "M1 5h24M5 1 1 5l4 4M21 1l4 4-4 4");
  svg.append(path);

  return svg;
}

// four ruled cells that fill the bar: the label, a ruler whose playhead tracks
// the loop, a count, and the drag hint
function buildHead(label, count) {
  // the last word carries the accent, the same split the about statement uses
  const cut = label.lastIndexOf(" ") + 1;
  const accent = el("span", "rail-label-accent", label.slice(cut));

  const ruler = el(
    "div",
    "rail-cell rail-cell-ruler",
    el(
      "span",
      "rail-ruler",
      el("span", "rail-ticks"),
      el("span", "rail-carriage", el("span", "rail-playhead")),
    ),
  );
  // the ruler only repeats what the track is already doing
  ruler.setAttribute("aria-hidden", "true");

  return el(
    "div",
    "rail-head",
    el("div", "rail-cell rail-cell-label", masked("display rail-label", label.slice(0, cut), accent)),
    ruler,
    el("div", "rail-cell rail-cell-count", masked("mono rail-count", count)),
    el("div", "rail-cell rail-cell-hint", masked("mono rail-hint", "drag"), buildArrow()),
  );
}

function buildSection({ items, label, variant, noun }) {
  const section = document.createElement("section");
  section.className = `rail rail-${variant}`;
  section.setAttribute("aria-label", label);

  const head = buildHead(label, `${items.length} ${noun}`);

  const viewport = document.createElement("div");
  viewport.className = "rail-viewport";

  const track = document.createElement("div");
  track.className = "rail-track";

  // one row height for the whole object rail, so the captions share a line: the
  // tallest cutout sets it and the rest centre inside
  if (variant === "object") {
    const rise = Math.max(...items.map((item) => spanOf(item) / aspectOf(item)));
    track.style.setProperty("--rise", rise.toFixed(3));
  }

  // two identical runs, so an xPercent wrap of -50 lands on a matching frame
  items.forEach((item) => track.append(buildItem(item, variant, false)));
  items.forEach((item) => track.append(buildItem(item, variant, true)));

  viewport.append(track);
  section.append(head, viewport);

  return { section, head, viewport, track };
}

// the auto scroll owns xPercent, the drag owns x. handing the offset between the
// two on press and release keeps a single wrapped value instead of two that can
// drift past each other
function initDrag(track, auto, setHead) {
  const runWidth = () => track.offsetWidth / 2;
  let handedOver = false;

  const takeOver = () => {
    auto.pause();
    const px = (gsap.getProperty(track, "xPercent") / 100) * track.offsetWidth;
    gsap.set(track, { xPercent: 0, x: px });
    handedOver = false;
  };

  const handBack = () => {
    if (handedOver) return;
    handedOver = true;
    const px = gsap.utils.wrap(-runWidth(), 0)(gsap.getProperty(track, "x"));
    const xPercent = (px / track.offsetWidth) * 100;
    gsap.set(track, { x: 0, xPercent });
    auto.progress(-xPercent / 50).play();
  };

  const wrapDrag = function wrapDrag() {
    const run = runWidth();
    const px = gsap.utils.wrap(-run, 0)(this.x);
    gsap.set(track, { x: px });
    // the auto tween is paused under a drag, so the playhead is fed from here
    setHead(-px / run);
  };

  return Draggable.create(track, {
    type: "x",
    inertia: true,
    // a vertical swipe still scrolls the page, a horizontal one drags the rail
    allowNativeTouchScrolling: true,
    cursor: "grab",
    activeCursor: "grabbing",
    onPressInit() {
      takeOver();
      this.update();
    },
    onDrag: wrapDrag,
    onThrowUpdate: wrapDrag,
    onRelease() {
      if (!this.isThrowing) handBack();
    },
    onThrowComplete: handBack,
  })[0];
}

function initHover(track) {
  [...track.children].forEach((item) => {
    const cover = item.querySelector(".rail-cover");
    const caption = item.querySelector(".rail-caption-inner");

    gsap.set(caption, { yPercent: 105, autoAlpha: 0 });

    const tl = gsap
      .timeline({ paused: true, defaults: { ease: "out" } })
      .to(cover, { y: -14, scale: 1.04, duration: D.fast }, 0)
      .to(caption, { yPercent: 0, autoAlpha: 1, duration: D.base }, 0.05);

    item.addEventListener("pointerenter", () => {
      item.classList.add("is-hot");
      track.classList.add("is-dimmed");
      tl.play();
    });

    item.addEventListener("pointerleave", () => {
      item.classList.remove("is-hot");
      track.classList.remove("is-dimmed");
      tl.reverse();
    });
  });
}

function initEntrance(section, track, travel) {
  const covers = [...track.querySelectorAll(".rail-cover")];

  return gsap.from(covers, {
    clipPath: "inset(0% 0% 100% 0%)",
    y: travel,
    duration: D.slow,
    stagger: 0.045,
    ease: "out",
    // will-change is dropped once the entrance is done, so these covers do not
    // hold a compositor layer each for the rest of the session
    onComplete: () => gsap.set(covers, { clearProps: "willChange" }),
    scrollTrigger: { trigger: section, start: "top 85%", once: true },
  });
}

// one shot, as the bar itself comes into view: the label rises out of its mask,
// the ticks run out from the left, then the two mono cells follow
function initHeadEntrance(head) {
  const [label, count, hint] = head.querySelectorAll(".rail-rise");

  return gsap
    .timeline({
      defaults: { ease: "out" },
      scrollTrigger: { trigger: head, start: "top 88%", once: true },
    })
    .from(label, { yPercent: 125, duration: D.slow }, 0)
    .from(head.querySelector(".rail-ticks"), { scaleX: 0, duration: D.slow }, 0.1)
    .from([count, hint], { yPercent: 125, duration: D.base, stagger: 0.08 }, 0.3)
    .from(head.querySelector(".rail-playhead"), { scaleY: 0, duration: D.fast }, 0.5)
    .from(head.querySelector(".rail-arrow"), { scaleX: 0, duration: D.base }, 0.5);
}

function mountRail({ anchor, position, items, label, noun, variant, duration }) {
  if (!anchor) return;

  const { section, head, viewport, track } = buildSection({ items, label, variant, noun });
  const carriage = head.querySelector(".rail-carriage");
  anchor[position](section);

  const mm = gsap.matchMedia();

  // matchMedia only runs this when at least one condition matches, so the
  // motion pair guarantees it runs on touch devices too
  mm.add(
    {
      fine: "(hover: hover) and (pointer: fine)",
      motion: "(prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { fine, reduce } = context.conditions;

      // touch gets the same loop and drag as desktop, only the hover reveal is
      // pointer only. reduced motion is the one case that falls back to a scroller
      viewport.classList.toggle("is-scroller", reduce);

      if (reduce) {
        gsap.set(track, { x: 0, xPercent: 0 });
        gsap.set(track.querySelectorAll(".rail-caption-inner"), {
          yPercent: 0,
          autoAlpha: 1,
        });
        return;
      }

      // loop progress, 0 to 1, as a place along the ruler. the carriage is as
      // wide as the strip, so a percentage of itself needs no measuring
      const setX = gsap.quickSetter(carriage, "xPercent");
      const setHead = (progress) => setX(progress * 100);

      const auto = gsap.to(track, {
        xPercent: -50,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: { xPercent: gsap.utils.wrap(-50, 0) },
        onUpdate() {
          setHead(this.progress());
        },
      });

      const drag = initDrag(track, auto, setHead);
      if (fine) {
        initHover(track);
      } else {
        // no hover on touch, so the captions just stay on screen
        gsap.set(track.querySelectorAll(".rail-caption-inner"), { yPercent: 0, autoAlpha: 1 });
      }
      initHeadEntrance(head);
      initEntrance(section, track, fine ? 40 : 24);

      // the drag hint leans a few pixels either way, slowly, so the bar is never
      // completely still while the rail is on screen
      const sway = gsap.fromTo(
        head.querySelector(".rail-arrow"),
        { x: -3 },
        { x: 3, duration: 1.6, ease: "inOut", repeat: -1, yoyo: true },
      );

      // an off screen rail still costs a transform write every frame, so park it
      // until it is actually in view
      const inView = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          // the hint is no part of the drag handover, so it parks either way
          sway.paused(!self.isActive);
          if (drag.isPressed || drag.isThrowing) return;
          if (self.isActive) auto.play();
          else auto.pause();
        },
      });
      if (!inView.isActive) {
        auto.pause();
        sway.pause();
      }

      // a subtle speed bias: fast scrolling pushes the rail along, then it eases
      // back to its own pace rather than staying stuck at the boosted speed
      const bias = gsap.utils.clamp(1, 2.4);
      const speed = { value: 1 };
      const nudge = ScrollTrigger.create({
        onUpdate: (self) => {
          if (!inView.isActive || drag.isPressed || drag.isThrowing) return;
          const target = bias(Math.abs(self.getVelocity()) / 1600 + 1);
          if (target <= speed.value) return;
          speed.value = target;
          auto.timeScale(target);
          gsap.to(speed, {
            value: 1,
            duration: D.slow,
            ease: "power3",
            overwrite: true,
            onUpdate: () => auto.timeScale(speed.value),
          });
        },
      });

      return () => {
        gsap.killTweensOf(speed);
        nudge.kill();
        inView.kill();
        drag.kill();
        sway.kill();
        auto.kill();
        gsap.set(track, { x: 0, xPercent: 0, clearProps: "cursor" });
        gsap.set(carriage, { clearProps: "transform" });
      };
    },
  );

  return section;
}

export function initRail() {
  const sections = [];

  // the objects sit up with the about copy, the covers sit after the lead list,
  // so the two rails punctuate the page instead of stacking
  sections.push(
    mountRail({
      anchor: document.querySelector(".about"),
      position: "after",
      items: shuffle(OBJECTS),
      label: "my personal stack",
      noun: "objects",
      variant: "object",
      // one run of the track per duration, so a longer run needs more seconds
      // just to hold its pace
      duration: 52,
    }),
  );

  sections.push(
    mountRail({
      anchor: document.querySelector(".lead"),
      position: "after",
      items: shuffle(WATCHING),
      label: "current watchlist",
      noun: "titles",
      variant: "poster",
      duration: 43,
    }),
  );

  const mounted = sections.filter(Boolean);
  if (!mounted.length) return;

  // the sections land after first paint, so every trigger below them is stale.
  // the covers carry an aspect-ratio, so height is known before the bytes are,
  // and the second refresh only catches anything that settles late
  requestAnimationFrame(() => ScrollTrigger.refresh());

  const images = mounted.flatMap((section) => [...section.querySelectorAll("img")]);
  let pending = images.filter((img) => !img.complete).length;
  if (!pending) return;

  const settle = () => {
    pending -= 1;
    if (pending === 0) ScrollTrigger.refresh();
  };

  images.forEach((img) => {
    if (img.complete) return;
    img.addEventListener("load", settle, { once: true });
    img.addEventListener("error", settle, { once: true });
  });
}
