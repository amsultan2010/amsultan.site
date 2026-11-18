<!-- Condensed from emilkowalski/skills (emil-design-eng, animation-vocabulary). DESIGN.md and Impeccable win any disagreement. Refine motion that exists; do not add motion the design did not ask for. -->

# Motion and polish

## Easing and duration
- Entering or responding to input: `ease-out` with a custom curve, e.g. `cubic-bezier(0.23, 1, 0.32, 1)`. Never `ease-in` for UI feedback.
- Moving something already on screen: `ease-in-out`.
- Hover and press: 100-200ms. Small UI (dropdowns, tooltips): 150-250ms. Larger panels and modals: 250-400ms. Nothing over 500ms in UI.
- Transition exact properties (`transform`, `opacity`, `color`), never `transition: all`.
- Animate only `transform` and `opacity`, not `width`, `height`, `top` or `margin`.

## Entrances and exits
- Nothing appears from nothing: start from `scale(0.95)` with `opacity: 0`, not `scale(0)`.
- Exits are faster and quieter than entrances.
- Stagger lists by 30-60ms per item, and keep the whole cascade under about 400ms.
- Popovers and menus scale from their trigger (`transform-origin` at the anchor), not from the centre.

## Feedback
- Buttons get a press state, e.g. `scale(0.97)` on `:active`.
- Hover effects are gated behind `@media (hover: hover)` so they don't stick on touch.
- Frequent actions (typing, toggling, keyboard shortcuts) get little or no animation.

## Detail
- Shadows: layered and soft, tinted toward the background, never pure black at high opacity.
- Borders: hairline, low-contrast. Prefer one of border or shadow, not both heavy.
- Optical alignment over mathematical: icons beside text and play triangles may need a 1px nudge.
- Numbers that change use `font-variant-numeric: tabular-nums`.

## Accessibility
- Every animation respects `prefers-reduced-motion: reduce`: drop movement, keep at most a short opacity fade.
- Never loop motion near reading content. Autoplaying motion can be paused.

## Vocabulary
Name changes in the report with these terms: fade, slide, scale-in, pop, stagger, crossfade, spring, ease-out, ease-in-out, layout animation, shared element transition, clip-path reveal, parallax, scroll-linked, hover lift, press.

## Report format
Motion and polish changes go in a table: | Before | After | Why |.

## Premium details (defaults; DESIGN.md wins)
- Numbers: `font-variant-numeric: tabular-nums` on stats, prices, timers, tables.
- Headings `text-wrap: balance`; body `text-wrap: pretty`.
- Concentric radius: inner radius = outer radius - padding.
- Squircle corners (Apple-style ~60% smoothing): `border-radius: 24px; corner-shape: squircle;` (or `superellipse()`). Chromium only; others fall back to plain radius, so it is safe.
- Alpha borders: `1px solid rgb(0 0 0 / 0.08)` or `color-mix()`, not solid grey.
- Layered shadows: 2-3 soft tinted shadows, not one hard one.
- Optical centering: nudge icons/play glyphs 1-2px so they look centred.
- Popovers scale from their trigger (`transform-origin` at the anchor).
- Strong ease-out `cubic-bezier(0.23, 1, 0.32, 1)` for anything reacting to input.
- Masked scroll edges: `mask-image: linear-gradient(to right, transparent, #000 24px, #000 calc(100% - 24px), transparent)` on scrolling rows.
- Tactile buttons: `:active { transform: scale(0.97) }`; hover styles only inside `@media (hover: hover)`.
