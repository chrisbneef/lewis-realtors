# Lewis Realtors — Style and Content Rules

The voice and the brand facts for every page on this site. Read this before writing
or editing copy.

## Tone

- Knowledgeable, neighborly, and calm. Never salesy or pushy.
- Lead with information, not pressure. If a home or a moment is not right, say so.
- Plain English over jargon. Explain a stat the way you would to a friend at the door.

## Hard rules

- **Never use em-dashes (—) or en-dashes (–) anywhere in site copy.** Use commas, periods,
  or the word "to" for ranges (for example "$550K to $850K").
- **Never invent market numbers.** Every stat comes from the office RMLS pull. Until a real
  figure is loaded, label it visibly as a sample (use the `tag-sample` style or a
  `pill--placeholder`). Placeholders must read clearly as placeholders.
- No leftover mortgage or loan product copy. Financing is a referral out to a partner, not a
  product we sell.

## Brand facts

- Office: Lewis Realtors. Market: West Linn, Oregon. ZIP 97068, Clackamas County.
- School district: West Linn-Wilsonville School District.
- Agent: Melissa Shaw, Founder. Principal Broker in Oregon, Designated Broker in Washington.
- Phone: (503) 489-8367.
- The IDX / RMLS disclaimer lives in the footer and must stay verbatim (see `src/data/site.json`).

## Design system

- Colors: Matte Noir `#1A1A1A`, Gilded Edge Gold `#C8A04A` (metallic gradient), Azure Sky Blue
  `#6C82A5`, Parchment Cream `#F6F1E7`. Tokens in `src/styles/tokens.css`.
- Type: Cormorant Garamond (display serif), Jost (body sans), Pinyon Script (accent only).
- Light and dark themes both supported; toggle persists to `localStorage`.

## The neighborhood is the unit

Each West Linn neighborhood is its own deep page with one conversion: "Get the {Neighborhood}
market report." A secondary conversion ("What is my home worth?") reuses the same endpoint with
`formType: "valuation"`. To add a neighborhood, fill its row in `src/data/neighborhoods.json` and
set `complete: true`; the template and report page generate from the data.
