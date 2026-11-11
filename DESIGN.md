---
name: abdullahsultan.tech
description: a quiet column in matt palmer's warm paper palette
colors:
  bg: "#f5f2ee"
  bg-secondary: "#ede9e3"
  text: "#2c2825"
  text-secondary: "#5c554e"
  muted: "#656d79"
  heading: "#1a1714"
  line: "#ddd8d1"
  accent: "#6d5db5"
  accent-hover: "#5a4d9a"
  bg-dark: "#1a1714"
  text-dark: "#ede9e3"
  heading-dark: "#f5f2ee"
  accent-dark: "#8b7dd4"
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
---

# Design System: abdullahsultan.tech

## Overview

One reading column under a photograph. The portrait sits on the bottom edge of that photograph. The name is a short serif statement. Lists are a title and a light grotesk line. Light mode is warm paper. Dark mode is the same hues, inverted.

## Colors

Taken from mattpalmer.io.

Light ground `#f5f2ee`, secondary `#ede9e3`, text `#2c2825`, secondary text `#5c554e`, muted `#656d79`, heading `#1a1714`, line `#ddd8d1`, accent `#6d5db5`, pressed accent `#5a4d9a`.

Dark ground `#1a1714`, secondary `#242019`, text `#ede9e3` at 85% opacity, secondary text `#b5afa7`, muted `#9ca3af`, heading `#f5f2ee`, line `#3a3530`, accent `#8b7dd4`, pressed accent `#a99ae0`.

## Typography

Geist Serif at medium for the statement, section titles, and sentences. The family ships one roman cut, so a 400 to 500 range paints that cut for a medium request. Host Grotesk at 300 for tabs, dates, roles, the nav, and the footer. The statement is 3rem, and 3.75rem from 768px, with line-height 1 and no tracking. Body is 1rem, and 1.125rem from 640px. Meta is 0.875rem.

## Layout

The column is 40rem, and 38rem from 1024px, centred. The plate matches that width from 1024px and is 16:9. The portrait is 8.5rem, 10rem from 640px, and 12rem from 1024px, with a 4px ring in the page ground, overlapping the plate by half its height. Text is left aligned. List items are 1rem apart. The intro, the tabs, the ask, and the footer are 2.5rem apart.

## Motion

Links and tabs change colour in 150ms. The open tab fades in over 150ms. `prefers-reduced-motion` removes both.
