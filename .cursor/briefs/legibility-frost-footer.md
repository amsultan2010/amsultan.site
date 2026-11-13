# Brief: legibility, real frosted glass, footer row, games grid

Repo amsultan2010/amsultan.site (abdullahsultan.tech). Use /impeccable. Follow DESIGN.md. Palette: ink #073b4c, ice #d5eef2, signal red #f54937, cyan #0e5c70.

## 1. Frosted glass (keep the translucency)
Abdullah loves how much background shows through now. Do NOT reduce visibility of the waves/shapes. But it currently looks like a flat translucent rectangle. Make it read as frosted glass: e.g. subtle noise/grain texture, a soft inner highlight on the top edge, a thin light border, gentle shadow, maybe a faint gradient sheen. Small blur tweaks only if needed.

## 2. Contrast of dark/grey text on the glass
These are far too dark/low-contrast on the semi-transparent background and must become clearly readable (aim WCAG AA vs the actual composited panel, sample over waves too):
- tab headers that are grey (inactive tabs)
- role captions, e.g. "Cycls AI Engineering Intern Fall/Winter 2026", "Software and Product Intern Summer 2026"
- footer links
- the "Stupid games I made" area text
Pick colours/weights that work on the glass (e.g. deeper ink, or adjust the caption colour), consistent across the site.

## 3. Signal red text outline
Text in signal red (not every instance needs it, use judgement) gets a thin ice-coloured outline/halo to lift it off the glass. "Book a meeting" definitely. Keep it crisp, not blurry.

## 4. Bullet dashes
The signal red dash bullets are too thin and read as empty lines. Make them bigger/thicker and clearly noticeable.

## 5. Footer
- Move the copyright (© 2026) to the top right of the page (top bar area).
- Footer becomes one centred row: Resume, LinkedIn, GitHub, X, Instagram, each with its icon brought back. Centred, not left-aligned. Higher-contrast colour.
- On phones keep it on one row if possible; if not, wrap neatly and centred.

## 6. Stupid games I made
- Centre the "Stupid games I made" title.
- Higher-contrast text.
- Desktop: images become 2 columns x 4 rows (not 4x2), right-aligned, matching the height of the list.
- Mobile: keep the current single column of 4 images beside the list (he likes it).

## 7. Font sizes
- Mobile tabs (Internships, Projects, Leadership, Extra): make the tab headers noticeably bigger and closer to their underline.
- Mobile: overall text slightly SMALLER, except the tab headers and anything that is currently too small to read (bump those up to readable). No text should be unreadably tiny on an iPhone.
- Desktop: increase overall font size a small tad.

## Done when
All of the above implemented, build passes, no layout regressions on desktop and phones. Delete this brief file in the final commit and open a PR to main with a plain technical title and description (no emojis, no em dashes).
