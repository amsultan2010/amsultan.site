// command palette - owned by workstream ws-2
import gsap from "gsap";
import "./palette.css";

const D = { fast: 0.35, base: 0.7, slow: 1.1, epic: 1.6 };
const E = { out: "out", inOut: "inOut" };

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const isMac = () => /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);

function scrollToHash(hash) {
  // lenis intercepts scrollIntoView, so this stays smooth without importing it
  const target = document.querySelector(hash);
  if (target) target.scrollIntoView({ behavior: "smooth" });
  else location.hash = hash;
}

// urls are read off the page rather than restated here, so the palette can never
// disagree with the links a visitor can already see
function readLinks() {
  const anchors = [
    ...document.querySelectorAll(".contact-card"),
    ...document.querySelectorAll(".about-actions a"),
  ].filter((a) => a.href);

  const pick = (test) => anchors.find((a) => test(a.href, a.textContent.toLowerCase()))?.href;

  const found = [
    { label: "resume", url: pick((href, text) => text.includes("resume")) },
    { label: "github", url: pick((href) => href.includes("github.com")) },
    { label: "linkedin", url: pick((href) => href.includes("linkedin.com")) },
    { label: "x", url: pick((href) => /^(?:www\.)?(?:x|twitter)\.com$/.test(new URL(href).hostname)) },
  ];

  return found.filter((link) => link.url);
}

function buildCommands() {
  const commands = [
    { group: "sections", label: "go to work", keywords: "experience jobs", chord: "g w", glyph: "↓", run: () => scrollToHash("#work") },
    { group: "sections", label: "go to about", keywords: "bio story", chord: "g a", glyph: "↓", run: () => scrollToHash("#about") },
    { group: "sections", label: "go to contact", keywords: "email reach hire", chord: "g c", glyph: "↓", run: () => scrollToHash("#contact") },
    { group: "sections", label: "back to top", keywords: "hero start home", glyph: "↑", run: () => scrollToHash("#top") },
  ];

  for (const link of readLinks()) {
    commands.push({
      group: "links",
      label: link.label,
      keywords: "open link profile",
      glyph: "↗",
      run: () => window.open(link.url, "_blank", "noreferrer"),
    });
  }

  // no mailto lives in the page, so there is no address to copy and none is invented
  const mailto = document.querySelector('a[href^="mailto:"]');
  if (mailto) {
    const address = mailto.href.replace(/^mailto:/, "").split("?")[0];
    commands.push({
      group: "actions",
      label: "copy email address",
      keywords: "mail contact clipboard",
      glyph: "+",
      run: () => navigator.clipboard?.writeText(address),
    });
  }

  commands.push({
    group: "actions",
    label: "copy page link",
    keywords: "url share clipboard",
    glyph: "+",
    run: () => navigator.clipboard?.writeText(location.href),
  });

  return commands;
}

