# Brief: more translucent frosted glass, shapes across the whole background, cyan "sultan"

Repo amsultan2010/amsultan.site (live at abdullahsultan.tech). Main glass styles are in src/styles.css (backdrop-filter around lines 149, 628, 1306). Follow DESIGN.md and use /impeccable.

Abdullah's feedback: "I can't see the waves or shapes behind the main page."

## Changes
1. Main page column / frosted glass panel:
   - Background tint should read as ICE (#d5eef2) but be noticeably more see-through than now (lower the alpha of the ice tint, e.g. roughly 0.45-0.6 range; tune by eye).
   - Keep it looking frosted (a soft blur plus a subtle highlight/border), but reduce blur so the waves and floating shapes behind it are clearly visible through it on desktop AND mobile.
   - Body text must still pass WCAG AA contrast against the panel.
2. Floating shapes: scatter them throughout the entire page background (full viewport width and the full scroll height, in the gutters and behind the main column), not only inside/around the site column. Keep them subtle and keep prefers-reduced-motion behaviour.
3. Make the word "sultan" in the name cyan (#0e5c70 or the site's existing cyan token) instead of signal red. Keep it solid, no cycling.
4. Check mobile (< 760px) too: waves and shapes must be visible behind the glass there.

## Done when
- Waves and shapes are visibly behind the main page on desktop and phones.
- "sultan" is cyan.
- Build passes, no layout regressions.
- Delete this brief file in your final commit. Open a PR to main with a plain technical title and description (no emojis, no em dashes).
