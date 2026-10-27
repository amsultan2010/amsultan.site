---
name: amsultan.site
description: abdullah sultan's portfolio, one lowercase page in three views
colors:
  signal-orange: "#ff5c00"
  signal-orange-deep: "#d34400"
  warm-cream: "#fce5c0"
  paper-white: "#ffffff"
  ink: "#120e0c"
  ink-soft: "rgba(18, 14, 12, 0.62)"
  line: "rgba(18, 14, 12, 0.55)"
  line-soft: "rgba(18, 14, 12, 0.2)"
  zc-purple: "#5a0fe8"
  fs-white: "#ffffff"
  fs-ink: "#1d1d1f"
  fs-blue: "#0071e3"
  cc-black: "#0a0b0e"
  cc-white: "#edeef2"
  df-teal: "#0a3940"
  df-paper: "#f2ecdf"
  df-lime: "#c6e33a"
  cy-black: "#000000"
  cy-white: "#ffffff"
typography:
  display:
    fontFamily: "Unbounded, sans-serif"
    fontSize: "clamp(2.2rem, 7vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.06em"
  title:
    fontFamily: "Unbounded, sans-serif"
    fontSize: "clamp(1.15rem, 2.2vw, 1.85rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.055em"
  body:
    fontFamily: "Newsreader, Georgia, serif"
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
    fontSize: "0.95rem"
    fontWeight: 500
    letterSpacing: "0.04em"
rounded:
  none: "0"
  dot: "999px"
spacing:
  gutter: "clamp(1.55rem, 3.6vw, 4rem)"
  header-h: "5.1rem"
components:
  section-head:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    rounded: "{rounded.none}"
  contact-card:
    backgroundColor: "{colors.signal-orange}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "1rem"
  work-row:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.warm-cream}"
    rounded: "{rounded.none}"
    padding: "1.75rem {spacing.gutter}"
  tag:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  tag-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.warm-cream}"
---

# Design System: amsultan.site

## Overview

**Creative North Star: "The Lowercase Poster"**

A flat printed-poster page: an amber ground, ink rules 2px thick, white paper, a little warm cream, and shadows that are hard offsets with no blur. Everything is lowercase, brand names included, so the voice reads as one person talking rather than a company. Type does the heavy lifting: an extra-bold wide display face for headings, a bookish serif for what was done, a mono for the facts (dates, roles, counts).

The page is sectioned like a broadsheet, with air inside each band. Each section opens on a full-width head band (big word, an echo strip, a counted meta cell) and then a stack of ruled rows. Motion is choreographed with GSAP but never decorative: things rise out of masks, counters count, rows enter in order.

Anything that points at another product wears that product's own colours inside the site, so the portfolio becomes a frame for real work.

**Key Characteristics:**
- amber ground, white paper, a little cream, ink for type and rules
- 2px ink rules between everything, zero radius
- hard offset shadows, zero blur; hover lifts off the shadow, press sinks into it
- all text lowercase
- three-face type system: display, serif, mono
- brand-wearing rows for other products

## Colors

Four colours run the site; every other colour belongs to someone else's product.

### Primary
- **Signal Orange** (signal-orange): `#ff5c00`, the page ground, the head bands, and the pressable cards. Its deep variant (signal-orange-deep) is only for pressed and shadow states on orange. Orange is a field. Type on it is ink. Orange is never type on white or cream.

### Neutral
- **Ink** (ink): text, every rule, every shadow, and the ground of the work section.
- **Warm Cream** (warm-cream): `#fce5c0`, a warm note used less than white: the header, the hero rail and kicker, the marquee, the basics sheet, the message-me cell, the lead head, the learning panel, the academics row, the contact card, the gaps between life rails, the see-work pill, the portrait caption, the certification cells, the poster captions, selection, and a hover chip. Outlines and strokes are white, never cream.
- **Paper White** (paper-white): `#ffffff`, most of the light surfaces. The about field, the life rails, the favorites board, the frames, and the type on ink.
- **Ink Soft / Line / Line Soft**: secondary text and thinner dividers inside panels.

### Borrowed brand colours
- **cycls** (cy-black, cy-white), **fschoolai** (fs-white, fs-ink, fs-blue), **crosscode** (cc-black, cc-white), **the downforce blog** (df-teal, df-paper, df-lime), **z combinator** (zc-purple). Each is read from that product's shipped css and used only on rows about it.