export function initPalette() {
  const header = document.querySelector(".site-header");
  if (!header) return;

  const commands = buildCommands();

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "palette-trigger mono";
  trigger.setAttribute("aria-label", "open command palette");
  trigger.innerHTML = `<span aria-hidden="true">${isMac() ? "⌘" : "ctrl"}k</span>`;
  header.appendChild(trigger);

  const root = document.createElement("div");
  root.className = "palette-root";
  root.innerHTML = `
    <div class="palette-scrim" aria-hidden="true"></div>
    <div class="palette-panel" role="dialog" aria-modal="true" aria-label="command palette">
      <div class="palette-field">
        <span class="palette-prompt mono" aria-hidden="true">/</span>
        <input
          class="palette-input"
          type="text"
          role="combobox"
          aria-expanded="true"
          aria-controls="palette-list"
          aria-autocomplete="list"
          aria-label="filter commands"
          placeholder="type a command"
          autocomplete="off"
          spellcheck="false"
        />
      </div>
      <div class="palette-list" id="palette-list" role="listbox" aria-label="commands"></div>
      <div class="palette-foot mono">
        <span>use ↑ ↓ to navigate, enter to run</span>
        <kbd>esc</kbd>
      </div>
    </div>`;

  const scrim = root.querySelector(".palette-scrim");
  const panel = root.querySelector(".palette-panel");
  const input = root.querySelector(".palette-input");
  const list = root.querySelector(".palette-list");

  let open = false;
  let rows = [];
  let visible = [];
  let active = 0;
  let restoreFocus = null;

  function render() {
    const query = input.value.trim().toLowerCase();
    const matches = commands.filter(
      (command) => !query || `${command.label} ${command.keywords}`.includes(query)
    );
    visible = matches;

    list.textContent = "";
    rows = [];

    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "palette-empty mono";
      empty.textContent = "no matching commands";
      list.appendChild(empty);
      return;
    }

    let group = null;
    matches.forEach((command, index) => {
      if (command.group !== group) {
        group = command.group;
        const heading = document.createElement("p");
        heading.className = "palette-group mono";
        heading.textContent = group;
        list.appendChild(heading);
      }

      const row = document.createElement("div");
      row.className = "palette-row";
      row.id = `palette-row-${index}`;
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", "false");
      row.tabIndex = -1;
      row.innerHTML = `
        <span class="palette-row-glyph" aria-hidden="true">${command.glyph}</span>
        <span class="palette-row-label">${command.label}</span>
        <span class="palette-row-chord mono">${command.chord || ""}</span>`;
      row.addEventListener("mousemove", () => select(index));
      row.addEventListener("click", () => run(command));
      list.appendChild(row);
      rows.push(row);
    });

    select(0);
  }

  function select(index) {
    if (!rows.length) return;
    active = Math.max(0, Math.min(index, rows.length - 1));
    rows.forEach((row, i) => row.setAttribute("aria-selected", String(i === active)));
    input.setAttribute("aria-activedescendant", rows[active].id);
    rows[active].scrollIntoView({ block: "nearest" });
  }

  function run(command) {
    close();
    command.run();
  }

  function lockScroll(locked) {
    if (window.__lenis?.stop) {
      if (locked) window.__lenis.stop();
      else window.__lenis.start?.();
      return;
    }
    document.body.style.overflow = locked ? "hidden" : "";
  }

  function show() {
    if (open) return;
    open = true;
    restoreFocus = document.activeElement;
    document.body.appendChild(root);
    input.value = "";
    render();
    lockScroll(true);
    trigger.setAttribute("aria-expanded", "true");
    input.focus();

    if (reducedMotion()) {
      gsap.set([scrim, panel], { clearProps: "all" });
      return;
    }

    gsap.fromTo(scrim, { opacity: 0 }, { opacity: 0.72, duration: D.fast, ease: E.out });
    gsap.fromTo(
      panel,
      { y: -12, clipPath: "inset(0% 0% 100% 0%)" },
      { y: 0, clipPath: "inset(0% 0% 0% 0%)", duration: D.fast, ease: E.out }
    );
    gsap.fromTo(
      rows,
      { opacity: 0, y: 6 },
      { opacity: 1, y: 0, duration: D.fast, ease: E.out, stagger: 0.02 }
    );
  }

  function unmount() {
    root.remove();
    gsap.set([scrim, panel], { clearProps: "all" });
  }

  function close() {
    if (!open) return;
    open = false;
    lockScroll(false);
    trigger.setAttribute("aria-expanded", "false");
    if (restoreFocus?.focus) restoreFocus.focus();
    restoreFocus = null;

    if (reducedMotion()) {
      unmount();
      return;
    }

    gsap.to(scrim, { opacity: 0, duration: D.fast, ease: E.out });
    gsap.to(panel, {
      y: -12,
      clipPath: "inset(0% 0% 100% 0%)",
      duration: D.fast,
      ease: E.out,
      onComplete: unmount,
    });
  }

  function toggle() {
    if (open) close();
    else show();
  }

  // the input is the only tab stop inside the dialog, so focus simply stays put
  function trapFocus(event) {
    event.preventDefault();
    input.focus();
  }

  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key === "Tab") {
      trapFocus(event);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      select(active + 1);
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      select(active - 1);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      const command = visible[active];
      if (command) run(command);
    }
  });

  input.addEventListener("input", render);
  scrim.addEventListener("click", close);
  trigger.addEventListener("click", show);

  let chordAt = 0;
  let chordTimer = 0;

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      toggle();
      return;
    }

    if (open || event.metaKey || event.ctrlKey || event.altKey) return;

    const target = event.target;
    const typing =
      target instanceof HTMLElement &&
      (target.isContentEditable || ["input", "textarea", "select"].includes(target.tagName.toLowerCase()));
    if (typing) return;

    const key = event.key.toLowerCase();
    if (key === "g") {
      chordAt = Date.now();
      clearTimeout(chordTimer);
      chordTimer = window.setTimeout(() => {
        chordAt = 0;
      }, 1000);
      return;
    }

    if (!chordAt || Date.now() - chordAt > 1000) return;
    const command = commands.find((entry) => entry.chord === `g ${key}`);
    chordAt = 0;
    if (command) {
      event.preventDefault();
      command.run();
    }
  });
}
