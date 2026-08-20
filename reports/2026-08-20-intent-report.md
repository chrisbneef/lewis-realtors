# West Linn Search-Intent Report — 2026-08-20 (ISO week 34, theme: lifestyle)

Source: `data/raw_signals.json` (collected 2026-08-20). Free signals only —
89 Google Autocomplete phrases across 15 seeds, 56 DuckDuckGo results, 21 news
hits, 25 Google News RSS items scoped to West Linn, OR. Autocomplete shows the
*phrasing* of demand, not its volume; rank on composite signal, not one number.

> **Catch-up note.** Weeks 31, 32, and 33 (Jul 31, Aug 7, Aug 14) have no report
> and no post. Those weeks cannot be reported retroactively — `fetch_signals.py`
> collects live and has no date argument, so the only honest snapshots that exist
> are 2026-07-24 and this one. A recovery plan for the three missed weeks, built
> from *dated* news hooks that fall inside that window and are still live in this
> snapshot, is at the end of this file.

## This week's recommended topic

**"The Willamette Falls Locks, and the fight to open them again"**
— theme **lifestyle** (matches week-34 parity).

Why the signal supports it:
- It sits on the strongest lifestyle cluster in the data. Autocomplete returns a
  full eight-phrase set on `things to do in west linn` — including `things to do
  in west linn today`, `this weekend`, `with kids`, and `fun things to do in
  west linn oregon`. That is recurring, high-frequency local intent with no
  article behind it yet.
- It has a genuine dated hook for freshness: **"The historic Willamette Falls
  Locks closed 15 years ago. This group is trying to reopen them"**
  (OregonLive, Aug 17 2026, RSS). The Tidings piece **"West Linn's
  out-of-this-world history"** (Jun 27 2026) reinforces the same appetite.
- It is the one landmark that is unambiguously *West Linn's* rather than
  Portland-metro-generic, which is exactly the entity-clarity GEO wants.
- It complements rather than repeats `what-its-like-to-live-in-west-linn`
  (Jul 24), which handled the broad relocation question at altitude.

**Angle / how to write it:** a place piece, not a news piece. What the Locks are,
why they mattered to the river towns, what closed them in 2011, who is working to
reopen them now and what that would mean for the riverfront, and how to actually
go see them today with kids. Cite the OregonLive story once, with its date and
source, for the reopening effort. Keep it neighborly and calm. No market figures
are needed; if any appear they come from `market.json` and are labeled asking
prices. Fair-Housing surface is low here, but run the `compliance` skill anyway
before the PR.

## Intent by bucket

### 1. Informational
- `things to do in west linn oregon` / `today` / `this weekend` / `with kids` / `fun things to do` — autocomplete (8 phrases, 1 seed) — the week's densest cluster; drives the recommendation above.
- `is west linn oregon a good place to live` — autocomplete (recurs across 2 seeds) — top relocation question, already served by the Jul 24 post.
- `living in west linn oregon reddit` / `living in west linn reddit` — autocomplete — trusts peer answers; a grounded local article can win the click.
- `west linn schools` / `school district calendar` / `school calendar 25 26` / `school lunch menu` / `school bond` — autocomplete (10 phrases) — strong and seasonal; late August is exactly when this peaks.
- `west linn neighborhoods` / `neighborhood map` / `neighborhood associations` / `neighborhood pool` — autocomplete — maps directly onto our per-neighborhood pages.
- `willamette area west linn` / `restaurants willamette area west linn` / `willamette community church west linn` — autocomplete — hyperlocal, Willamette-district specific.
- `live music in west linn` / `live music in west linn tonight` — autocomplete — small but genuine events intent.
- `west linn oregon average income` — autocomplete (recurs across 4 seeds) — affordability framing, not a standalone topic.

### 2. Commercial / Investigative
- `west linn real estate agents` — autocomplete — the highest-intent money query; still no dedicated page targeting it.
- `west linn housing market` / `west linn real estate market` / `west linn oregon housing market` — autocomplete (3 phrases) — market-conditions research; served by `/market-reports`.
- `west linn home prices` / `median home price` / `average home price` / `house prices` — autocomplete (6 price phrases across 2 seeds) — **see the correction under "Already covered"; this cluster is not actually covered.**
- `west linn property taxes` / `property tax rate` / `oregon property tax rate` — autocomplete (6 phrases) — covered by the Jul 17 post.
- `west linn vs lake oswego reddit` / `west linn or lake oswego` — autocomplete — real comparison intent buried in a sports SERP (see caveats).
- `commercial real estate west linn oregon` — autocomplete — outside Melissa's residential focus; note and skip.

### 3. Transactional
- `west linn homes for sale` + `by owner` / `zillow` / `oregon` / `west linn oregon homes for sale zillow` — autocomplete (10-phrase seed, the largest in the run) — browse and act intent; served by listing and market-report pages, not articles.
- `west linn luxury homes for sale` — autocomplete — maps to Skyline Ridge / Stafford service fit.
- `west linn waterfront homes for sale` — autocomplete — small, distinctive, and on-brand for the river towns.
- `west linn new homes for sale` — autocomplete — ties into the development stories below.
- `west linn property for sale` / `west linn real estate for sale` — autocomplete — inventory browse.

