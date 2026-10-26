# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary readers:

- Someone who might grab coffee, talk startups, or teach him data engineering.
- A founder or hiring manager deciding whether to work with him.
- Someone who searched the name and needs the right Abdullah Sultan: Abdullah Muhammad Sultan, also amsultan or amsultan2010.

A school or college reader looking at the class of 2028 record is a secondary audience.

## Product Purpose

amsultan.site is Abdullah Muhammad Sultan's portfolio. It shows who he is, the work he has shipped, and how to reach him.

A visit succeeds when the reader believes the published record, reaches out, or both. Reaching out means LinkedIn, coffee, or a conversation about teaching him data engineering. Believing the record means checking the products, GitHub, and résumé.

## Positioning

The canonical site for this person. It is the page that both names Abdullah Muhammad Sultan and shows the work he has actually shipped, with a direct ask to talk.

## Operating Context

He is an 11th-grade student at the American International School Riyadh, in the full IB Diploma Programme, class of 2028, based in Riyadh. The live site is https://www.amsultan.site. The apex host redirects there.

Readers use three views of one page: `/` (about and contact), `/work` (internships, projects, leadership, record), and `/life` (personal stack, small games, watchlist). `/resume` is the full résumé. Every view ends in contact: LinkedIn ("say hello"), the résumé, GitHub, and X (@amsultan2010). The published contact line is "grab coffee, talk about startups, or help me learn data engineering," with "reply within a day."

The résumé source is a Google Doc, embedded by `resume.html`. Edit the doc, not the repo.

## Capabilities and Constraints

The site is his portfolio: about, work, life, and résumé, plus a 404.

Binding:

- Do not invent metrics, quotes, customers, or roles. Numbers stay as published until he changes them. A changed number is updated by hand in the body copy, its `data-count`, the meta and social descriptions, the JSON-LD, `public/llms.txt`, and `lastmod` in `public/sitemap.xml`.
- Visible copy stays one person speaking, all lowercase, brand names included. Meta tags, JSON-LD, and `llms.txt` keep normal case.
- The site stays his portfolio (me, work, life, résumé).

Open:

- Whether future work must keep the current license split. The repo publishes code as MIT and leaves writing, name, photos, and project images personal.

No API keys or environment variables. Hosted on Vercel (project `abdullahsultan`). Canonical host is www.amsultan.site.

## Brand Commitments

Name: Abdullah Sultan. Also Abdullah Muhammad Sultan, amsultan, amsultan2010.

Voice: one person speaking. All visible text is lowercase, brand names included.

## Evidence on Hand

Published record. Future work adds no proof beyond it:

- `public/llms.txt` and the JSON-LD in `index.html` are the factual source for identity, work, and numbers.
- Work named there: Cycls (AI engineering intern), fschoolai (software and product intern), crosscode (creator; npm `crosscode-cli`), the downforce blog (writer), Z Combinator (founder), Aspiring Doctors' Club, Code Ninjas volunteer work, AIS-R awards, academics, and certifications.
- Photos, project images, and the portrait live under `public/`. Third-party images and logos under `public/images/` belong to their owners.
- The résumé is the Google Doc linked from `resume.html`.
- There are no testimonials or press quotes beyond what those files already say.

## Product Principles

- Serve people who might talk with him, hire him, or confirm they have the right Abdullah Sultan. School and college readers are secondary.
- A visit succeeds when the reader believes the published record, reaches out, or both.
- Publish only facts he has already stated. Numbers, quotes, customers, and roles stay as published until he changes them.
- Keep the site his portfolio: me, work, life, and résumé.
- The voice is one person speaking, lowercase, including brand names.
