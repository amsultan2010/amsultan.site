import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// stays undefined on touch and under reduced motion, where the page scrolls natively
export let lenis;

export function initSmoothScroll() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) return null;

  // touch devices keep their own momentum scrolling. lenis re-implements it in
  // javascript, which on a phone is slower than the thing it replaces
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return null;

  lenis = new Lenis({
    autoRaf: false,
    duration: 1.15,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.2,
  });

  lenis.on("scroll", ScrollTrigger.update);

  const tick = (time) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

const locks = new Set();

// lenis scrolls from script, which a hidden overflow on body does nothing to
// stop, so with lenis running the only way to hold the page is to stop it.
// without it the overflow is enough. the palette, the loader and the menu each
// hold under their own name, so one closing cannot let go for another
export function lockScroll(owner, locked) {
  if (locked) locks.add(owner);
  else locks.delete(owner);

  const held = locks.size > 0;
  if (lenis) {
    if (held) lenis.stop();
    else lenis.start();
    return;
  }
  document.body.style.overflow = held ? "hidden" : "";
}
