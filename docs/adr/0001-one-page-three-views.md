# One page with three views, not separate pages

The page grew too long for one scroll, so it is split into three views (me, work, life) that swap in place on the one html page, with `/work` and `/life` in the address bar, the way ayaanfaisal.com does it. Separate html pages at those addresses were the alternative: they would have kept every scroll animation working as it was and given search engines one url per view. One page was picked for the instant, in-place switch.

## Consequences

- Every ScrollTrigger was written for one long scroll, so each switch has to refresh triggers and replay the new view's entrances.
- `/work` and `/life` serve the same html, whose canonical is `/`, so search engines index one page with every word in it. `sitemap.xml` stays on `/`.
- There are no `#` links. Old ones like `/#work` are not routed and land on me.
