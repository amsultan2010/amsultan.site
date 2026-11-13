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
typography:
  display:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "3.75rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: "0"
  body:
    fontFamily: "Geist Serif, Georgia, serif"
    fontSize: "1.125rem"
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
  column: "38rem"
  stack: "2.5rem"
  list: "1rem"
components:
  plate:
    backgroundColor: "{colors.bg-secondary}"
  portrait:
    rounded: "{rounded.portrait}"
  tab:
    textColor: "{colors.muted}"
    typography: "{typography.label}"
  tab-active:
    textColor: "{colors.signal-text}"
    underline: "{colors.accent}"
---

# Design System: abdullahsultan.tech

## Overview

One reading column under a photograph. The portrait sits on the bottom edge of that photograph. The name is a short serif statement. Lists are a title and a light grotesk line. One scheme: ice ground, ink type, cyan for the secondary accent, signal red for the marks. No light mode, no dark mode, no toggle.

## Colors

Ice signal, from the palette in `00c4685`. Ice is now the ground and ink is the type. The cyan in that commit is the ink band `#073b4c`.

Ice `#d5eef2` is the page ground. Ink `#073b4c` is the type on it (9.97:1). Secondary text `#145e72` (6.0:1) is the same hue, lifted. Muted `#4a6d76` (4.6:1) is the inactive tab and the meta line. Cyan `#0e5c70` (6.2:1) is that band lifted to the lightest step that still clears 4.5:1 on ice. It is the tab hover, the borders, and the plate well's stronger edge. The gutter ground is the band itself, `#073b4c`, and the contours on it are ice and signal red. The well and the link buttons use a light mix, `#c5e4ea`.

Signal `#f54937` is 2.94:1 on ice, so it is the decorative red: gutter lines, shape fills, and the link-button hover wash. It is not text and not the only mark on a control. `#c73828` is 4.31:1, enough for large text and for UI marks: the section headings, the coffee chat line, the active tab underline, link underlines, arrows, and the focus ring. A press sinks 1px and the red darkens. Body-size red text, including the active tab, uses `#c13627` (4.53:1), the same hue darkened until it clears 4.5:1.

Sultan stays one cyan, `#0e5c70`. The writing wipe and the underline still cycle through the faces. The colour does not cycle. The ROYGBIV colours are gone.

## Typography

Geist Serif at medium for the statement, section titles, and sentences. The family ships one roman cut, so a 400 to 500 range paints that cut for a medium request. Host Grotesk at 300 for tabs, dates, roles, the nav, and the footer. The statement is 3rem, and 3.75rem from 768px, with line-height 1 and no tracking. Body is 1rem, and 1.125rem from 640px. Meta is 0.875rem.

## Layout

The column is 40rem, and 38rem from 1024px, centred. It is frosted ice: the tint is ice at `color-mix` 60% (62% under 760px) with a short blur (5px, 4px on a phone) so the drawing behind it stays visible and the ink body text still clears 4.5:1. Text on that panel stays ink. The side gutters are the cyan band `#073b4c`, with the horizontal contours in ice and signal red. Floating shapes sit across the whole background, full width and the full scroll height, in the gutters and behind the column, at every width. On a phone the column inset is 0.4rem and the same frost lets the waves and shapes through. The plate matches that width from 1024px and is 16:9. The portrait is 8.5rem, 10rem from 640px, and 12rem from 1024px, with a 2px `#c73828` ring, overlapping the plate by half its height. Text is left aligned. List items are 1rem apart. The intro, the tabs, the ask, and the footer are 2.5rem apart.

## Motion

Links and tabs change colour in 150ms. The open tab fades in over 150ms. The gutter contours drift on the same timing as the old field, and the shapes float. `prefers-reduced-motion` removes the motion and leaves the drawing still.
