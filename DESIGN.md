---
name: abdullahsultan.tech
description: a quiet liquid-glass column on starlight white with monochrome waves and charcoal ink
colors:
  starlight: "#efece4"
  bg: "#efece4"
  bg-secondary: "#e5e0d5"
  bg-tertiary: "#d9d3c6"
  black: "#000000"
  ink: "#0f0f0e"
  text: "#1f1f1d"
  text-secondary: "#444340"
  muted: "#5a5853"
  heading: "#0f0f0e"
  line: "#c4bfb2"
  line-strong: "#2b2a28"
  accent: "#141413"
  accent-hover: "#000000"
typography:
  display:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "3.6rem"
    fontWeight: 500
    lineHeight: 1.04
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "1.28rem"
    fontWeight: 500
    lineHeight: 1.72
    letterSpacing: "0"
  label:
    fontFamily: "Host Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.02rem"
    fontWeight: 300
    letterSpacing: "0"
rounded:
  portrait: "50%"
  icon: "0.25rem"
  mark: "0.375rem"
  media: "0.5rem"
  tablist: "0.725rem"
  card: "0.75rem"
  pill: "999px"
spacing:
  panel: "min(52rem, 100% - 3rem)"
  panel-phone-inset: "0.75rem"
  text: "42em"
  section: "3.5rem"
  block: "2rem"
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

One calm, spacious liquid-glass reading column framed in a visible rectangle over a warm starlight off-white canvas with drifting monochrome dark-gray and black contour waves and sparse floating geometric shapes. The portrait rests on the lower edge of the header photograph, `abdullah sultan` pairs solid serif ink with an outlined off-white `sultan` in the same `Geist Serif` face (with its underline kept), and every section is paced with `1.5px` dividers. One scheme: starlight off-white ground, dark-gray-to-pure-black ink. No light/dark toggle.

## Colors

Starlight `#efece4` (nudged a touch warmer and softer than `#f4f0e7` to stay easy on the eyes) is the page ground everywhere, including the favicon background (`public/favicon.ico` and `public/icons/*-v8.png`). Recessed surfaces (image wells, tab track, secondary link buttons) step deeper to `#e5e0d5` (`--bg-2`) and `#d9d3c6` (`--bg-3`) on hover.

Ink runs from muted charcoal to pure black, with every text pairing clearing WCAG AA (most AAA):

- `--black` (`#000000`): hover and active emphasis (17.8:1 on starlight).
- `--ink` (`#0f0f0e`): display headings, item titles, `sultan` stroke and underline, focus rings, selection fill (16.4:1).
- `--text` (`#1f1f1d`): body prose and list copy (14.0:1).
- `--text-2` (`#444340`): secondary text, captions, role metadata, inactive tabs, footer links, background waves (8.3:1).
- `--muted` (`#5a5853`): subtle headings (`coffee chat?`), separators (5.9:1).
- `--line` (`#c4bfb2`): `1.5px` dividers above/below the intro, between work entries, and above contact/footer.
- `--line-strong` (`#2b2a28`): interactive borders and text underlines.
- `--accent` (`#141413`): active tab pill and primary link button, paired with `--starlight` (`#efece4`) type (15.6:1).

No cyan, no signal red, no ice, no purple.

## Typography

Geist Serif at medium (`500`) for `abdullah sultan`, headings, and body prose. `sultan` uses the same `Geist Serif` normal `500` face filled with `--starlight` (`#efece4`), a `2.4px` (`1.75px` on phones) `--ink` outline (`paint-order: stroke fill`), and a `2px` `--ink` underline. Host Grotesk at `300` for the top bar, tabs, roles, dates, captions, and footer. The root is 17px (`106.25%`) from 761px and 14.5px (`90.625%`) at 760px and below. Sizes live in `--type-*` in `src/styles.css`: hero `3.6rem`, section `2.2rem`, item `1.6rem`, tab `1.32rem`, body `1.28rem` (`line-height: 1.72`), role/caption `1.125rem`, nav `1.06rem`, footer `1.08rem`, meta `1.02rem`. At 760px and below: hero `2.3rem`, section `1.75rem`, item `1.4rem`, tab `1.14rem`, body `1.2rem`, role `1.08rem`, nav/footer/meta `1.02rem`. Nothing drops below 14.5px. All visible copy is lowercase.

## Layout

The liquid-glass reading column (`.stage` and `.page:not(.links-page)`) is `min(52rem, 100% - 3rem)` wide, framed by a visible `1.5px` charcoal-tinted rectangle border (`color-mix(in srgb, var(--ink) 32%, transparent)`), `22px` backdrop blur (`18px` on phones) over `50%` starlight glass, specular top sheen, and `2.25rem` internal horizontal padding (`1rem` on phones). Behind it, `.gutters` holds drifting dark-gray/black SVG contour waves and a sparse set of floating geometric shapes (`--starlight` fill, `--ink`/`--text-2` outline and offset drop shadow) visible in the side margins and softly through the glass.

The header photograph (`.plate`) is `2.35 / 1` with `0.5rem` corners. The portrait overlaps the plate with a `3px` starlight cutout ring. The intro block (`.bio` + `.facts`) is bracketed by `1.5px` `--line` dividers above and below. Work tabs sit in one centered recessed pill bar (`--type-tab: 1.32rem`, `50px` min-height, `46px` on phones) with a sliding `--accent` indicator, including at 760px and below. Work items separate with `1.65rem` vertical padding and `1.5px` `--line` dividers; titles and inline role captions align on one center line, and on phones the caption drops to its own line. A hovered item picks up a faint `--bg-2` wash. The footer stays one centred wrapping row. The contact question uses `--text`, still quieter than the ink `book a meeting` link.

The `/links` card uses the same liquid-glass surface and visible border over the monochrome waves and shapes (`24rem` on phones, `27rem` from 900px). `website` leads as the primary dark charcoal button; the remaining links follow as recessed starlight buttons.

## Motion

Smooth, unhurried scrolling is driven by Lenis (`duration: 1.55`, `wheelMultiplier: 0.7`) synchronized with GSAP `ScrollTrigger` via `gsap.ticker`, active only under `(prefers-reduced-motion: no-preference)`. The `sultan` underline draws once on load (`0.7s`, `power3.out`). Tab indicator slides with `0.45s power3.out`, panel items enter cleanly on switch and scroll, the header photograph shifts subtly with scroll scrub, and the background waves/shapes drift gently. `prefers-reduced-motion: reduce` disables Lenis, parallax, background drift, glass blur, entrances, and transitions.
