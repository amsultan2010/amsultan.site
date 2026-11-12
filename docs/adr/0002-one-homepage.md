# One homepage, with life and the resume as their own pages

ADR 0001 split the site into three views of one HTML file so a switch could replay scroll animation. That motion is gone. The homepage now holds the intro and the work lists, and `/work` redirects to `/`. `/life` and `/resume` are separate HTML files, so each address has its own title, description, and canonical URL.

## Consequences

- The work lists are in the homepage HTML. Script only shows one tab at a time. With script off, every list is visible.
- Search engines get three indexable URLs: `/`, `/life`, and `/resume`. `/work` is a redirect, not a page in the sitemap.
- A new public page needs an HTML entry, a rewrite in `vercel.json` and `vite.config.js`, and a line in the sitemap route list.
