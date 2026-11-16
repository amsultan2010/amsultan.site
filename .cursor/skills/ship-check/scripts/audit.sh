#!/usr/bin/env bash
# Static ship-check checks against a live URL. Browser-only checks
# (console errors, alt text, rendered DOM) are not covered here; use a browser.
# Usage: audit.sh https://example.com
set -uo pipefail

BASE="${1:?usage: audit.sh <base-url>}"
BASE="${BASE%/}"
PASS=0; FAIL=0

ok()   { printf 'PASS  %-22s %s\n' "$1" "${2:-}"; PASS=$((PASS+1)); }
bad()  { printf 'FAIL  %-22s %s\n' "$1" "${2:-}"; FAIL=$((FAIL+1)); }

HTML=$(curl -fsSL "$BASE/" 2>/dev/null) || { echo "cannot fetch $BASE/"; exit 1; }
code() { curl -s -o /dev/null -w '%{http_code}' -L "$1"; }
has()  { grep -qiE "$1" <<<"$HTML"; }

# sitemap
[ "$(code "$BASE/sitemap.xml")" = 200 ] && ok sitemap.xml || bad sitemap.xml "not 200"

# favicon
if [ "$(code "$BASE/favicon.ico")" = 200 ] || has '<link[^>]+rel="[^"]*icon'; then
  ok favicon; else bad favicon "no /favicon.ico and no <link rel=icon>"; fi

# robots
ROBOTS=$(curl -fsSL "$BASE/robots.txt" 2>/dev/null)
if [ -z "$ROBOTS" ]; then bad robots.txt "missing or empty"
elif grep -qiE '^[[:space:]]*Disallow:[[:space:]]*/[[:space:]]*$' <<<"$ROBOTS"; then
  bad robots.txt "contains a blanket Disallow: /"
elif ! grep -qi 'sitemap:' <<<"$ROBOTS"; then bad robots.txt "no Sitemap: line"
else ok robots.txt; fi

# 404 must return 404
[ "$(code "$BASE/definitely-not-a-real-page-xyz")" = 404 ] \
  && ok 404-status || bad 404-status "expected 404, got $(code "$BASE/definitely-not-a-real-page-xyz")"

# head tags
has '<html[^>]+lang=' && ok lang || bad lang "no lang attribute on <html>"
has '<link[^>]+rel="canonical"' && ok canonical || bad canonical "no canonical tag"
has 'property="og:image"' && ok og:image || bad og:image "no og:image"
has 'application/ld\+json' && ok structured-data || bad structured-data "no JSON-LD"
T=$(grep -oiE '<title[^>]*>[^<]*' <<<"$HTML" | head -1 | sed 's/.*>//')
[ -n "$T" ] && ok title "$T" || bad title "no <title>"

# rendered content present in source
# perl, not sed: sed is line-based and greedy, so on a single-line document
# `<script[^>]*>.*</script>` deletes everything between the FIRST script and the
# LAST one, which on an SSR framework page is the whole body. That reported a
# real page as an empty SPA shell.
BODY_TEXT=$(perl -0777 -pe 's{<script.*?</script>}{ }gsi; s{<style.*?</style>}{ }gsi; s{<[^>]*>}{ }g; s{\s+}{ }g' <<<"$HTML")
[ "${#BODY_TEXT}" -gt 400 ] && ok viewsource "${#BODY_TEXT} chars of text" \
  || bad viewsource "only ${#BODY_TEXT} chars of text in source (SPA shell?)"

# one h1
H1=$(grep -oiE '<h1[ >]' <<<"$HTML" | wc -l | tr -d ' ')
[ "$H1" = 1 ] && ok h1 "1" || bad h1 "$H1 h1 tags in source"

# 46: landmarks an agent can find without class names
MAINS=$(grep -oiE '<main(>|[[:space:]])' <<<"$HTML" | wc -l | tr -d ' ')
NAVS=$(grep -oiE '<nav(>|[[:space:]])' <<<"$HTML" | wc -l | tr -d ' ')
HEADS=$(grep -oiE '<header(>|[[:space:]])' <<<"$HTML" | wc -l | tr -d ' ')
FOOTS=$(grep -oiE '<footer(>|[[:space:]])' <<<"$HTML" | wc -l | tr -d ' ')
if [ "$MAINS" = 1 ] && [ "$NAVS" -ge 1 ] && [ "$HEADS" -ge 1 ] && [ "$FOOTS" -ge 1 ]; then
  ok semantic-html
else
  bad semantic-html "main=$MAINS nav=$NAVS header=$HEADS footer=$FOOTS (need 1 main, plus header, nav, footer)"
fi

