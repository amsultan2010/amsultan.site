
# Launch checks

Technical bar for any public site. It sets no visual rules: visual design is owned by the Impeccable skill and the repo's `DESIGN.md`.

Run `.cursor/skills/site-finish/scripts/audit.sh <url>` for the static checks against a preview or production URL. Do the browser checks (console, alt text, rendered DOM) in a browser. Report a table: item, pass or fail, evidence. A check that could not run is reported as not run, never as a pass. An item that does not apply is reported as not applicable.

## Crawl and build

1. **Sitemap.** `/sitemap.xml` returns 200 as XML, lists every public route with absolute URLs, and is generated from the routes, not hand-kept.
2. **Favicon.** A real `/favicon.ico` plus linked `icon` and `apple-touch-icon`. Not the framework default.
3. **Copy punctuation.** No em dashes or emoji in visible copy, unless the owner allowed them for this project.
4. **Titles.** Every route has its own `<title>`, no duplicates, no layout default. Pattern `Page | Site`.
5. **404.** A styled 404 route that returns HTTP 404, with navigation and a link home.
6. **robots.txt.** Returns 200, has a `Sitemap:` line, and allows `User-agent: *` and AI crawlers (GPTBot, ClaudeBot, PerplexityBot, CCBot, Google-Extended).
7. **lang.** `<html lang>` set correctly on every page.
8. **Alt text.** Every `<img>` has `alt`: empty for decorative images, a description for meaningful ones.
9. **No source maps** served in production.
10. **Canonical.** Every page has an absolute `<link rel="canonical">` to its own production URL.
11. **Bundle size.** Initial JS under about 200 KB gzipped. Split or lazy-load the offender.
12. **One H1** per page naming its subject. Headings descend without skipping levels.
13. **Real HTML.** `curl` of a page returns its content. An empty app shell is a fail.
14. **Share tags.** `og:image` (absolute, 1200x630, loads), `og:title`, `og:description`, `og:url`, `og:type`, `twitter:card=summary_large_image`.
15. **Structured data.** Valid JSON-LD: `Person` or `Organization` site-wide, plus the right per-page type, with the same facts as the page.
16. **Console.** Zero errors and uncaught rejections on every route, including the 404.

## Search

17. **One live address.** One production origin used everywhere (canonical, `og:url`, sitemap, robots, JSON-LD). Other hosts and `http://` redirect to it in one permanent hop. No `localhost` or `*.vercel.app` in built pages. Curl the canonical: 200.
18. **Search titles.** Subject, then place or audience, then site name, under about 60 characters.
19. **Meta descriptions.** Unique per indexable page, 120 to 160 characters, in the searcher's words.
20. **Name in text.** The site name appears as real text on every page, and the homepage says plainly what the site is.
21. **Site name data.** A `WebSite` node with `name`, `alternateName`, `url`, and a stable `@id`; the `Person` or `Organization` has `logo` and `sameAs`; subpages carry `BreadcrumbList`.
22. **Reachable.** Every public route is linked with a real `<a href>` from the homepage. Sitemap URL count matches the indexable pages.
23. **Indexing on purpose.** No `noindex` in production pages. Previews, the 404, and thin utility pages are `noindex` and out of the sitemap.
24. **Languages.** Only for multilingual sites: one URL per language, reciprocal `hreflang` plus `x-default`, a switch that links to the same page.
25. **Speed.** Mobile Lighthouse: LCP under 2.5s, CLS under 0.1, TBT green. Self-hosted fonts with `font-display: swap`, `width` and `height` on images, below-the-fold media lazy-loaded.

## Agent access

26. **Semantic HTML.** One `<main>`, `<header>`, `<nav>`, `<footer>`, lists as lists, actions as `<button>` or `<a>`, tables for tabular data.
27. **No indexing errors.** Every sitemap URL is 200 on the first hop, allowed by robots, not `noindex`, and canonical to itself.
28. **Descriptive headings.** Each heading names its section. "Welcome", "Overview", "Home" are fails.

## After the first production deploy

Confirm the primary domain and redirects with the host, add and verify the Search Console domain property, submit the sitemap, request indexing for the key pages, point every owned profile at the canonical URL, and import the property into Bing Webmaster Tools.
