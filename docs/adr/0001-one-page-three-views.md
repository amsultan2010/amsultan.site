# One page with three views, not separate pages

The page grew too long for one scroll, so it is split into three views (me, work, life) that swap in place on the one html page, with `?view=work` and `?view=life` in the address bar, the way ayaanfaisal.com does it. Separate pages (`/work`, `/life`) were the alternative: they would have kept every scroll animation working as it was and given search engines one url per view. One page was picked for the instant, in-place switch.

## Consequences

- Every ScrollTrigger was written for one long scroll, so each switch has to refresh triggers and replay the new view's entrances.
- Search engines still see one url, `/`, with every word in its html. The canonical and `sitemap.xml` stay on `/`.
