---
name: abdullahsultan.tech
description: a quiet column on the ice signal palette
colors:
  ink: "#073b4c"
  ice: "#d5eef2"
  signal: "#f54937"
  signal-deep: "#c73828"
  signal-text: "#c13627"
  cyan: "#0e5c70"
  bg: "#d5eef2"
  bg-secondary: "#c5e4ea"
  text: "#073b4c"
  text-secondary: "#145e72"
  muted: "#4a6d76"
  heading: "#073b4c"
  line: "#0e5c70"
  accent: "#c73828"
  z: "#5d0fe9"
  z-deep: "#4c0cbf"
  z-press: "#3f0aa3"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0"
  body:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 2
    letterSpacing: "0"
  label:
    fontFamily: "Host Grotesk, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 300
    letterSpacing: "0"
rounded:
  portrait: "50%"
  mark: "0.375rem"
spacing:
  panel: "min(50rem, 100% - 2rem)"
  panel-phone-inset: "0.4rem"
  text: "40em"
  section: "2.5rem"
  block: "1.5rem"
  stack: "1rem"
  tight: "0.5rem"
components:
  plate:
    backgroundColor: "{colors.bg-secondary}"
  portrait:
    rounded: "{rounded.portrait}"
  tab:
    textColor: "{colors.cyan}"
    typography: "{typography.label}"
  tab-active:
    textColor: "{colors.ice}"
    backgroundColor: "{colors.signal}"
    rounded: "{rounded.mark}"
---

# Design System: abdullahsultan.tech

## Overview

One reading column under a photograph. The portrait sits on the bottom edge of that photograph. The name is a short serif statement. Lists are a title and a light grotesk line. One scheme: ice ground, ink type, cyan for the secondary accent, signal red for the marks. No light mode, no dark mode, no toggle.

## Colors

Ice signal, from the palette in `00c4685`. Ice is now the ground and ink is the type. The cyan in that commit is the ink band `#073b4c`.

Ice `#d5eef2` is the page ground. Ink `#073b4c` is the type on it (9.97:1 on ice, about 4.7:1 on the darkest composited glass). Secondary text `#145e72` (6.0:1 on ice) is the same hue, lifted. Role lines, the footer, and the life subheads use ink, because the old muted grey drops under 3:1 once the waves show through the glass. Inactive tabs are cyan. Cyan `#0e5c70` (6.2:1) is that band lifted to the lightest step that still clears 4.5:1 on ice. It is the tab hover, the borders, and the plate well's stronger edge. The gutter ground is the band itself, `#073b4c`, and the contours on it are ice and signal red. The well and the secondary link buttons use a light mix, `#c5e4ea`. Signal-red words that sit on the glass (the meeting link, the life headings, and sultan on the links card) carry a 1px ice outline. The active tab is ice type inside a solid signal rectangle, so it does not need that outline. The website button on the links card is the same pairing: ice type on signal red, with a 2px cyan outline. The z combinator button matches the height of coffee chat: white type on `#5d0fe9` (the logo purple, 7.75:1 with white), and its mark is the full logo, not a crop, with a 1px white outline. A press darkens that purple to `#3f0aa3`.

Signal `#f54937` is 2.94:1 on ice, so it is the decorative red: gutter lines, shape fills, and the link-button hover wash. It is not text and not the only mark on a control. `#c73828` is 4.31:1, enough for large text and for UI marks: the coffee chat line, link underlines, arrows, the portrait ring, and the focus ring. A press sinks 1px and the red darkens. Body-size red text uses `#c13627` (4.53:1), the same hue darkened until it clears 4.5:1. The active tab is the exception the brief asked for: ice on signal red.

Sultan stays one cyan, `#0e5c70`, set in Host Grotesk italic at 500, with its underline, including on the red profile card. On the links card it is signal red `#f54937` with the 1px ice outline. It does not cycle faces or colours. The ROYGBIV colours are gone.

## Typography

Geist Serif at medium for the name and the sentences. Host Grotesk at 500 for the panel titles under the tabs. The family ships one roman cut, so a 400 to 500 range paints that cut for a medium request. Host Grotesk at 300 for tabs, dates, roles, the nav, and the footer. The root is 17px (106.25%) from 761px and 14px (87.5%) at 760px and below. Sizes live in `--type-*` in `src/styles.css`: hero 3.75rem, section 2.125rem, item 1.375rem, tab 1.4rem, body 1.25rem, role 1.0625rem, nav and footer 1rem, meta 0.875rem. At 760px and below: hero 2.15rem, section 1.65rem, item 1.25rem, tab 1.16rem, body 1.15rem, role 1.05rem, nav, footer and meta 1rem. Nothing drops under 14px. Line-height on the statement is 1, with no tracking.

## Layout

The glass panel (`.stage` and `.page`) is `min(50rem, 100% - 2rem)` wide, centred, with a 0.4rem inset on a phone. Text inside it is left aligned and capped at 40em for the bio and 46em for the lists. The panel is frosted ice: the tint stays ice at `color-mix` 60% (62% under 760px) with a short blur (5px, 4px on a phone) so the drawing behind it stays visible. A grain tile, a top ice highlight, a light edge, and a soft offset shadow make the panel read as glass rather than a flat wash. Text on that panel stays ink. The side gutters are the cyan band `#073b4c`, with the horizontal contours in ice and signal red. Floating shapes sit across the whole background, full width and the full scroll height, in the gutters and behind the column, at every width. On a phone the same frost lets the waves and shapes through. The plate matches the panel width and is 16:9. The portrait is 8.75rem, 11rem from 640px, 13rem from 1024px, and 6.75rem on a phone, with a 2px `#c73828` ring (ice on the red profile card), overlapping the plate. Text is left aligned. Section titles and short rows (the ask, tile names) are centred. List items are 1rem apart. The intro, the tabs, the ask, and the footer are 2.5rem apart (`--space-section`). The panel under the tabs sits closer, at 1.15rem. The year and the wordmark share one size and sit on the centre line of the top bar. Inactive tabs are cyan Host Grotesk 300, at least 48px tall, with a 0.375rem radius. The active tab is ice type in a signal rectangle with the same radius that slides between tabs. Radii are 0 except the round portrait and that 0.375rem tab mark. The links card is a frosted column: 19rem wide on a phone and 23.5rem from 900px, with the portrait, the name, and the buttons scaled up with it. Website is the first button and the tallest. Coffee chat and z combinator follow at the normal button height. Under them, linkedin, github, x, and instagram are a 2×2 of the icons alone, no labels and no button chrome. The grid is the full button width, so the outer edges of the icons line up with the ends of the buttons, and each icon fills its cell. The footer is one centred row: resume, links, linkedin, github, x, instagram, each with its icon. On a wide screen the homepage row is 1.08rem with a slightly shorter gap. On a phone that homepage row stays one line, centred, and bleeds to the panel edges. Type runs from 0.86rem on a 320px screen to 1rem (14px) once the row fits, with icons at 1em, which is as large as six labels can sit on one line. On a wide screen the games shots are two columns and four rows, the height of the list, aligned to the right. A phone keeps four shots in one column beside the list.

## Motion

Links and tabs change colour in 150ms. The open tab fades in over 150ms. The gutter contours drift on the same timing as the old field, and the shapes float. `prefers-reduced-motion` removes the motion and leaves the drawing still.
