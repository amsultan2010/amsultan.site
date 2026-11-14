# Brief: dashes, tab pill, type scale, alignment and spacing polish

Repo amsultan2010/amsultan.site (abdullahsultan.tech). Use /impeccable. Follow DESIGN.md. Palette: ink #073b4c, ice #d5eef2, signal red #f54937, cyan #0e5c70. Check desktop and phone widths (375, 390, 430, 768, 1280, 1440).

## 1. Bullet dashes
PR #66 made the signal red dashes far too big and misaligned. Set their size roughly halfway between the pre-#66 size and the current size. Vertically centre each dash on the first line of its bullet text (optical middle of the x-height), consistent on desktop and phones.

## 2. Tabs (Internships, Projects, Leadership, Extra)
Replace the current style (signal red text with outline plus red underline) with:
- Active tab: ice text inside a solid signal red rectangle (small radius OK). The rectangle slides between tabs the way the underline currently moves. Respect prefers-reduced-motion.
- Inactive tabs: cyan text.
- Keep tab text readable on phones.

## 3. Section title below the tabs
The title under the tabs (e.g. "Places" / the panel heading) sits way too far below the tabs. Tighten that gap so it matches the rhythm of the page.

## 4. Top bar
Vertically centre "abdullahsultan.tech" and "© 2026" within the top bar (middle height), aligned to each other.

## 5. Font sizing
Font sizes across the site feel inconsistent. Define one clear type scale (CSS custom properties) for desktop and a matching one for phones: name/hero, section titles, tab labels, item titles, role captions, body/bullets, small meta, footer. Apply it everywhere so every size has a reason and similar elements match. Nothing unreadably small on an iPhone; desktop stays slightly larger than phones.

## 6. Site-wide polish
Fix every alignment, spacing and distance issue across the site: misalignment, empty boxes, odd empty space, awkward gaps between sections, inconsistent margins. Centre more things where it helps (section titles, short rows). Use a consistent vertical spacing scale between sections. Make it feel polished, cohesive and organised. Do not change content, palette, the glass translucency or the frost.

## Done when
All of the above implemented, build passes, no regressions on desktop and phones. Delete this brief file in the final commit, then open a PR to main with a plain technical title and description (no emojis, no em dashes).
