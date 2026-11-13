# Brief: frosted glass page, games grid, content edits

Site: abdullahsultan.tech. Use /impeccable. Keep the current fonts (Geist Serif medium, Host Grotesk light/thin) and the ice signal palette (ink #073b4c, ice #d5eef2, signal red #f54937, pressed red #c73828, cyan #0e5c70). No screenshots or recordings needed. Delete this brief file in your final commit.

## Content edits (match existing bullet capitalization)
1. CrossCode: change "since 2026" (or similar) to "Aug 2026". Remove CrossCode's last bullet.
2. Cycls: add a third bullet: "Training and developing a healthcare awareness agent in collaboration with a local non-profit".
3. Z Combinator: replace the last bullet with "Guest speakers: LlamaIndex's GTM lead (Berkeley Haas graduate), managing partner of a $30M VC firm, a SpaceX intern studying at UMich, and the technical cofounder of a YC-backed voice AI startup". If that leaves a single orphan word on its last line, drop "voice AI" and change "graduate" to "grad".
4. Aspiring Doctors' Club: replace the last bullet with "Ran a diabetes awareness session with university students reaching over 60 students across middle school and high school".
5. Code Ninjas: replace the last bullet with "100 volunteer hours logged over 3 months".
6. "Coffee chat?" and "Book a meeting" on the same line. "Coffee chat?" in cyan, "Book a meeting" in signal red with a diagonal up-right arrow after it (matching the site's other link arrows) to show it opens a link.

## Places and games
7. Swap fonts: the subtitles ("where I've lived", "where you can find me (besides Riyadh)", "what I play", "stupid games I made") use Geist Serif; the captions/items (e.g. "Dhahran, Saudi Arabia", "Karachi", game names) use Host Grotesk. Center those subtitles.
8. "Stupid games I made": a list (titles with arrow links as now), and to its right a right-aligned grid of 2 rows x 4 columns of rectangular (landscape) image tiles using the 8 files in public/images/games. No captions on the images, only the image. Tiles may link to their game when the list already has its URL. Lazy-load, sensible alt text. On phones stack the grid under the list in whatever column count fits cleanly.

## Frosted glass
9. The main content column becomes translucent frosted glass (backdrop-filter blur plus an ice tint, subtle border or highlight). The waves and floating shapes fill the whole background, not just the gutters: clearly visible in the side gutters and only barely visible through the glass. Text must stay fully readable (WCAG AA for body text). Solid ice fallback when backdrop-filter is unsupported; respect prefers-reduced-motion.
10. Mobile: the wave background covers the full page behind the glass, so drop the thin side gutter strips; the glass column can go nearly edge to edge.

## Header card
11. The rectangular profile card (name with the shifting "Sultan", Riyadh, Saudi Arabia, 11th grade junior, profile photo) gets a signal red background. Its outline and the photo ring become cyan or ice, and its text ice (or cyan where it reads well). Make "Sultan" ice or cyan so it shows on red.
12. Reduce the large empty space above the top banner. Keep the "abdullahsultan.tech" label top-left, just make that top bar thinner.

## Mobile layout
13. On phones (check 360, 390, 430px) remove awkward wrapping and wasted space: use the full width, avoid single-word orphan lines and half-empty lines in bullets and paragraphs. You may tweak one or two words in a bullet or paragraph to stop a stray line without changing meaning, but keep the exact texts in items 2-5 (except as item 3 allows).

## Checks
- npm run build passes, no console errors, /links still works.
- At 1440px and 390px: the glass reads well, the games grid is 2x4 and right-aligned on desktop, and the coffee chat / book a meeting line holds.

PR title and description: plain, technical, short, no emojis, no em dashes, no hype words; a bullet list of changes.
