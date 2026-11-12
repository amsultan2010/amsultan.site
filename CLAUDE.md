# amsultan.site

Abdullah Sultan's portfolio, live at https://abdullahsultan.tech. Hand-written HTML, CSS
and a little vanilla JavaScript: no framework, no TypeScript, no tests, no linter. Vite 8.1
builds it and Vercel hosts it. Node 24 (`.nvmrc`). The repo is public, MIT licensed.

## Commands

- `npm run dev` starts Vite. `.claude/launch.json` already runs it as `vite-dev` on port 4321.
- `npm run build` writes `dist/`, `npm run preview` serves it. `npm run check` is the same build.

## Code map

- `index.html` the homepage: wordmark, intro, tabs for internships, projects, lead, record and extra, the contact ask, and the footer. The lists are in the HTML. `src/site.js` switches the visible tab.
- `life.html` places, food, games, small games, and the watchlist. Vercel rewrites `/life` to it. Vite does the same in dev and preview.
- `resume.html` the Google Doc embed and the PDF link. Vercel rewrites `/resume` to it.
- `404.html` the styled missing page. It loads the same stylesheet.
- `src/styles.css` tokens in `:root`, then the column, the intro, the tabs, the lists, life, the resume frame, and the footer.
- `src/fonts.css` Geist Serif and Host Grotesk, self-hosted.
- `src/site.js` the tab keyboard behaviour and the signature cycle. It also loads `@vercel/analytics`.
- `vite.config.js` the four HTML entries, the `/work` redirect, the `/life` and `/resume` rewrites, and the generated sitemap.
- `public/` images, icons, fonts, `robots.txt`, and `llms.txt`. `sitemap.xml` is generated at build, not stored here.

## Conventions

- All page text is lowercase, brand names included. `body` sets `text-transform: lowercase`; `button` sets it too. Meta tags, JSON-LD and `llms.txt` keep case.
- Colour is one ice signal scheme. Ice `#d5eef2` is the page ground. Ink `#073b4c` is the type (the old cyan band, 9.97:1 on ice). Cyan `#0e5c70` is that band lifted to the lightest step that still clears 4.5:1. It is the tab hover, the borders, and the second gutter contour. Signal `#f54937` is 2.94:1 on ice, so it stays decorative: gutter lines, shape fills, the link-button hover wash. `#c73828` (4.31:1) is the large red and the UI marks: sultan, headings, the coffee chat line, underlines, arrows, the active tab line, focus. Body-size red text uses `#c13627` (4.53:1). A press sinks 1px. The horizontal contours from `00c4685` stay clipped to the side gutters from 960px, with the shapes from 1100px. Phone widths hide them. Sultan is one red. The wipe and the underline still cycle the faces. There is no theme toggle and no `prefers-color-scheme` switch. Two families only: Geist Serif for the name and the sentences, Host Grotesk for the bar, the tabs, and the dates.
- The column is 40rem of text, centred, with the words left aligned. Radius is 0 except the round portrait. Motion is a 150ms colour and underline change, and a 150ms tab crossfade, both removed when `prefers-reduced-motion` is set.
- A link to another page is a real `<a href>`. `/work` redirects to `/`.
- Run the `anti-ai-site` skill before shipping visual changes.

## Deploy

Vercel project `abdullahsultan`, connected to GitHub `amsultan2010/amsultan.site`. A push to `main`
deploys production. Any other pushed branch gets a preview, which is `noindex` and behind Vercel
login. `abdullahsultan.tech` is the canonical host. `www.abdullahsultan.tech`, `amsultan.site`, and `www.amsultan.site` redirect there. There are no env vars.

## Gotchas

- Facts are repeated by hand. A changed number means the body copy, the meta and social descriptions, the JSON-LD, and `public/llms.txt`.
- Each HTML file adds the `js` class in a head script, before the stylesheet, so the entrance can hide content before first paint. There is no theme script.
- `/life` and `/resume` are rewrites to `life.html` and `resume.html` in `vercel.json` and in `vite.config.js`. A new page needs both, plus a route in the sitemap list in `vite.config.js`.
- The resume is a Google Doc, embedded by `resume.html` and linked there as a PDF export. Edit the doc, not the repo. `/resume.pdf` and `/resume.html` redirect to `/resume`. The doc must stay viewable by anyone with the link.
- Images are absolute `/images/...` strings, so Vite never checks them.
- Stale, safe to ignore: `.env.example` and the Vercel dashboard's Astro preset (`vercel.json` overrides it).

## Agent skills

### Issue tracker

GitHub Issues on `amsultan2010/amsultan.site`, through the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

The five defaults, each label named after its role: `needs-triage`, `needs-info`, `ready-for-agent`,
`ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` (the page and section names) and `docs/adr/` at the repo root.
See `docs/agents/domain.md`.
