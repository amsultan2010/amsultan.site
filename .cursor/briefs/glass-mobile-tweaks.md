# Brief: follow-ups to PR #63

No screenshots needed. Delete this brief file in your final commit.

1. Mobile frosted glass: on phones the glass looks fully opaque and the waves and floating shapes are not visible at all behind it. Make the glass more translucent on mobile (lower the tint opacity, and confirm the background layer actually renders behind the column on phones) so the waves and shapes are faintly visible. Body text must still meet WCAG AA. Check desktop too and keep it consistent.
2. Coffee chat line: add an underline under "Book a meeting" (signal red, matching its arrow).
3. "Stupid games I made": move the arrow after each game title a little closer to the text.
4. On phones, put the image grid to the RIGHT of the games list instead of below it, so both fit in one view. If 2x4 does not fit, use a single column of 4 rows on the right showing only Five Nights at Altman's, Tesla Tricks, Saudi Surfers and Parselands. Keep desktop as the 2x4 grid.
5. The signal red header card (name, location, grade, profile photo) should extend horizontally to the full width of the content column, right up to where the gutters start, instead of stopping short. Not the full viewport width. Keep its inner content aligned with the rest of the page.

Checks: npm run build passes; verify at 360, 390, 430 and 1440px.
PR title and body: plain, technical, short, no emojis, no em dashes.
