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

const OBJECTS = [
  { title: "the kicks", src: "/images/objects/shoes.png", w: 520, h: 346,
    alt: "a pair of red and white nike air jordan 1 high top sneakers" },
  { title: "where i learn", src: "/images/objects/aisr.png", w: 314, h: 313,
    alt: "the american international school riyadh seal, an open book inside a blue and gold ring" },
  { title: "what i code on", src: "/images/objects/macbook.png", w: 520, h: 520,
    alt: "a midnight blue macbook air open, showing a blue wallpaper" },
  { title: "pokemon of choice", src: "/images/objects/garchomp.png", w: 496, h: 520,
    alt: "garchomp, a navy and red land shark dragon pokemon, mid roar" },
  { title: "what i write on", src: "/images/objects/ipad.png", w: 311, h: 520,
    alt: "a blue ipad air seen from the front and back at an angle" },
  { title: "home", src: "/images/objects/saudi.png", w: 520, h: 346,
    alt: "the flag of saudi arabia, white arabic script and a sword on green" },
  { title: "my sport", src: "/images/objects/tennis.webp", w: 520, h: 520,
    alt: "a bright green felt tennis ball with a white seam" },
  { title: "how i relax", src: "/images/objects/steamdeck.png", w: 520, h: 292,
    alt: "a steam deck handheld console running a game on its screen" },
  { title: "who i support", src: "/images/objects/astonmartin.png", w: 520, h: 520,
    alt: "the aston martin cognizant formula one team wordmark and winged badge" },
  { title: "smash main", src: "/images/objects/incineroar.png", w: 247, h: 241,
    alt: "incineroar, a red and black wrestler cat pokemon, in a fighting stance" },
  { title: "my second brain", src: "/images/objects/claude.png", w: 520, h: 112,
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

function buildItem(item, variant, isClone) {
  const figure = document.createElement("figure");
  figure.className = `rail-item rail-item-${variant}`;
  if (isClone) figure.setAttribute("aria-hidden", "true");

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

function buildSection({ items, label, variant }) {
  const section = document.createElement("section");
  section.className = `rail rail-${variant}`;
  section.setAttribute("aria-label", label);

  const head = document.createElement("div");
  head.className = "rail-head";

  // the last word carries the accent, the same split the about statement uses
  const cut = label.lastIndexOf(" ") + 1;
  const accent = document.createElement("span");
  accent.className = "rail-label-accent";
  accent.textContent = label.slice(cut);

  const heading = document.createElement("p");
  heading.className = "display rail-label";
  heading.append(label.slice(0, cut), accent);

  const hint = document.createElement("p");
  hint.className = "mono rail-hint";
  hint.textContent = "drag";

  head.append(heading, hint);

  const viewport = document.createElement("div");
  viewport.className = "rail-viewport";

  const track = document.createElement("div");
  track.className = "rail-track";

  // two identical runs, so an xPercent wrap of -50 lands on a matching frame
  items.forEach((item) => track.append(buildItem(item, variant, false)));
  items.forEach((item) => track.append(buildItem(item, variant, true)));

  viewport.append(track);
  section.append(head, viewport);

  return { section, viewport, track };
}

// the auto scroll owns xPercent, the drag owns x. handing the offset between the
// two on press and release keeps a single wrapped value instead of two that can
// drift past each other
function initDrag(track, auto) {
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
    gsap.set(track, { x: gsap.utils.wrap(-runWidth(), 0)(this.x) });
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

function mountRail({ anchor, position, items, label, variant, duration }) {
  if (!anchor) return;

  const { section, viewport, track } = buildSection({ items, label, variant });
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

      const auto = gsap.to(track, {
        xPercent: -50,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: { xPercent: gsap.utils.wrap(-50, 0) },
      });

      const drag = initDrag(track, auto);
      if (fine) {
        initHover(track);
      } else {
        // no hover on touch, so the captions just stay on screen
        gsap.set(track.querySelectorAll(".rail-caption-inner"), { yPercent: 0, autoAlpha: 1 });
      }
      initEntrance(section, track, fine ? 40 : 24);

      // an off screen rail still costs a transform write every frame, so park it
      // until it is actually in view
      const inView = ScrollTrigger.create({
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          if (drag.isPressed || drag.isThrowing) return;
          if (self.isActive) auto.play();
          else auto.pause();
        },
      });
      if (!inView.isActive) auto.pause();

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
        auto.kill();
        gsap.set(track, { x: 0, xPercent: 0, clearProps: "cursor" });
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
      variant: "object",
      // one run of the track per duration, so a longer run needs more seconds
      // just to hold its pace
      duration: 48,
    }),
  );

  sections.push(
    mountRail({
      anchor: document.querySelector(".lead"),
      position: "after",
      items: shuffle(WATCHING),
      label: "current watchlist",
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
