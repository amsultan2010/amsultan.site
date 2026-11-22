---
name: abdullahsultan.tech
description: a quiet editorial column on starlight white and charcoal ink
colors:
  starlight: "#efece4"
  bg: "#efece4"
  bg-secondary: "#e6e2d8"
  bg-tertiary: "#dbd6ca"
  black: "#000000"
  ink: "#0f0f0e"
  text: "#222220"
  text-secondary: "#484744"
  muted: "#62605b"
  heading: "#0f0f0e"
  line: "#d7d2c7"
  line-strong: "#2b2a28"
  accent: "#141413"
  accent-hover: "#000000"
typography:
  display:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "3.4rem"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "1.1875rem"
    fontWeight: 500
    lineHeight: 1.75
    letterSpacing: "0"
  label:
    fontFamily: "Host Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 300
    letterSpacing: "0"
rounded:
  portrait: "50%"
  icon: "0.25rem"
  mark: "0.375rem"
  media: "0.5rem"
  tablist: "0.625rem"
  card: "0.75rem"
spacing:
  panel: "min(46rem, 100% - 3rem)"
  panel-phone-inset: "1rem"
  text: "40em"
  section: "4rem"
  block: "2.25rem"
  stack: "1.75rem"
  tight: "0.5rem"
components:
  plate:
    backgroundColor: "{colors.bg-secondary}"
  portrait:
    rounded: "{rounded.portrait}"
  tab:
    textColor: "{colors.text-secondary}"
    typography: "{typography.label}"
  tab-active:
    textColor: "{colors.starlight}"
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.mark}"
---

# Design System: abdullahsultan.tech

## Overview

One calm, spacious reading column directly on a warm starlight off-white canvas. No side gutters, no animated wave backgrounds, no floating shapes, no frosted glass, and no chromatic accents. The portrait rests gently on the lower edge of the header photograph, the name sits cleanly on the page ground, and every section breathes with generous vertical rhythm and hairline rules. One scheme: starlight off-white ground, dark-gray-to-pure-black ink. No light/dark toggle.

## Colors

Starlight `#efece4` (nudged a touch warmer and softer than `#f4f0e7` to stay easy on the eyes) is the page ground everywhere. Recessed surfaces (image wells, tab track, secondary link buttons) step one shade deeper to `#e6e2d8` (`--bg-2`) and `#dbd6ca` (`--bg-3`) on hover.

Ink runs from muted charcoal to pure black, with every text pairing clearing WCAG AA (most AAA):

- `--black` (`#000000`): hover and active emphasis (17.8:1 on starlight).
- `--ink` (`#0f0f0e`): display headings, item titles, focus rings, selection fill (16.4:1).
- `--text` (`#222220`): body prose and list copy (13.5:1).
- `--text-2` (`#484744`): secondary text, inactive tabs, footer links, italic `sultan` signature (7.8:1).
- `--muted` (`#62605b`): top bar, dates, roles, location caption, list dashes (5.3:1).
- `--line` (`#d7d2c7`): hairline dividers and quiet borders.
- `--line-strong` (`#2b2a28`): interactive borders and text underlines.
- `--accent` (`#141413`): active tab pill and primary link button, paired with `--starlight` (`#efece4`) type (15.6:1).

No cyan, no signal red, no ice, no purple.

## Typography

Geist Serif at medium (`500`) for the name, headings, and body prose. Host Grotesk at `500` italic for `sultan` and at `300` for the top bar, tabs, roles, dates, captions, and footer. The root is 17px (`106.25%`) from 761px and 14px (`87.5%`) at 760px and below. Sizes live in `--type-*` in `src/styles.css`: hero `3.4rem`, section `2rem`, item `1.32rem`, tab `1.02rem`, body `1.1875rem` (`line-height: 1.75`), role `0.95rem`, nav and footer `0.9375rem`, meta `0.875rem`. At 760px and below: hero `2.15rem`, section `1.6rem`, item `1.22rem`, tab `1rem`, body `1.12rem`, role/nav/footer/meta `1rem`. Nothing drops below 14px. All visible copy is lowercase.

## Layout

The reading column (`.stage` and `.page`) is `min(46rem, 100% - 3rem)` wide, centred on the `#efece4` canvas, with a `1rem` inset on phones. Top bar carries the wordmark, live Riyadh clock, and year with `1.5rem` top and `1.25rem` bottom air. The header photograph (`.plate`) is `2.35 / 1` with `0.5rem` corners and a subtle hairline border. The portrait overlaps the plate cleanly with a `3px` starlight cutout border and soft shadow (`7.5rem`, `9.25rem` from 640px, `10.5rem` from 1024px, `6rem` on phones).

Sections breathe at `4rem` (`--space-section`) on desktop and `3rem` on phones. Work tabs sit in a centered recessed pill bar (`--bg-2` with `--line` border) with a sliding `--accent` indicator and `44px` minimum target height. Work items separate with `1.5rem` vertical padding and a `1px` `--line` hairline rule between siblings. Extra (`#life`) grids align to the reading column without negative-margin bleeds, using `1rem` gaps and `0.5rem` rounded corners. The contact block and footer each open with a quiet hairline top rule.

The `/links` card centers vertically on the starlight canvas (`23.5rem` on phones, `26.5rem` from 900px), framed by a `1px` `--line` border and a soft diffuse shadow. `website` leads as the primary dark charcoal button; the remaining links follow as recessed starlight buttons.

## Motion

Smooth, unhurried scrolling is driven by Lenis (`duration: 1.55`, `wheelMultiplier: 0.7`) synchronized with GSAP `ScrollTrigger` via `gsap.ticker`, active only under `(prefers-reduced-motion: no-preference)`. Tab indicator slides with `0.45s power3.out`, panel items enter cleanly on switch and scroll, and the header photograph shifts subtly with scroll scrub. Links and buttons transition in `180ms`. `prefers-reduced-motion: reduce` disables Lenis, parallax, entrances, and transitions, leaving native instant scrolling and static content.
