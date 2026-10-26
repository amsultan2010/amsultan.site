// draggable rails: the objects i actually keep around, two rows of small games,
// then film and show covers. together they are the whole life view.
// the markup is built once, the motion each time life is shown
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
  { title: "jojo's bizarre\u00a0adventure", kind: "show", src: "/images/watchlist/shows/jojo.jpg", w: 311, h: 440,
    alt: "jojo's bizarre adventure steel ball run poster: riders racing horses down a desert canyon under a blue sky" },
];

// two rows, in this order. a clip name loads /videos/<clip>.mp4 and .jpg.
// a game with no clip yet gets a still until the video exists.
// tesla tricks has no grok link yet, so it still opens the old artifact
const GAMES_TOP = [
  { title: "parselands", kind: "an endless runner where a llama parses pdfs", clip: "parselands",
    href: "https://parselands.grok.me" },
  { title: "flipside", kind: "a puzzle on a mobius strip", clip: "flipside",
    href: "https://flipside-game.grok.me" },
  { title: "saudi surfers", kind: "subway surfers, but in riyadh, past its famous landmarks", clip: "saudisurfers",
    href: "https://saudisurfers.grok.me" },
  { title: "tesla tricks", kind: "a game built around the tesla roadster", clip: "tesla",
    href: "https://claude.ai/artifact/4eraPAM9XVeLjrtHuSkobX" },
];

