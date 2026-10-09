// lifetime visit counter, owned by workstream ws-2
import gsap from "gsap";
import "./visits.css";

const D = { fast: 0.35, base: 0.7, slow: 1.1, epic: 1.6 };
const E = { out: "out", inOut: "inOut" };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// the counter only increments once per browser session, so a reload is not a visit
function shouldBump() {
  try {
    if (sessionStorage.getItem("visited")) return false;
    sessionStorage.setItem("visited", "1");
    return true;
  } catch {
    return false;
  }
}

export function initVisits() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const element = document.createElement("p");
  element.className = "visit-counter mono";
  element.setAttribute("aria-live", "polite");
  element.innerHTML = '<span>lifetime visits:</span> <span class="visit-counter-value"></span>';
  const value = element.querySelector(".visit-counter-value");

  const format = (n) => n.toLocaleString("en-US");

  fetch(`/api/visits${shouldBump() ? "?bump=1" : ""}`, { headers: { accept: "application/json" } })
    .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
    .then((data) => {
      // a made up number is worse than no number, and a label that mounts then
      // vanishes is worse than none, so it only joins the header once a real count lands
      if (data.unconfigured || !Number.isFinite(data.count)) throw new Error("no count");
      header.insertBefore(element, header.querySelector(".header-cta"));

      if (reducedMotion()) {
        value.textContent = format(data.count);
        return;
      }

      const state = { value: 0 };
      gsap.to(state, {
        value: data.count,
        duration: D.slow,
        ease: E.out,
        snap: { value: 1 },
        onUpdate: () => {
          value.textContent = format(Math.round(state.value));
        },
      });
    })
    .catch(() => element.remove());
}
