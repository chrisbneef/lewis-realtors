# Can any of the old blog be reused for West Linn?

Short answer: **no post can be brought over as content.** Zero of the 150 unique
posts mention West Linn, so nothing here is West Linn specific. What is reusable
is a small number of **angles**, rebuilt from scratch with West Linn facts.

## Why nothing imports as-is

| Group | Count | Verdict |
|---|---|---|
| Contains dated market statistics | 48 | **Dead.** Wrong market and stale numbers. |
| Names Portland, Vancouver WA, or the Mid-Willamette Valley | 43 | **Dead as written.** Would be a full rewrite. |
| Place agnostic evergreen | 59 | Topic may be reusable. The post is not. |
| **Mentions West Linn** | **0** | |

Two hard reasons not to copy anything, even the evergreen ones:

1. **Duplicate content.** Every original is still live on homesbylewisrealtors.com.
   Republishing the same text would split ranking signal and can hurt both sites.
2. **The market is wrong.** Her old blog serves Portland and Vancouver WA. This
   site is West Linn only. Importing that framing dilutes exactly the hyper-local
   focus the new site is built on.

Also note most of the 59 evergreen posts are commodity explainers from the
generic 2023 to 2024 era: title insurance, earnest money, appraisal basics,
purchase agreements. Every agent site has those. They rank for nothing and say
nothing about West Linn. Skip them.

---

## The angles actually worth rebuilding

Ten candidates. Each is a **new article written from scratch** for West Linn, using
`src/data/market.json` for any figure and `MELISSA-VOICE.md` for the voice. The old
post is a starting angle only, never a source of sentences.

### Strongest, because they match real West Linn search demand

1. **Choosing a West Linn neighborhood**
   From "Finding your Ideal Neighborhood" and "The Neighborhood Wish List".
   Maps to the confirmed `west linn neighborhoods` and `neighborhood map` demand,
   and links straight into the 12 neighborhood pages we already publish. Probably
   the single highest value rebuild.

2. **What it costs to own here beyond the mortgage**
   From "3 Most Important Insurance Policies" and the HOA posts.
   Pairs with the property-tax article already written.

3. **Buy first or sell first in a $975K market**
   From "Buy First or Sell First? 3 Things to Consider".
   A genuine move-up problem at West Linn price points, and a strong commercial
   intent piece.

4. **HOA documents in West Linn's planned enclaves**
   From "HOA? Beware the Rules and Regulations" and "What to Look for in the HOA
   Documents". Directly relevant to Barrington, Hidden Creek, Tanner Creek and
   Savanna Oaks.

### Strongest, because they carry her personal voice

5. **Getting unstuck when you keep putting off the move**
   From "The Real Estate Reset" plus her own "real estate paralysis" idea.

6. **Overwhelmed by decades of belongings**
   From "Overwhelmed by the Idea of Moving?". Her downsizing and "next chapter"
   territory, one of her best personal pieces.

7. **When homeownership feels out of reach**
   From "Think Home Ownership Is Out of Reach?" and "When It Feels Impossible".
   Connects to the `west linn oregon average income` affordability searches.

### Strongest, because they are genuinely non-obvious

8. **What solar panels do to a home sale**
   From "Thinking About Solar Panels?". Her best "what nobody tells you" piece.
   Rewrite with Oregon specifics.

9. **The risk of letting a buyer move in before closing**
   From "The Hidden Risks of Letting Buyers Move in Before Closing". Rare, useful,
   and exactly her voice.

10. **What happens when something goes wrong mid-sale**
    From "What Happens When Unexpected Issues Come Up While Selling a Home".

---

## Do not rebuild

- The "Everything you need to Know about Relocating" series (parts 1 to 4) and
  "First Time Homebuyer Steps to Success" (steps 1 to 3). Generic syndicated filler.
- Title insurance, earnest money, appraisal basics, purchase agreement mechanics,
  home warranties, pest inspections. Commodity content.
- Houseboats, boats, luxury buyer tips, and relocating to Arizona. Not West Linn.
- Anything with a market statistic in it. Our numbers come from our own data files.

## Rules for any rebuild

- Write it new. Do not paste, lightly edit, or spin the old text.
- Every figure from `src/data/market.json`, `market-history.json`, or
  `neighborhoods.json`, date stamped and sourced.
- `MELISSA-VOICE.md` for voice, `STYLE.md` for the hard rules. No em or en dashes.
- Fair Housing check via the `compliance` skill, especially on neighborhood pieces.
- Match the weekly theme parity in `CLAUDE.md`: odd week real estate, even week
  lifestyle.