### 4. Micro-Intent / Timely
- **Willamette Falls Locks reopening effort** — OregonLive, Aug 17 2026 (RSS) — this week's recommendation.
- **"'Don't want to be like the middle of Portland': West Linn housing developments spur pushback"** — OPB, Jul 24 2026 (RSS + DDG news) — the biggest real-estate story of the missed window.
- **"Watch: New Oregon housing law causing controversy in West Linn"** — OregonLive, Jul 27 2026 (RSS + DDG news) — same story, state-law framing.
- **"West Linn says it will allow testimony on retail, not housing, in 320-unit proposal"** — OregonLive, Jul 27 2026 (RSS) — the concrete local instance.
- **Wilsonville transit line through West Linn exceeds ridership expectations** — Your Oregon News, Aug 18 2026 (RSS) — commute-and-connection angle, lifestyle or real estate.
- Planning commission chair announces City Council candidacy (Aug 11) and a former councilor announces for an open seat (Aug 13) — Your Oregon News (RSS) — land-use politics context; useful background, not a post.
- `west linn school calendar 25 26` / `west linn schools closing` — autocomplete — seasonal August spike, short and dated by nature.
- "Appeal heard over West Linn plan to build on landslide site" — OregonLive, May 28 2026 (RSS) — buildability angle, still unused.

## Signal notes & caveats

- **Volume is inferred, not measured.** Autocomplete confirms these phrases are
  real; it cannot rank the true #1. Google Trends rolls West Linn into the
  Portland DMA, and hard per-keyword volume needs a paid tool.
- **DuckDuckGo news was badly geo-polluted this run.** The query `West Linn OR
  real estate news` returned a San Luis Obispo railroad feature, a Missouri
  school board shakeup, and Iowa high school basketball — the `OR` was read as
  the boolean, not the state. Two seeds (`Buying a home in West Linn vs Lake
  Oswego`, `Living in West Linn Oregon`) returned no news at all. Treat DDG news
  as low-confidence this week; the Google News RSS feed carried the real signal.
- **`west linn vs lake oswego` is still sports-polluted.** Every completion is
  high-school football (`football score`, `maxpreps`, `score tonight`, `2025`).
  The relocation comparison article remains viable, but write it for the
  relocation query, not the rivalry.
- **`selling a house in west linn`, `buying a house in west linn`, and `moving to
  west linn` again returned zero completions** — the same result as Jul 24.
  Two consecutive empty runs is a pattern, not noise: prefer the phrasings that
  do complete.
- **`living_w_linny`** is an unrelated social handle polluting the `living in
  west linn` seed. Ignore both completions.
- **The RSS feed this week is unusually heavy with tragedy and crime** — a fatal
  house fire (Jul 30 to Aug 13, four separate items), an obituary, a kidnapping
  and strangulation suspect, a lightning strike. None of it is usable as a
  content hook, and using any of it would be a serious tone failure. Filtered out
  entirely.
- **Fair-Housing flag persists on the "safe" cluster.** `is west linn oregon
  safe` and `is west linn oregon dangerous` recur across two seeds. These cannot
  be answered as area characterizations in a licensed broker's voice.
- **Competitive note, not a topic:** a Portland-metro "Top REALTORS" PR placement
  ran Aug 18 2026 naming another agent, framed around the Oregon market
  "returning to healthy." Awareness only.

## Already covered (skip)

- **The living / relocation / pros-and-cons cluster** — `src/content/blog/what-its-like-to-live-in-west-linn.md` (2026-07-24, lifestyle). Do not duplicate.
- **The property tax cluster** — `src/content/blog/west-linn-property-taxes-explained.md` (2026-07-17, real estate). Covers rate, what drives the bill, and the Measure 50 quirk.

**Correction to the 2026-07-24 report.** That report listed
`src/content/blog/west-linn-home-prices-by-neighborhood.md` as already covering
the `home prices / median / average home price` cluster and told the next writer
not to duplicate it. **That file does not exist.** `src/content/blog/` contains
exactly the two posts above. The price cluster — 6 price phrases across 2 seeds, one of
the densest commercial signals in both snapshots — has been sitting uncovered and
explicitly deprioritized for four weeks. It is the strongest real-estate-week
candidate on the board.

## Recovery plan for weeks 31, 32, 33

These are recommendations for posts, not backdated reports. Each hook below is
real and dated inside the week it is assigned to, and all three are still live in
today's snapshot.

| Week | Date | Theme | Recommended topic | Hook |
|---|---|---|---|---|
| 31 | Jul 31 | real estate | **West Linn home prices by neighborhood** — the cluster the last report wrongly marked as covered | Standing demand: 6 price phrases across 2 seeds, present in both snapshots. Figures from `market.json`, labeled asking prices. |
| 32 | Aug 7 | lifestyle | **The Willamette district: Main Street, the restaurants, the church, the river** | `willamette area west linn` + `restaurants willamette area west linn` autocomplete cluster. |
| 33 | Aug 14 | real estate | **What the 320-unit proposal and the new state housing law mean for West Linn homeowners** | OPB Jul 24, OregonLive Jul 27 (x2). Land-use and supply, factual and non-partisan. |

If only one of the three gets written, write week 31. It has the strongest
standing search demand, it is a real-estate week, and it closes a gap the
pipeline created itself.
