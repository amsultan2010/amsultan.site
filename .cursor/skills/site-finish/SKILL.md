---
name: site-finish
description: >-
  Finishing pass that makes a website correct, accessible, polished and
  launch-ready after the design work is done: interface and accessibility
  rules (Vercel Web Interface Guidelines), motion and micro-detail polish
  (Emil Kowalski's design-engineering rules), and launch checks (SEO, metadata,
  sitemap, robots, canonical, share images, 404, performance). Use after any UI
  change and before opening a PR, or when asked to finish, audit, review,
  harden, or ship a site. It never sets the visual direction: Impeccable and
  DESIGN.md own the look.
---

# Site finish

The second of the two site skills. Impeccable decides how the site looks. Site finish makes sure what was built is correct, accessible, smooth and ready to ship. It does not redesign anything.

**Precedence:** `DESIGN.md` and Impeccable win over everything in this skill. If a rule here would change palette, type, layout or the overall look, skip it and note it in the report. Never remove a deliberate design element to satisfy a rule here; fix it in a way that keeps the design.

## When to run

- After any UI change, before opening the PR (required by `.cursor/rules/design.mdc`).
- When asked to finish, audit, harden, review or ship a site.
- `/site-finish` with no argument means: the files changed on this branch versus `main`. With a file, route or URL, check only that.

## The pass

Run all three parts, in order, on the files in scope. Read each reference file in full before its part. Do not work from memory.

### 1. Interface and accessibility

Read `reference/interface-guidelines.md`. Check every changed UI file against every rule: accessibility, focus states, forms, animation, typography, content handling, images, performance, navigation and state, touch, safe areas, dark mode and theming, locale, hydration, hover states, copy. Fix every violation you can fix without changing the design.

### 2. Motion and polish

Read `reference/motion-and-polish.md`. Apply it to anything that moves, responds to input, or carries detail: easing curves and durations, enter and exit transitions, hover and press feedback, shadows and borders, optical alignment, type details, `prefers-reduced-motion`. Use its vocabulary to name what you changed. Do not add motion the design did not ask for; refine what is there.

### 3. Launch checks

Read `reference/launch-checks.md`. For anything public, run `.cursor/skills/site-finish/scripts/audit.sh <preview or production url>` for the static checks, then do the rest by reading the code and the built HTML. A check that could not run is reported as not run, never as a pass. Skip the URL checks only when no preview URL exists yet, and say so.

## Report

Put this in the PR body under `## Site finish` (and in chat when run on its own):

- **Fixed:** each issue as `file:line` and what changed.
- **Kept on purpose:** anything flagged but left because DESIGN.md or Impeccable says otherwise, with the reason.
- **Launch checks:** a short table of item, pass, fail, not run or not applicable, with evidence for fails.

A pass with no findings still lists what was checked.
