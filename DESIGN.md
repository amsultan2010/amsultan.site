---
name: abdullahsultan.tech
description: a quiet column on the ice signal palette
colors:
  ink: "#073b4c"
  ice: "#d5eef2"
  signal: "#f54937"
  signal-deep: "#c73828"
  bg: "#073b4c"
  bg-secondary: "#174959"
  text: "#d5eef2"
  text-secondary: "#b4d1d7"
  muted: "#8baeb6"
  heading: "#d5eef2"
  line: "#5e8692"
  accent: "#f54937"
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
    textColor: "{colors.heading}"
    underline: "{colors.signal}"
---

# Design System: abdullahsultan.tech

## Overview

One reading column under a photograph. The portrait sits on the bottom edge of that photograph. The name is a short serif statement. Lists are a title and a light grotesk line. One scheme: ink ground, ice type, signal red for the active tab line and for link underlines. No light mode, no dark mode, no toggle.

## Colors

Ice signal, from the palette in `00c4685`. The cyan band in that commit is the ink ground itself.

Ink `#073b4c` is the page ground. Ice `#d5eef2` is the type on that ground (9.97:1). Secondary text `#b4d1d7` (7.5:1). Muted `#8baeb6` (5.1:1) is the inactive tab and the meta line, a grey tinted from ice and ink. Line `#5e8692` (3.1:1) is the control border. `#174959` is the only lighter cyan, used on the plate well and the link buttons.

Signal `#f54937` is the accent: the active tab line, the link underline, and the arrow on hover. It is 3.4:1 on ink, enough for that line and for large text, and not for body type, so link words stay ice. Pressed red `#c73828` is 2.3:1 on ink, so it is not painted as type or as the only state mark. A press sinks the control 1px and the signal line stays.

The word sultan cycles red `#ff7460`, orange `#ff8a4a`, yellow `#ffe35e`, green `#5ec43a`, blue `#5eb0ff`, indigo `#9aa0ff`, violet `#b794ff`. Each clears 4.5:1 on the ink ground.

## Typography

Geist Serif at medium for the statement, section titles, and sentences. The family ships one roman cut, so a 400 to 500 range paints that cut for a medium request. Host Grotesk at 300 for tabs, dates, roles, the nav, and the footer. The statement is 3rem, and 3.75rem from 768px, with line-height 1 and no tracking. Body is 1rem, and 1.125rem from 640px. Meta is 0.875rem.

## Layout

The column is 40rem, and 38rem from 1024px, centred. The plate matches that width from 1024px and is 16:9. The portrait is 8.5rem, 10rem from 640px, and 12rem from 1024px, with a 4px ring in the page ground, overlapping the plate by half its height. Text is left aligned. List items are 1rem apart. The intro, the tabs, the ask, and the footer are 2.5rem apart.

## Motion

Links and tabs change colour in 150ms. The open tab fades in over 150ms. `prefers-reduced-motion` removes both.