# 48: headings name the section, not a stock label
GENERIC=$(perl -CSD -0777 -ne 'while (/<h[1-3]\b[^>]*>(.*?)<\/h[1-3]>/gis) { my $t=$1; $t=~s/<[^>]+>//g; $t=~s/\s+/ /g; $t=~s/^\s+|\s+$//g; print "$t\n" if $t eq "" || $t =~ /^(welcome|overview|introduction|section|untitled|home)$/i }' <<<"$HTML" || true)
if [ -n "$GENERIC" ]; then bad headings "$(tr '\n' ' ' <<<"$GENERIC")"; else ok headings; fi

# em-dash / emoji in served HTML
grep -q '—' <<<"$HTML" && bad em-dash "U+2014 present in homepage HTML" || ok em-dash
if perl -CSD -e 'local $/; exit(<STDIN> =~ /[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{2B00}-\x{2BFF}\x{FE0F}]/ ? 0 : 1)' <<<"$HTML"; then
  bad emoji "emoji present in homepage HTML"; else ok emoji; fi

# source maps
SM=0
for S in $(grep -oE 'src="[^"]+\.js[^"]*"' <<<"$HTML" | sed 's/src="//;s/"//' | head -10); do
  case "$S" in /*) S="$BASE$S";; http*) ;; *) S="$BASE/$S";; esac
  curl -fsSL "$S" 2>/dev/null | tail -c 400 | grep -q 'sourceMappingURL' && { SM=1; bad source-maps "$S"; }
done
[ "$SM" = 0 ] && ok source-maps

# bundle weight (gzipped, first 10 scripts)
TOTAL=0
for S in $(grep -oE 'src="[^"]+\.js[^"]*"' <<<"$HTML" | sed 's/src="//;s/"//' | head -10); do
  case "$S" in /*) S="$BASE$S";; http*) ;; *) S="$BASE/$S";; esac
  N=$(curl -fsSL -H 'Accept-Encoding: gzip' "$S" 2>/dev/null | wc -c | tr -d ' ')
  TOTAL=$((TOTAL + N))
done
KB=$((TOTAL / 1024))
[ "$KB" -lt 200 ] && ok js-bundle "${KB}KB gz" || bad js-bundle "${KB}KB gz, over 200KB"

# ---- search bar (items 37 to 44) ----
HOST=$(sed -E 's#^https?://([^/]+).*#\1#' <<<"$BASE")
# value of one attribute on the first <meta> or <link> that matches, whatever order its attributes are in
attr() { perl -0777 -ne 'while (/<(?:meta|link)\b[^>]*>/gi) { my $t = $&; if ($t =~ /'"$1"'/i && $t =~ /\b'"$2"'="([^"]*)"/i) { print $1; exit } }' <<<"$HTML"; }
len()  { perl -CSA -e 'print length($ARGV[0])' -- "$1"; }
skip() { printf 'SKIP  %-22s %s\n' "$1" "${2:-}"; }

# 37: the canonical is on this host and is live, and the twin host and http redirect to it
CANON=$(attr 'rel="canonical"' href)
case "$CANON" in
  "$BASE"|"$BASE"/*) ok canonical-host "$CANON" ;;
  *) bad canonical-host "canonical is '$CANON', audited $BASE" ;;
esac
if [ -n "$CANON" ]; then
  C=$(curl -s -o /dev/null -w '%{http_code}' "$CANON")
  [ "$C" = 200 ] && ok canonical-live || bad canonical-live "$CANON returned $C"
fi
OGURL=$(attr 'property="og:url"' content)
[ "$OGURL" = "$CANON" ] && ok og:url || bad og:url "'$OGURL' is not the canonical"
case "$HOST" in www.*) TWIN="${HOST#www.}" ;; *) TWIN="www.$HOST" ;; esac
TW=$(curl -s -o /dev/null -m 10 -w '%{http_code} %{redirect_url}' "https://$TWIN/")
case "$TW" in
  30[18]\ https://"$HOST"/*) ok twin-host "$TWIN redirects here" ;;
  000*) skip twin-host "$TWIN does not resolve (fine for a subdomain)" ;;
  *) bad twin-host "https://$TWIN/ answered $TW" ;;
esac
HP=$(curl -s -o /dev/null -m 10 -w '%{http_code} %{redirect_url}' "http://$HOST/")
case "$HP" in 30[18]\ https://*) ok http-redirect ;; *) bad http-redirect "http://$HOST/ answered $HP" ;; esac
SM_XML=$(curl -fsSL "$BASE/sitemap.xml" 2>/dev/null)
LOCS=$(grep -oE '<loc>[^<]+' <<<"$SM_XML" | sed 's/<loc>//')
OFF=$(grep -vcE "^https://$HOST(/|$)" <<<"$LOCS")
N=$(grep -c . <<<"$LOCS")
if [ "$N" = 0 ]; then bad sitemap-urls "no <loc> entries"
elif [ "$OFF" = 0 ]; then ok sitemap-urls "$N urls, all on $HOST"
else bad sitemap-urls "$OFF of $N urls are not on https://$HOST"; fi
grep -iE '^sitemap:' <<<"$ROBOTS" | grep -q "https://$HOST/" && ok robots-sitemap || bad robots-sitemap "Sitemap: line is not on https://$HOST"

# 47: each sitemap url is 200, indexable, and canonical to itself (first 15)
noindex_meta() { perl -0777 -ne 'while (/<meta\b[^>]*>/gi) { my $t=$&; if ($t =~ /\bname="robots"/i && $t =~ /noindex/i) { exit 0 } } exit 1'; }
page_canon() { perl -0777 -ne 'while (/<link\b[^>]*>/gi) { my $t=$&; if ($t =~ /rel="canonical"/i && $t =~ /\bhref="([^"]*)"/i) { print $1; exit } }'; }
BADS=""
N=0
while IFS= read -r U; do
  [ -z "$U" ] && continue
  N=$((N+1))
  [ "$N" -gt 15 ] && break
  BODY=$(mktemp)
  HDR=$(mktemp)
  CODE=$(curl -s -D "$HDR" -o "$BODY" --max-redirs 0 -m 12 -w '%{http_code}' "$U" || true)
  if [ "$CODE" != 200 ]; then
    BADS="${BADS} ${CODE} ${U}"
  elif grep -qi '^x-robots-tag:.*noindex' "$HDR" || noindex_meta <"$BODY"; then
    BADS="${BADS} noindex ${U}"
  else
    C=$(page_canon <"$BODY")
    [ "$C" = "$U" ] || BADS="${BADS} canonical:${C}!=${U}"
  fi
  rm -f "$BODY" "$HDR"
done <<<"$LOCS"
SHOWN=$N
[ "$N" -gt 15 ] && SHOWN=15
if [ "$N" = 0 ]; then bad index-urls "no sitemap urls"
elif [ -z "$BADS" ]; then ok index-urls "$SHOWN returned 200 and self-canonical"
else bad index-urls "$BADS"; fi

# 38 and 39: title and description lengths
TL=$(len "$T")
if [ "$TL" -ge 15 ] && [ "$TL" -le 65 ]; then ok title-length "$TL chars"; else bad title-length "$TL chars, want 15 to 65"; fi
DESC=$(attr 'name="description"' content)
DL=$(len "$DESC")
if [ "$DL" -ge 100 ] && [ "$DL" -le 170 ]; then ok description "$DL chars"; else bad description "$DL chars, want 120 to 160"; fi

# 40: the site name is real text on the page
NAME=$(attr 'property="og:site_name"' content)
if [ -z "$NAME" ]; then bad site-name "no og:site_name"
elif grep -qF "$NAME" <<<"$BODY_TEXT"; then ok site-name "'$NAME' is in the page text"
else bad site-name "'$NAME' is not in the page text (logo only?)"; fi

# 41: a WebSite node with other names for the site
grep -qE '"@type":[[:space:]]*"WebSite"' <<<"$HTML" && ok website-data || bad website-data "no WebSite node in the JSON-LD"
grep -q '"alternateName"' <<<"$HTML" && ok alternate-name || bad alternate-name "no alternateName in the JSON-LD"

# 43: nothing tells a crawler to stay away
RM=$(attr 'name="robots"' content)
XR=$(curl -sI "$BASE/" | grep -i '^x-robots-tag:' | tr -d '\r')
if grep -qi 'noindex' <<<"$RM $XR"; then bad indexable "noindex on the homepage: $RM $XR"; else ok indexable; fi
grep -qi 'max-image-preview:large' <<<"$RM" && ok snippet-controls || bad snippet-controls "no max-image-preview:large in the robots meta"
NF=$(curl -sL "$BASE/definitely-not-a-real-page-xyz")
grep -qiE '<meta[^>]+name="robots"[^>]+noindex' <<<"$NF" && ok 404-noindex || bad 404-noindex "the 404 page is indexable"

# 44: language versions, only when the page declares any
if has 'hreflang='; then
  has 'hreflang="x-default"' && ok hreflang-default || bad hreflang-default "hreflang without x-default"
  ALT=$(perl -0777 -ne 'while (/<link\b[^>]*hreflang="(?!x-default)([^"]+)"[^>]*href="([^"]+)"/gi) { print "$2\n" }' <<<"$HTML" | grep -vxF "$CANON" | head -1)
  if [ -n "$ALT" ]; then
    curl -fsSL "$ALT" 2>/dev/null | grep -qF "href=\"$CANON\"" && ok hreflang-return "$ALT links back" || bad hreflang-return "$ALT does not list $CANON"
  fi
else skip hreflang "one language"; fi

echo
echo "$PASS passed, $FAIL failed"
[ "$FAIL" = 0 ]
