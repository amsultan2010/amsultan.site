# amsultan.site

Abdullah Sultan's portfolio, live at https://www.amsultan.site. One hand-written page in HTML, CSS
and vanilla JavaScript: no framework, no TypeScript, no tests, no linter. Vite 8.1 builds it, GSAP
3.15 and Lenis 1.3 move it, Vercel hosts it. Node 24 (`.nvmrc`). The repo is public, MIT licensed.

## Commands

- `npm run dev` starts Vite. `.claude/launch.json` already runs it as `vite-dev` on port 4321.
- `npm run build` writes `dist/`, `npm run preview` serves it. `npm run check` is the same build.

## Code map

- `index.html` the whole site: every word, the meta tags and the JSON-LD. It holds three views,
  one shown at a time (ADR 0001): me at `/` (`#top`, the marquee, `#about`), work at `/work`
  (`#work` headed "built", `#proof` headed "lead", `#record`) and life at `/life` (the rails).
  `#contact` and the footer end every view. An inline head script sets `html[data-view]` from the
  path before first paint, and css shows only that `.view[data-view-name]`.
- `404.html` the second Vite entry. Its styles are inline; it does not load `src/styles.css`.
- `src/main.js` all page motion, as `init*` functions called in order at the bottom of the file.
  `initRouter` swaps views in place (`requestView`, `swapView`, `showView`). `buildView` puts one
  view's motion (`buildMe`, `buildWork` or `buildLife`, plus `buildContact` and `buildCounters`)
  in a `gsap.context` that is reverted when the view is left. `initMotion` runs the header intro
  and the first view's motion once the loader is done.
- `src/scroll.js` Lenis setup and `lockScroll(owner, locked)`.
- `src/rail.js` the two draggable rails, built from the `OBJECTS` and `WATCHING` arrays and
  mounted into the life view. Their markup is not in `index.html`. `buildRails()` builds their
  motion and returns its cleanup.
- `src/visits.js` the visit counter, which injects itself into `.site-header`.
- `src/styles.css` tokens in `:root`, then one block per section. Each module imports its own css.
- `src/network.js` `createNetwork(canvas, { ground, ahead })`, the 8-12-12-8 neural network drawn
  on a canvas in `.loader` and behind `.about-statement`. `network.css` places each canvas.
- `api/visits.js` the Vercel function behind the counter, stored in Vercel KV.
- `public/` served as is. `robots.txt`, `sitemap.xml` and `llms.txt` are maintained by hand.

## Conventions

- All page text is lowercase, brand names included. `body` sets `text-transform: lowercase`;
  `button` and `input` need it set on them. Meta tags, JSON-LD and `llms.txt` keep case.
- Colour is `--orange` (the page ground), `--cream` and `--ink`. Fonts are Unbounded (`.display`),
  Newsreader (`.serif`) and IBM Plex Mono (`.mono`), loaded from Google Fonts.
- Radii are 0, or fully round on dots. Shadows are hard offsets with zero blur. Rules are 2px
  `--ink`. Hover lifts an element off its shadow and `:active` sinks it back.
- Rows about another product wear that product's own colours: `--fs-*`, `--cc-*`, `--df-*`, `--zc`.
- Motion is bound in `main.js` by class selector. Markup hooks: `data-split`, `data-count` with
  `data-pad`, `data-cursor`, `data-tag`, `data-dir`, `data-shape`, `data-view-link`,
  `data-back-to-top`, `.magnetic`.
- There are no `#` links. A link to a view is a real `<a href>` to `/`, `/work` or `/life` with
  `data-view-link`, so it works without JS and in a new tab.
- Durations come from `D` (fast 0.35, base 0.7, slow 1.1, epic 1.6), eases are `"out"` and
  `"inOut"`. A plain hover is a CSS transition; GSAP takes it only when it is choreographed.
- One owner per property. Where a `quickTo` or a hover owns `x`, `y` or `scale`, the entrance uses
  `yPercent`, a clip-path or a fade, and ends with `clearProps`.
- Every `repeat: -1` tween is paused off screen by a ScrollTrigger `onToggle`. Each effect checks
  `finePointer()` and `reducedMotion()` itself.
- Run the `anti-ai-site` and `gsap-max` skills before shipping visual changes.

## Deploy

Vercel project `abdullahsultan`, connected to GitHub `amsultan2010/amsultan.site`. A push to `main`
deploys production. Any other pushed branch gets a preview, which is `noindex` and behind Vercel
login. `amsultan.site` redirects to `www.amsultan.site`, the canonical host. Env vars, read only by
`api/visits.js`: `KV_REST_API_URL`, `KV_REST_API_TOKEN`.

## Gotchas

- `D` and `E` are redeclared in `main.js`, `rail.js` and `visits.js`. The eases are
  CustomEases created in the body of `main.js`, so other modules use them only inside `init*`.
- With Lenis running, `overflow: hidden` on `body` holds nothing. Use `lockScroll`, and put
  `data-lenis-prevent` on anything that scrolls inside an overlay. `lenis` is undefined on touch.
- Vite does not serve `/api/visits`, so the counter never mounts locally. The loader shows once per
  tab (`sessionStorage` key `loader-seen`).
- JS breakpoints mirror CSS ones: 900px hero pin, 960px menu, 820px and 700px scroll drifts.
- A view's path lives in three places: the head script in `index.html`, `PATHS` in `main.js` and
  the rewrites in `vercel.json`. Vite serves `index.html` at any path locally, but Vercel
  rewrites only `/work` and `/life`, so a new view needs all three or it 404s in production.
- Motion for anything inside a view is created in that view's `build*` function, or through
  `ctx.add` when it starts later, so the context's revert kills it. Built anywhere else, it keeps
  running in a hidden view. Pointer behaviours are bound once in `init*` and must not be rebuilt.
- Facts are repeated by hand. A changed number means the body copy, its `data-count`, the meta and
  social descriptions, the JSON-LD, `public/llms.txt` and `lastmod` in `public/sitemap.xml`.
- Colour values are copied into `404.html` and `theme-color`.
- The resume is `public/resume.pdf`, served only at `/resume` by a rewrite in `vercel.json`, which
  also redirects `/resume.pdf` and `/resume.html` there. Vite skips `vercel.json`, so locally
  `/resume` is not the PDF. To update it, replace the file.
- Images are absolute `/images/...` strings, so Vite never checks them. A `data-tag="x"` chip needs
  `public/images/tags/x.jpg`, and a new rail object needs a measured `trim` box.
- Stale, safe to ignore: `.vscode/`, `.env.example`, the root `images/` folder, `dev/` (not in the
  build), and the Vercel dashboard's Astro preset (`vercel.json` overrides it).

## Agent skills

### Issue tracker

GitHub Issues on `amsultan2010/amsultan.site`, through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five defaults, each label named after its role: `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` (the view and section names) and `docs/adr/` at the repo root.
See `docs/agents/domain.md`.
