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

