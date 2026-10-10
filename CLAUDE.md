# amsultan.site

Abdullah Sultan's portfolio, live at https://www.amsultan.site. One hand-written page in HTML, CSS
and vanilla JavaScript: no framework, no TypeScript, no tests, no linter. Vite 8.1 builds it, GSAP
3.15 and Lenis 1.3 move it, Vercel hosts it. Node 24 (`.nvmrc`). The repo is public, MIT licensed.

## Commands

- `npm run dev` starts Vite. `.claude/launch.json` already runs it as `vite-dev` on port 4321.
- `npm run build` writes `dist/`, `npm run preview` serves it. `npm run check` is the same build.

## Code map

- `index.html` the whole site: every word, the meta tags and the JSON-LD. Sections are `#top`,
  `#about`, `#work` (headed "built"), `#proof` (headed "lead"), `#record` and `#contact`.
- `404.html` the second Vite entry. Its styles are inline; it does not load `src/styles.css`.
- `src/main.js` all page motion, as `init*` functions called in order at the bottom of the file.
  `initMotion` (the intro and every scroll reveal) only runs once the loader is done.
- `src/scroll.js` Lenis setup and `lockScroll(owner, locked)`.
- `src/rail.js` the two draggable rails, built from the `OBJECTS` and `WATCHING` arrays and
  inserted after `.about` and `.lead`. Their markup is not in `index.html`.
- `src/palette.js` (cmd/ctrl+k palette) and `src/visits.js` (visit counter) inject themselves into
  `.site-header`. The palette reads its links off `.contact-card` and `.about-actions a`.
- `src/styles.css` tokens in `:root`, then one block per section. Each module imports its own css.
- `api/visits.js` the Vercel function behind the counter, stored in Vercel KV.
- `public/` served as is. `robots.txt`, `sitemap.xml` and `llms.txt` are maintained by hand.

## Conventions

- All page text is lowercase, brand names included. `body` sets `text-transform: lowercase`;
  `button`, `input` and `kbd` need it set on them. Meta tags, JSON-LD and `llms.txt` keep case.
- Colour is `--orange` (the page ground), `--cream` and `--ink`. Fonts are Unbounded (`.display`),
  Newsreader (`.serif`) and IBM Plex Mono (`.mono`), loaded from Google Fonts.
- Radii are 0, or fully round on dots. Shadows are hard offsets with zero blur. Rules are 2px
  `--ink`. Hover lifts an element off its shadow and `:active` sinks it back.
- Rows about another product wear that product's own colours: `--fs-*`, `--cc-*`, `--df-*`, `--zc`.
- Motion is bound in `main.js` by class selector. Markup hooks: `data-split`, `data-count` with
  `data-pad`, `data-cursor`, `data-tag`, `data-dir`, `data-section`, `data-shape`, `.magnetic`.
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

- `D` and `E` are redeclared in `main.js`, `palette.js`, `rail.js` and `visits.js`. The eases are
  CustomEases created in the body of `main.js`, so other modules use them only inside `init*`.
- With Lenis running, `overflow: hidden` on `body` holds nothing. Use `lockScroll`, and put
  `data-lenis-prevent` on anything that scrolls inside an overlay. `lenis` is undefined on touch.
- Vite does not serve `/api/visits`, so the counter never mounts locally. The loader shows once per
  tab (`sessionStorage` key `loader-seen`).
- JS breakpoints mirror CSS ones: 900px hero pin, 960px menu, 820px and 700px scroll drifts.
- Facts are repeated by hand. A changed number means the body copy, its `data-count`, the meta and
  social descriptions, the JSON-LD, `public/llms.txt` and `lastmod` in `public/sitemap.xml`.
- Colour values are copied into `404.html`, `public/resume.html` and `theme-color`. The resume is a
  Google Doc whose URL is hard-coded in those two files, `index.html`, `vercel.json` and `llms.txt`.
- Images are absolute `/images/...` strings, so Vite never checks them. A `data-tag="x"` chip needs
  `public/images/tags/x.jpg`, and a new rail object needs a measured `trim` box.
- Stale, safe to ignore: `.vscode/`, `.env.example`, the root `images/` folder, `dev/` (not in the
  build), and the Vercel dashboard's Astro preset (`vercel.json` overrides it).
