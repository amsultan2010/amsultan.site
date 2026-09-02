// draggable rotation rail, owned by workstream ws-3
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import "./rail.css";

gsap.registerPlugin(ScrollTrigger, Draggable, InertiaPlugin);

const D = { fast: 0.35, base: 0.7, slow: 1.1 };

const ITEMS = [
  {
    title: "gladiator",
    kind: "film",
    src: "/images/watchlist/movies/gladiator.jpg",
    w: 184,
    h: 274,
    alt: "gladiator poster: a helmeted roman general standing in a dust lit arena",
  },
  {
    title: "f1",
    kind: "film",
    src: "/images/watchlist/movies/f1.jpg",
    w: 600,
    h: 755,
    alt: "f1 poster: a driver in a helmet beside a formula one car on track",
  },
  {
    title: "whiplash",
    kind: "film",
    src: "/images/watchlist/movies/whiplash.jpg",
    w: 600,
    h: 800,
    alt: "whiplash poster: a young drummer lit gold behind a jazz kit",
  },
  {
    title: "the message",
    kind: "film",
    src: "/images/watchlist/movies/the-message.jpg",
    w: 267,
    h: 374,
    alt: "the message poster: a desert caravan under a wide sky",
  },
  {
    title: "interstellar",
    kind: "film",
    src: "/images/watchlist/movies/interstellar.jpg",
    w: 600,
    h: 889,
    alt: "interstellar poster: two figures walking toward a spacecraft on an empty plain",
  },
  {
    title: "the pitt",
    kind: "show",
    src: "/images/watchlist/shows/the-pitt.jpg",
    w: 600,
    h: 889,
    alt: "the pitt poster: emergency room staff in scrubs under corridor light",
  },
  {
    title: "invincible",
    kind: "show",
    src: "/images/watchlist/shows/invincible.jpg",
    w: 600,
    h: 750,
    alt: "invincible poster: an illustrated hero in a blue and yellow suit mid flight",
  },
  {
    title: "fresh prince",
    kind: "show",
    src: "/images/watchlist/shows/fresh-prince.jpg",
    w: 600,
    h: 901,
    alt: "the fresh prince of bel air poster: the cast posed in bright nineties colour",
  },
  {
    title: "suits",
    kind: "show",
    src: "/images/watchlist/shows/suits.jpg",
    w: 600,
    h: 882,
    alt: "suits poster: two lawyers in tailored suits against a glass office tower",
  },
  {
    title: "how to be a straight-a student",
    kind: "book",
    src: "/images/watchlist/books/straight-a-student.jpg",
    w: 600,
    h: 927,
    alt: "book cover for how to be a straight-a student, typographic with a red band",
  },
  {
    title: "quran",
    kind: "book",
    src: "/images/watchlist/books/quran.jpg",
    w: 600,
    h: 896,
    alt: "cover of the quran with gold arabic calligraphy on a dark ground",
  },
  {
    title: "never eat alone",
    kind: "book",
    src: "/images/watchlist/books/never-eat-alone.jpg",
    w: 600,
    h: 913,
    alt: "book cover for never eat alone, bold title type on a plain field",
  },
];

function buildItem(item, isClone) {
  const figure = document.createElement("figure");
  figure.className = "rail-item";
  if (isClone) figure.setAttribute("aria-hidden", "true");

  const cover = document.createElement("div");
  cover.className = "rail-cover";

  const img = document.createElement("img");
  img.src = item.src;
  img.alt = item.alt;
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

  const kind = document.createElement("span");
  kind.className = "mono rail-kind";
  kind.textContent = item.kind;

  inner.append(title, kind);
  caption.append(inner);
  figure.append(cover, caption);

  return figure;
}

function buildSection() {
  const section = document.createElement("section");
  section.className = "rail";
  section.setAttribute("aria-label", "in rotation");

  const head = document.createElement("div");
  head.className = "rail-head";

  const label = document.createElement("p");
  label.className = "mono rail-label";
  label.textContent = "in rotation";

  const hint = document.createElement("p");
  hint.className = "mono rail-hint";
  hint.textContent = "drag";

  head.append(label, hint);

  const viewport = document.createElement("div");
  viewport.className = "rail-viewport";

  const track = document.createElement("div");
  track.className = "rail-track";

  // two identical runs, so an xPercent wrap of -50 lands on a matching frame
  ITEMS.forEach((item) => track.append(buildItem(item, false)));
  ITEMS.forEach((item) => track.append(buildItem(item, true)));

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
    allowNativeTouchScrolling: false,
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
  const items = [...track.children];

  items.forEach((item) => {
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
    scrollTrigger: { trigger: section, start: "top 85%", once: true },
  });
}

export function initRail() {
  const lead = document.querySelector(".lead");
  if (!lead) return;

  const { section, viewport, track } = buildSection();
  lead.after(section);

  const mm = gsap.matchMedia();

  mm.add(
    {
      fine: "(hover: hover) and (pointer: fine)",
      reduce: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { fine, reduce } = context.conditions;
      const playful = fine && !reduce;

      viewport.classList.toggle("is-scroller", !playful);

      if (!playful) {
        gsap.set(track, { x: 0, xPercent: 0 });
        gsap.set(track.querySelectorAll(".rail-caption-inner"), {
          yPercent: 0,
          autoAlpha: 1,
        });
        if (!reduce) initEntrance(section, track, 24);
        return;
      }

      const auto = gsap.to(track, {
        xPercent: -50,
        duration: 90,
        ease: "none",
        repeat: -1,
        modifiers: { xPercent: gsap.utils.wrap(-50, 0) },
      });

      const drag = initDrag(track, auto);
      initHover(track);
      initEntrance(section, track, 40);

      // a subtle speed bias: fast scrolling pushes the rail along, then it eases
      // back to its own pace rather than staying stuck at the boosted speed
      const bias = gsap.utils.clamp(1, 2.4);
      const speed = { value: 1 };
      const nudge = ScrollTrigger.create({
        onUpdate: (self) => {
          if (drag.isPressed || drag.isThrowing) return;
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
        drag.kill();
        auto.kill();
        gsap.set(track, { x: 0, xPercent: 0, clearProps: "cursor" });
      };
    },
  );

  // the section lands after first paint, so every trigger below it is stale.
  // the covers carry an aspect-ratio, so height is known before the bytes are,
  // and the second refresh only catches anything that settles late
  requestAnimationFrame(() => ScrollTrigger.refresh());

  const images = [...section.querySelectorAll("img")];
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
