import gsap from "gsap";
import { inject } from "@vercel/analytics";
import "./styles.css";
import "./resume.css";

inject({ mode: import.meta.env.DEV ? "development" : "production" });

// the hero's contour field and shapes drift behind the resume as they do on me.
// the field is fixed, so it is always on screen and the loops never need parking
if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const loop = { repeat: -1, yoyo: true, ease: "sine.inOut" };

  gsap.to(".topo-drift", { x: 36, y: -18, duration: 12, ...loop });
  gsap.utils.toArray(".topo-layer").forEach((layer, index) =>
    gsap.to(layer, {
      x: index % 2 === 0 ? -22 : 26,
      y: index % 2 === 0 ? 14 : -16,
      duration: 8 + index * 2.5,
      ...loop,
    }),
  );
  gsap.to(".hero-topo", { opacity: 0.42, duration: 5, ...loop });

  gsap.utils.toArray("[data-shape]").forEach((shape, index) =>
    gsap.to(shape, {
      x: index % 2 === 0 ? 12 : -12,
      y: -14 - ((index * 7) % 22),
      rotate: `+=${index % 2 === 0 ? 8 : -8}`,
      transformOrigin: "50% 50%",
      duration: 2.2 + (index % 5) * 0.25,
      delay: index * 0.1,
      ...loop,
    }),
  );
}
