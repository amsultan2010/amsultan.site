@AGENTS.md

# amsultan.site

Abdullah Sultan's portfolio, live at https://abdullahsultan.tech. Hand-written HTML, CSS
and a little vanilla JavaScript: no framework, no TypeScript, no tests, no linter. Vite 8.1
builds it and Vercel hosts it. Node 24 (`.nvmrc`). The repo is public, MIT licensed.

## Commands

- `npm run dev` starts Vite. `.claude/launch.json` already runs it as `vite-dev` on port 4321.
- `npm run build` writes `dist/`, `npm run preview` serves it. `npm run check` is the same build.

## Code map

- `index.html` the homepage: wordmark, intro, tabs for internships, projects, lead, record and extra, the contact ask, and the footer. The lists are in the HTML. `src/site.js` switches the visible tab.
- Life (places, food, games, small games, the watchlist) is a section of `index.html` at `#life`. `/life` redirects to `/#life`.
- `links.html` the link card page at `/links`.
- `resume.html` the Google Doc embed and the PDF link. Vercel rewrites `/resume` to it.
- `404.html` the styled missing page. It loads the same stylesheet.
- `src/styles.css` tokens in `:root`, then the column, the intro, the tabs, the lists, life, the resume frame, and the footer.
- `src/fonts.css` Geist Serif and Host Grotesk, self-hosted.
- `src/site.js` the tab keyboard behaviour and the signature cycle. It also loads `@vercel/analytics`.
- `vite.config.js` the four HTML entries, the `/work` and `/life` redirects, the `/resume` and `/links` rewrites, and the generated sitemap.
- `public/` images, icons, fonts, `robots.txt`, and `llms.txt`. `sitemap.xml` is generated at build, not stored here.

## Conventions

- All page text is lowercase, brand names included. `body` sets `text-transform: lowercase`; `button` sets it too. Meta tags, JSON-LD and `llms.txt` keep case.
- Visual design (palette, type scale, layout, radius, glass, motion) is in `DESIGN.md` and nowhere else. Tokens live in `:root` in `src/styles.css`. Two families only: Geist Serif and Host Grotesk.
- A link to another page is a real `<a href>`. `/work` redirects to `/`.
- Run `/site-finish` (`.cursor/skills/site-finish`) before shipping.

## Deploy

Vercel project `abdullahsultan`, connected to GitHub `amsultan2010/amsultan.site`. A push to `main`
deploys production. Any other pushed branch gets a preview, which is `noindex` and behind Vercel
login. `abdullahsultan.tech` is the canonical host. `www.abdullahsultan.tech`, `amsultan.site`, and `www.amsultan.site` redirect there. There are no env vars.

## Gotchas

- Facts are repeated by hand. A changed number means the body copy, the meta and social descriptions, the JSON-LD, and `public/llms.txt`.
- Each HTML file adds the `js` class in a head script, before the stylesheet, so the entrance can hide content before first paint. There is no theme script.
- `/resume` and `/links` are rewrites to `resume.html` and `links.html` in `vercel.json` and in `vite.config.js`. `/life` redirects to `/#life`. A new page needs both, plus a route in the sitemap list in `vite.config.js`.
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
