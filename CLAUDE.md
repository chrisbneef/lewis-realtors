# Lewis Realtors — project rules

Hyper-local West Linn, Oregon real estate site (Astro static build, Vercel).
Global operating rules in `~/.claude/CLAUDE.md` still apply; this file adds
project specifics and must not contradict them.

Voice, tone, and hard content rules live in `STYLE.md` (read it before writing
any outward-facing copy). Non-negotiables worth repeating: **no em or en
dashes**, **never invent a market number**, neighborly and calm, Fair-Housing
clean.

---

## Git: main is fine

Commit and push directly to `main` (2026-08-04: Chris removed the old
branch-first rule and the `high_stakes_gate.py` push-to-main pattern; the
friction cost more than it saved). Vercel deploys production from `main`, so a
push to `main` goes live within a couple of minutes.

Use a branch + PR only when the change is genuinely risky or Chris asks for a
review pass first.

---

## Weekly search-intent report

The blog publishes one West Linn article per week, alternating themes by ISO
week parity — **odd week = real estate, even week = lifestyle** — with each
week's topic chosen from what people are actually searching for. That choice is
driven by a weekly intent report, not by guesswork.

### Pipeline

1. **Collect.** Run `python tools/fetch_signals.py`. It writes free demand
   signals (Google Autocomplete, DuckDuckGo results + news, West Linn Tidings
   RSS) to `data/raw_signals.json`. No API keys, no paid tools.
2. **Synthesize.** Read `data/raw_signals.json` and produce a Markdown report.
3. **Save** the report to `reports/YYYY-MM-DD-intent-report.md` (the collection
   date from `raw_signals.json` → `meta.date`). One file per run, never
   overwrite a prior week.

### Rule: categorize every intent into exactly one of four buckets

1. **Informational** — schools, neighborhood comparisons, what it's like to
   live in West Linn, parks, history, commute. (Answered by articles/guides.)
2. **Commercial / Investigative** — agent selection, home valuations, price per
   square foot, "is now a good time," market reports. (Buyer/seller in research
   mode; highest E-E-A-T payoff for Melissa.)
3. **Transactional** — open houses, active inventory, listings under a specific
   price point, "homes for sale under $X." (Ready to act; served by listing /
   market-report pages, not long articles.)
4. **Micro-Intent / Timely** — interest-rate shifts, this-week local news,
   inventory updates, seasonal (school calendar in Aug, spring market).
   (Short, dated, freshness-driven hooks.)

### Report format (`reports/YYYY-MM-DD-intent-report.md`)

Use this skeleton:

```markdown
# West Linn Search-Intent Report — YYYY-MM-DD (ISO week NN, theme: <theme>)

## This week's recommended topic
<one topic, its theme, why the signal supports it, and the angle. If nothing
clears the bar, say "SKIP" and why — one strong post beats filler.>

## Intent by bucket
### 1. Informational
- <phrase> — <source: autocomplete/ddg/news/rss> — <read on the intent>
### 2. Commercial / Investigative
- ...
### 3. Transactional
- ...
### 4. Micro-Intent / Timely
- ...

## Signal notes & caveats
<what the data can and cannot say — Autocomplete shows phrases not volume;
West Linn rolls into the Portland DMA on Trends; flag anything sports- or
noise-polluted, e.g. the West-Linn-vs-Lake-Oswego football rivalry.>

## Already covered (skip)
<topics matching an existing post in src/content/blog/ — do not repeat.>
```

### Guardrails when acting on a report

- The report **recommends**; it never auto-publishes. Drafts go to a PR for
  human review before going live (Google's 2026 spam policy penalizes thin,
  unreviewed AI content; a reviewed, expert-bylined, original-data article is
  fine).
- Match the recommended theme to week parity. If the top signal fits the wrong
  theme this week, hold it for the matching week.
- Every market figure in any resulting draft comes from `src/data/market.json`
  / `market-history.json` / `neighborhoods.json`, date-stamped and sourced.
- Run the `compliance` skill's Fair-Housing check on any draft: no protected-
  class steering, no "safe / good area / family neighborhood" framing.
