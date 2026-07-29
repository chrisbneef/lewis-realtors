# West Linn Search-Intent Report — 2026-07-24 (ISO week 30, theme: lifestyle)

Source: `data/raw_signals.json` (collected 2026-07-24). Free signals only —
87 Google Autocomplete phrases across 15 seeds, 56 DuckDuckGo results, 14 news
hits, 25 Google News RSS items scoped to West Linn, OR. Autocomplete shows the
*phrasing* of demand, not its volume; rank on composite signal, not one number.

## This week's recommended topic

**"What it's really like to live in West Linn: a local's honest guide"**
— theme **lifestyle** (matches week-30 parity).

Why the signal supports it:
- It sits on top of the single strongest cluster in the data. Autocomplete
  surfaces `is west linn oregon a good place to live`, `pros and cons of living
  in west linn oregon`, `living in west linn oregon reddit`, and `is west linn
  oregon safe` — repeatedly, across three different seeds. This is classic
  relocation research intent.
- It has a genuine, dated news hook for freshness (a GEO ranking factor): West
  Linn was just named **"Oregon's safest city"** (KOIN, Jul 18 2026) and
  appears on multiple "10 safest / best Oregon cities to live" lists this month.
- It feeds the funnel: relocation researchers become buyers, and this is a
  lifestyle-week piece that still earns Melissa topical authority.

**Angle / how to write it (Fair-Housing critical):** Do **not** frame this as
"West Linn is safe" or rank areas by desirability — that is steering language a
licensed broker must avoid. Instead write a factual, neighborly "what daily life
here is like" guide: schools and the district calendar, parks and the river,
things to do with kids, the Willamette restaurant strip, commute to Portland,
and the honest pros/cons people ask for on Reddit. The "safest city" ranking may
be **cited once as a third-party fact with its source**, never restated as the
broker's own characterization of any neighborhood. Run the `compliance` skill on
the draft before the PR. This is exactly the case the guardrail exists for.

## Intent by bucket

### 1. Informational
- `is west linn oregon a good place to live` — autocomplete (x3 seeds) — top relocation question.
- `pros and cons of living in west linn oregon` — autocomplete — wants an honest, two-sided guide.
- `living in west linn oregon reddit` — autocomplete — trusts peer/UGC answers; a grounded article can win the click.
- `things to do in west linn (with kids / this weekend)` — autocomplete cluster — lifestyle evergreen.
- `west linn schools` + `west linn school district calendar / bond / lunch menu` — autocomplete — strong, recurring; school-driven town.
- `west linn neighborhoods` / `neighborhood map` / `neighborhood associations` — autocomplete — maps to our per-neighborhood pages.
- `willamette area west linn restaurants` / `willamette community church` — autocomplete — hyperlocal lifestyle.

### 2. Commercial / Investigative
- `west linn real estate agents` — autocomplete — highest-intent money query; we target it indirectly, no dedicated page yet.
- `west linn home prices` / `median home price` / `average home price` / `house prices` — autocomplete — covered by the price article + market reports.
- `west linn housing market` / `west linn real estate market` — autocomplete — market-conditions research.
- `west linn oregon average income` — autocomplete (recurs across seeds) — affordability framing.
- `commercial real estate west linn oregon` — autocomplete — out of scope for Melissa's residential focus; note and skip.

### 3. Transactional
- `west linn homes for sale` + `by owner / zillow / oregon / luxury / new homes` — autocomplete — browse/act intent; served by listing & market-report pages, not articles.
- `west linn property for sale` — autocomplete — same, inventory browse.

### 4. Micro-Intent / Timely
- **"This Portland-area suburb was named 'Oregon's safest city'"** — KOIN, Jul 18 2026 (RSS) — the week's biggest evergreen-able hook (see topic above).
- "These are the 10 safest Oregon cities to live in" — Jul 10 2026 (DDG news) — reinforces the same hook.
- "West Linn says it will allow testimony on retail, not housing, in 320-unit proposal" — Jul 15 2026 (DDG news) — real local development/housing-supply story; good future real-estate-week hook.
- "Appeal heard over West Linn plan to build on landslide site" — May 28 2026 (RSS) — land-use / buildability angle for a later real-estate week.
- "Willamette River 'mega-mansion' sits unfinished 30 years later" — Jul 9 2026 (RSS) — human-interest luxury-market color.
- June restaurant food-inspection scores (Lake Oswego / West Linn / Wilsonville) — Jul 11 2026 (RSS) — lifestyle dining hook.

## Signal notes & caveats

- **Volume is inferred, not measured.** Autocomplete confirms these phrases are
  real; it cannot rank the true #1. Google Trends rolls West Linn into the
  Portland DMA, and hard per-keyword volume needs a paid tool. Google Search
  Console (Phase 3) will be the first real first-party volume signal.
- **`west linn vs lake oswego` is sports-polluted.** Every autocomplete
  completion is high-school football (`football score`, `maxpreps`, `score
  tonight`, `reddit`). A real-estate "West Linn vs Lake Oswego to buy in" article
  is still viable, but it will fight the football SERP — write it for the
  relocation query, not the rivalry.
- **`selling a house in west linn`, `buying a house in west linn`, and `moving to
  west linn` returned no autocomplete** — those exact phrasings have little
  search demand; prefer the phrasings that did complete.
- **Fair-Housing flag on the "safe" cluster.** `is west linn safe` / `is west
  linn dangerous` are high-intent but cannot be answered in the broker's voice
  as area characterizations. Cite third-party rankings only; never steer.
- **RSS is noisy with prep sports and regional politics** (MaxPreps game pages,
  statewide Oregon commentary carried under the Tidings byline). Filter to items
  that are genuinely West-Linn-local and topically relevant before using them.

## Already covered (skip)

- **Home prices by neighborhood** — `src/content/blog/west-linn-home-prices-by-neighborhood.md`
  already serves the `home prices / median / average home price` cluster. Do not
  duplicate; the price intent is handled for now.