### Named Rules
**The Four Colour Rule.** The site's own surfaces use only orange, cream, white, and ink. A new colour enters only as another product's brand, on that product's row.

**The Borrowed Brand Rule.** A row about a product sets `--row-bg`, `--row-fg` and `--row-accent` from that product's palette; layout rules never name a colour.

## Typography

**Display Font:** Unbounded (sans-serif fallback)
**Body Font:** Newsreader (Georgia fallback)
**Label/Mono Font:** IBM Plex Mono (ui-monospace fallback)

**Character:** a wide, heavy display face shouting the section word, a calm serif for the substance, and a mono for metadata. The contrast between the three is the hierarchy.

### Hierarchy
- **Display** (800, clamp(2.2rem, 7vw, 5.5rem), 0.95, -0.06em): section words in head bands ("built", "lead").
- **Title** (800, clamp(1.15rem, 2.2vw, 1.85rem), 1.05): row and item names.
- **Body** (Newsreader, regular): bullet points and ledes.
- **Label** (Plex Mono 500, 0.95rem, 0.04em): dates, roles, counts, link labels ("visit ↗").

### Named Rules
**The Lowercase Rule.** All visible text is lowercase. `body` sets it; `button` and `input` set it themselves. Only meta tags, JSON-LD and llms.txt keep case.

## Layout

Full-bleed sections, each a head band over a stack of rows separated by 2px ink rules. Horizontal padding is the fluid gutter. Below 900px rows stack: index, icon and name on one line, then bullets, then the clip, then meta. From 900px a work row puts the clip in its own column beside the copy. Other breakpoints in use: 1240, 1100, 960, 820, 700, 620–899 and 430px; js mirrors the 900, 820 and 700px ones.

## Elevation & Depth

Flat surfaces with hard offset shadows. A shadow is a solid block of ink (or orange on ink, or a brand accent on a brand row) offset down and right, never blurred. Shadows mark things you can press or open.

### Shadow Vocabulary
- **Chip** (`0.22rem–0.28rem` offset, ink): small icons and chips.
- **Card** (`0.5rem 0.5rem 0 ink`): contact cards at rest.
- **Shot** (`0.4rem 0.4rem 0 var(--row-accent)`): clip frames in work rows; grows to 0.6rem on hover.

### Named Rules
**The Hard Shadow Rule.** Every shadow has zero blur. Hover lifts an element off its shadow (translate up-left, shadow grows); `:active` sinks it back.

## Shapes

Square corners everywhere (0). The only round shapes are dots, which are fully round. Borders are 2px ink, or a brand colour mixed down to 30% on brand rows.

## Components

### Section head
A full-width band: the display word on the left with a mask it rises out of, an echo strip repeating the word, and a meta cell on the right with a counted number (`data-count`, `data-pad`) above a mono caption. Each section sets `--head-bg`, `--head-ink`, `--head-rule` and `--head-accent`.

### Work row
A full-width link: mono index, square brand icon with a hard shadow, display name as a hover-preview tag, serif bullets, mono date-and-role line, a "visit ↗" label, and a looping muted clip in a framed box. It wears its product's brand colours and has an accent edge on its leading side that widens on hover.

### Lead item
A ruled row with a big display number in its own left column and a body of mono meta, display title and serif bullets. Hover flips it to white with ink text. z combinator wears its own purple and Archivo.

### Tag
Inline text with a 1px underline. On hover it inverts (ink ground, cream text) and shows a preview image from `public/images/tags/`.

### Contact card
Orange card, 2px ink border, ink card shadow at rest; magnetic on fine pointers.

### Navigation
A fixed cream pill header with a 2px ink border, centred at the top. View links are real `<a href>`s to `/`, `/work` and `/life`.

## Do's and Don'ts

### Do:
- **Do** keep every rule 2px ink and every corner square.
- **Do** give a row about another product that product's own colours, read from its shipped css.
- **Do** put dates and roles in mono, what was done in serif, names in display.
- **Do** count every number in a section meta with `data-count`.

### Don't:
- **Don't** blur a shadow or round a corner.
- **Don't** add a fifth site colour; new colour comes only from a product's brand.
- **Don't** set orange type on white or cream. Orange is a field, and the type on it is ink.
- **Don't** capitalise anything on the page.
- **Don't** hide content behind hover; hover only adds emphasis.