const GAMES_BOTTOM = [
  { title: "five nights at altman's", kind: "five nights at freddy's, with tech execs", clip: "fnaa",
    href: "https://fnaa.grok.me" },
  { title: "f1 but it's minecraft", kind: "formula one, in minecraft",
    href: "https://f1butitsminecraft.grok.me" },
  { title: "flappy jay", kind: "a flappy bird game",
    href: "https://flappyjay.grok.me" },
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

function buildImage(item, isClone) {
  const img = document.createElement("img");
  img.src = item.src;
  img.alt = isClone ? "" : item.alt;
  img.width = item.w;
  img.height = item.h;
  img.loading = "lazy";
  img.decoding = "async";
  img.draggable = false;
  return img;
}

// playClips in main.js plays and pauses every data-clip video with its view
function buildClip(name) {
  const video = document.createElement("video");
  video.className = "rail-video";
  video.dataset.clip = "";
  video.src = `/videos/${name}.mp4`;
  video.poster = `/videos/${name}.jpg`;
  video.width = 960;
  video.height = 540;
  // the property is what autoplay checks, the attribute is what ios reads
  video.muted = true;
  video.setAttribute("muted", "");
  video.loop = true;
  video.playsInline = true;
  video.preload = "none";
  video.setAttribute("aria-hidden", "true");
  return video;
}

// a game with no clip yet. the title under the frame already names it
function buildHold(item) {
  const hold = el(
    "span",
    "rail-hold",
    el("span", "rail-hold-name", item.title),
    el("span", "mono rail-hold-note", "clip soon"),
  );
  hold.setAttribute("aria-hidden", "true");
  return hold;
}

function buildItem(item, variant, isClone) {
  const figure = document.createElement("figure");
  figure.className = `rail-item rail-item-${variant}`;
  if (isClone) figure.setAttribute("aria-hidden", "true");
  if (item.trim) fitObject(figure, item);

  // a stuff cover is the link to its game. the kind line only shows on hover,
  // so the link carries its own name
  const cover = document.createElement(item.href ? "a" : "div");
  cover.className = "rail-cover";
  if (item.href) {
    cover.href = item.href;
    cover.target = "_blank";
    cover.rel = "noreferrer";
    cover.dataset.cursor = "open";
    cover.setAttribute("aria-label", `${item.title}, ${item.kind}`);
    if (isClone) cover.tabIndex = -1;
  }
  if (item.clip) cover.append(buildClip(item.clip));
  else if (item.src) cover.append(buildImage(item, isClone));
  else cover.append(buildHold(item));

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
    // a stuff line is a band across the foot of its clip, so the caption under
    // the clip is the title alone
    (item.href ? cover : inner).append(kind);
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

// the word again in outline, fainter each time, running off toward the edge.
// the same echo the section heads in work have, and it drifts on scroll like theirs
function buildEcho(word) {
  const run = el("span", "section-echo-run", ...Array.from({ length: 6 }, () => el("i", "", word)));
  const echo = el("span", "section-echo", run);
  echo.setAttribute("aria-hidden", "true");
  return echo;
}

// the label and its echo, then a ruler whose playhead tracks the loop, then the
// drag hint
function buildHead(label) {
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
    buildEcho(label.slice(cut)),
    ruler,
    el("div", "rail-cell rail-cell-hint", masked("mono rail-hint", "drag"), buildArrow()),
  );
}

// stupid stuff keeps the head it had as its own section: the word, its outline
// echoing off to the edge, then a count. main.js splits the word into chars and
// counts the number up, the same as every other section head
function buildSectionHead(label, echo, count, note) {
  const title = el("h2", "section-display", label);
  title.dataset.split = "";

  const number = el("b", "display", String(count).padStart(2, "0"));
  number.dataset.count = count;
  number.dataset.pad = "2";

  return el("header", "section-head", title, buildEcho(echo), el("p", "section-meta", number, el("span", "mono", note)));
}

function buildTrack(items, variant) {
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

  // one run has to be wider than the screen or the wrap shows a gap. fewer
  // games means a wider frame
  if (variant === "stuff") {
    track.style.setProperty("--stuff-w", items.length < 4 ? "34vw" : "28vw");
  }

  // two identical runs, so an xPercent wrap of -50 lands on a matching frame
  items.forEach((item) => track.append(buildItem(item, variant, false)));
  items.forEach((item) => track.append(buildItem(item, variant, true)));

  viewport.append(track);
  return { viewport, track };
}

function buildSection({ items, label, variant, echo, note }) {
  const section = document.createElement("section");
  section.className = `rail rail-${variant}`;
  section.setAttribute("aria-label", label);

  const head = echo
    ? buildSectionHead(label, echo, items.length, note)
    : buildHead(label);

  const { viewport, track } = buildTrack(items, variant);
  section.append(head, viewport);

  return { section, head, viewport, track };
}

// the auto scroll owns xPercent, the drag owns x. handing the offset between the
// two on press and release keeps a single wrapped value instead of two that can
// drift past each other
function initDrag(track, auto, setHead, onScreen, toProgress) {
  const runWidth = () => track.offsetWidth / 2;
  let handedOver = false;

  const takeOver = () => {
    auto.pause();
    // mid throw the offset is already in x, so both are summed
    const px =
      gsap.getProperty(track, "x") +
      (gsap.getProperty(track, "xPercent") / 100) * track.offsetWidth;
    gsap.set(track, { xPercent: 0, x: px });
    handedOver = false;
  };

  const handBack = () => {
    if (handedOver) return;
    handedOver = true;
    const px = gsap.utils.wrap(-runWidth(), 0)(gsap.getProperty(track, "x"));
    const xPercent = (px / track.offsetWidth) * 100;
    gsap.set(track, { x: 0, xPercent });
    auto.progress(toProgress(-xPercent / 50));
    // a throw can end off screen, where the inView trigger has parked the loop
    if (onScreen()) auto.play();
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

// the hover is rebuilt on every visit to life, so it hands back a cleanup that
// takes its listeners off again. otherwise each visit would add another set
function initHover(track) {
  const unbind = [...track.children].map((item) => {
    const cover = item.querySelector(".rail-cover");
    // a stuff title stays on screen, so only the line under it is revealed
    const caption = item.querySelector(
      item.matches(".rail-item-stuff") ? ".rail-kind" : ".rail-caption-inner",
    );

    gsap.set(caption, { yPercent: 105, autoAlpha: 0 });

    // the caption box rides up with the cover, since on a fine pointer it sits
    // over the cover's foot rather than under it
    const box = item.querySelector(".rail-caption");

    const tl = gsap
      .timeline({ paused: true, defaults: { ease: "out" } })
      .to([cover, box], { y: -14, duration: D.fast }, 0)
      .to(cover, { scale: 1.04, duration: D.fast }, 0)
      .to(caption, { yPercent: 0, autoAlpha: 1, duration: D.base }, 0.05);

    const enter = () => {
      item.classList.add("is-hot");
      track.classList.add("is-dimmed");
      tl.play();
    };

    const leave = () => {
      item.classList.remove("is-hot");
      track.classList.remove("is-dimmed");
      tl.reverse();
    };

    item.addEventListener("pointerenter", enter);
    item.addEventListener("pointerleave", leave);

    return () => {
      item.removeEventListener("pointerenter", enter);
      item.removeEventListener("pointerleave", leave);
      item.classList.remove("is-hot");
    };
  });

  return () => {
    unbind.forEach((off) => off());
    track.classList.remove("is-dimmed");
  };
}

// the hover owns each cover's y, so the entrance travels on yPercent
function initEntrance(trigger, track, travel) {
  const covers = [...track.querySelectorAll(".rail-cover")];

  return gsap.from(covers, {
    clipPath: "inset(0% 0% 100% 0%)",
    yPercent: travel,
    duration: D.slow,
    stagger: 0.045,
    ease: "out",
    scrollTrigger: { trigger, start: "top 85%", once: true },
  });
}

// one shot, as the bar itself comes into view: the label rises out of its mask,
// the ticks run out from the left, then the two mono cells follow
function initHeadEntrance(head) {
  const [label, hint] = head.querySelectorAll(".rail-rise");

  return gsap
    .timeline({
      defaults: { ease: "out" },
      scrollTrigger: { trigger: head, start: "top 88%", once: true },
    })
    .from(label, { yPercent: 125, duration: D.slow }, 0)
    .from(head.querySelectorAll(".section-echo i"), { xPercent: 70, autoAlpha: 0, duration: D.slow, stagger: 0.06 }, 0.12)
    .from(head.querySelector(".rail-ticks"), { scaleX: 0, duration: D.slow }, 0.1)
    .from(hint, { yPercent: 125, duration: D.base }, 0.3)
    .from(head.querySelector(".rail-playhead"), { scaleY: 0, duration: D.fast }, 0.5)
    .from(head.querySelector(".rail-arrow"), { scaleX: 0, duration: D.base }, 0.5);
}

// the section heads in work enter the same way: the chars rise out of the
// word's padding, the echoes slide in, and the count opens from its edge
function initSectionHeadEntrance(head) {
  return gsap
    .timeline({
      defaults: { ease: "out" },
      scrollTrigger: { trigger: head, start: "top 88%", once: true },
    })
    .from(head.querySelectorAll(".split-char"), { yPercent: 125, duration: D.slow, stagger: 0.03 }, 0)
    .from(head.querySelectorAll(".section-echo i"), { xPercent: 70, autoAlpha: 0, duration: D.slow, stagger: 0.06 }, 0.12)
    .fromTo(
      head.querySelector(".section-meta"),
      { clipPath: "inset(0% 0% 0% 100%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: D.base, ease: "inOut", clearProps: "clipPath" },
      0.2,
    );
}

// the rails mounted into life, in page order, for buildRails to animate
const rails = [];

function mountRail({ view, items, label, echo, note, variant, duration, reverse = false }) {
  const { section, head, viewport, track } = buildSection({ items, label, variant, echo, note });
  view.append(section);
  rails.push({ section, head, viewport, track, duration, reverse });
}

// one rail's motion, reverted with the matchMedia this returns
function animateRail({ head, viewport, track, duration, reverse }, index) {
  // a section head has no ruler and no drag hint, and the second game row has
  // no head of its own. both can be missing
  const carriage = head?.querySelector(".rail-carriage") ?? null;
  const arrow = head?.querySelector(".rail-arrow") ?? null;
  const mm = gsap.matchMedia();

  // matchMedia only runs this when at least one condition matches, so the
  // motion pair guarantees it runs on touch devices too
  mm.add(
    {
      fine: "(hover: hover) and (pointer: fine)",
      wide: "(min-width: 701px)",
      motion: "(prefers-reduced-motion: no-preference)",
      reduce: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { fine, wide, reduce } = context.conditions;

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
      const setX = carriage ? gsap.quickSetter(carriage, "xPercent") : () => {};
      const setHead = (progress) => setX(progress * 100);

      // a reversed rail runs the same loop from the other end. its place along
      // the track, read as 0 to 1 from the left, is then the tween's progress flipped
      const toProgress = (place) => (reverse ? 1 - place : place);
      const auto = gsap.fromTo(track, { xPercent: reverse ? -50 : 0 }, {
        xPercent: reverse ? 0 : -50,
        duration,
        ease: "none",
        repeat: -1,
        modifiers: { xPercent: gsap.utils.wrap(-50, 0) },
        onUpdate() {
          setHead(toProgress(this.progress()));
        },
      });

      const drag = initDrag(track, auto, setHead, () => inView.isActive, toProgress);
      let unhover = null;
      if (fine) {
        unhover = initHover(track);
      } else {
        // no hover on touch, so the captions just stay on screen
        gsap.set(track.querySelectorAll(".rail-caption-inner"), { yPercent: 0, autoAlpha: 1 });
      }
      if (carriage) initHeadEntrance(head);
      else if (head) initSectionHeadEntrance(head);
      initEntrance(viewport, track, fine ? 12 : 10);

      // the echo is hidden on a phone, so it only drifts where it shows. it runs
      // away from the word, so a gap opens rather than a letter being cut, and
      // each rail drifts at its own rate, the way the heads in work do
      if (wide && head) {
        gsap.fromTo(
          head.querySelector(".section-echo-run"),
          { xPercent: 0 },
          {
            xPercent: [9, 15, 6][index % 3],
            ease: "none",
            scrollTrigger: { trigger: head, start: "top bottom", end: "bottom top", scrub: 0.5 + (index % 3) * 0.25 },
          },
        );
      }

      // the drag hint leans a few pixels either way, slowly, so the bar is never
      // completely still while the rail is on screen
      const sway = arrow && gsap.fromTo(
        arrow,
        { x: -3 },
        { x: 3, duration: 1.6, ease: "inOut", repeat: -1, yoyo: true },
      );

      // an off screen rail still costs a transform write every frame, so park it
      // until it is actually in view
      const inView = ScrollTrigger.create({
        trigger: viewport,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => {
          // the hint is no part of the drag handover, so it parks either way
          sway?.paused(!self.isActive);
          if (drag.isPressed || drag.isThrowing) return;
          if (self.isActive) auto.play();
          else auto.pause();
        },
      });
      if (!inView.isActive) {
        auto.pause();
        sway?.pause();
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
        unhover?.();
        gsap.killTweensOf(speed);
        nudge.kill();
        inView.kill();
        drag.kill();
        sway?.kill();
        auto.kill();
        gsap.set(track, { x: 0, xPercent: 0, clearProps: "cursor" });
        if (carriage) gsap.set(carriage, { clearProps: "transform" });
      };
    },
  );

  return mm;
}

// called by main.js each time life is shown. the cleanup it returns reverts
// every rail's matchMedia, which runs the cleanup above: loop, drag, hover,
// sway, parking and nudge all stop, and the entrances are ready to replay
export function buildRails() {
  const motion = rails.map(animateRail);
  return () => motion.forEach((mm) => mm.revert());
}

// one section head, two tracks. the head counts every game. each track runs
// the other way from the rail above it
function mountGames(view) {
  const rows = [
    { items: GAMES_TOP, duration: 56, reverse: true },
    { items: GAMES_BOTTOM, duration: 40, reverse: false },
  ];
  const section = document.createElement("section");
  section.className = "rail rail-stuff";
  section.setAttribute("aria-label", "stupid stuff i made");

  const head = buildSectionHead(
    "stupid stuff i made",
    "stuff",
    rows.reduce((sum, row) => sum + row.items.length, 0),
    "small games, every one opens",
  );
  section.append(head);

  rows.forEach((row, index) => {
    const { viewport, track } = buildTrack(row.items, "stuff");
    section.append(viewport);
    rails.push({
      section,
      head: index === 0 ? head : null,
      viewport,
      track,
      duration: row.duration,
      reverse: row.reverse,
    });
  });

  view.append(section);
}

export function initRail() {
  const view = document.querySelector('.view[data-view-name="life"]');
  if (!view) return;

  // the stack first, then the two game rows, then the watchlist. each one
  // runs the other way from the one above it
  mountRail({
    view,
    items: shuffle(OBJECTS),
    label: "my personal stack",
    variant: "object",
    // one run of the track per duration, so a longer run needs more seconds
    // just to hold its pace
    duration: 52,
  });

  mountGames(view);

  mountRail({
    view,
    items: shuffle(WATCHING),
    label: "current watchlist",
    variant: "poster",
    duration: 30,
    reverse: true,
  });

  // the sections land after first paint, so when life is the first view every
  // trigger below them is stale. the covers carry their size, so height is
  // known before the bytes are and no image load needs another refresh
  requestAnimationFrame(() => ScrollTrigger.refresh());
}
