# The Melissa Shaw voice guide

How Melissa writes when she is writing as **herself**. Use this with `STYLE.md`.
Where the two disagree, **`STYLE.md` wins**, because it carries the hard site rules.

## What this is built on

Her site had 231 posts. Most are not usable as a voice model:

| Group | Count | Why |
|---|---|---|
| Single-property listing announcements | 21 | Not writing, just listings |
| Duplicate re-imports | 56 | A bulk republish dated 2024-09-19 |
| Empty or near-empty | 4 | Nothing there |
| Generic third-party-sounding filler (2023 to 2024) | ~76 | Only 52% even use "I". Not her voice |
| **First-person personal-story posts (2025 to 2026)** | **13** | **This guide** |

The 13 are listed at the end. They are the only posts where Melissa clearly writes
as a person with a history rather than as a real estate brand. Everything below is
measured on those 13. The full deduplicated archive of 150 unique posts lives in
`reference/melissa-blog/` as topic reference.

---

## The voice in one line

A woman who has been knocked flat by life, got back up, and now sits across from
you and says "I have been where you are, you are not alone, and here is the first
step."

## What makes it hers

1. **She has actually been through something, and she says so.** She writes about
   becoming a single mom, losing her health, losing the ability to walk, living
   through market crashes and financial instability, and moving here alone in her
   early twenties. The credibility comes from survival, not from sales volume.
2. **She names the reader's feeling before the facts.** Overwhelmed, stuck,
   isolated, paralysed, torn. The emotion always arrives before the advice.
3. **She says "you are not alone" and means it.** This is the single most repeated
   idea in her personal writing. "I see you. I hear you." is a real line of hers.
4. **Real estate is the vehicle, never the subject.** The subject is a life
   transition. Houses, prices, and timing serve that.
5. **The close is an invitation, never a pitch.** She ends on hope and an open
   door, not on urgency.

---

## Her personal-story structure

All 13 follow close to this shape. Median length **640 words** (range 578 to 765),
about **3 headings**, and **92% ask the reader a direct question**.

1. **The shared feeling.** One or two sentences naming a moment the reader
   recognises. Often a question.
2. **Her own disclosure.** What she went through, specifically and without
   self-pity.
3. **The turn.** She connects her experience to their decision. This is the hinge
   of the whole piece.
4. **The practical middle.** Two or three `##` sections with the real substance,
   usually including a short bullet list (92% of posts have one).
5. **The lift, then the open door.** A short life-affirming line, then a calm
   invitation to talk.

### How she opens

- "We've all had those moments when life knocks us flat."
- "Have you ever felt like you're living a double life? I know I have."
- "If you're standing in your home, staring at decades of belongings and memories, wondering, 'How am I ever going to pack this all up?' you are not alone."
- "Are you sitting there thinking, 'I'm never going to have a home. I don't have a down payment. I'm barely making ends meet'?"
- "Have you ever caught yourself daydreaming and thought, 'If I could live in any type or style of home, what would it be?'"

Note the move: she opens **inside the reader's head**, often quoting the exact
sentence they are saying to themselves.

### How she discloses

- "One of the most life-changing moments in my life came when I became a single mom, lost my health, and even lost the ability to walk."
- "There have been seasons where I struggled to balance my personal life, especially my health challenges, with my professional role."
- "As someone who has lived through market crashes, personal loss, and financial instability, I understand this feeling deeply."
- "As someone who moved here in my early twenties, alone and far from home, I know firsthand that living your best life starts with where you plant your roots."

Short, factual, no wallowing. The hardship is stated and then immediately put to
work for the reader.

### How she closes

- "This isn't about houses, it's about homes, memories, legacies and doing daily life together. It's about people. It's about unity. It's about family."
- "Your best life may be waiting on the other side of a single step."
- "Let's navigate this next chapter of life together."
- "Because life is best lived on your terms and you don't have to figure it out alone."
- "You don't have to go it alone. I'm here as your trusted advisor, your advocate, and your full-service support system."
- "Better together isn't just a saying, it's a way of life."

Her signature construction is **"This isn't just X, it's Y."** Use it sparingly,
because it is recognisably hers and loses force if repeated.

---

## Her words

**Reach for:** next chapter, living your best life, creative solutions, trusted
advisor, belonging, connection, community, legacy, clarity, peace of mind, you are
not alone, a real conversation, no pressure, first step, show up for each other.

**Her coined phrase:** "real estate paralysis," for freezing on a decision because
the headlines feel too loud. Reusable and distinctive.

**Avoid:** urgency and scarcity ("act now," "don't miss out"), jargon, and any
close that sounds like a pitch. Nothing in her personal writing pressures anyone.

## Mechanics

| Thing | Her practice in these 13 posts |
|---|---|
| Post length | Median 640 words. Stay 550 to 800. |
| Sentence length | Median 17 words, mean 19. Mix short punches with longer flowing ones. |
| Headings | About 3, phrased as ideas rather than labels. |
| Questions | 92% of posts ask at least one. |
| Contractions | 100%. Always "you're," never "you are" when speaking. |
| Bullets | 92%. Short lists inside the practical middle. |

---

## Where her habits must change for this site

1. **No em or en dashes.** She uses them. `STYLE.md` bans them. Use commas,
   periods, or "to" for ranges.
2. **West Linn only.** All 13 of these posts name Portland, Vancouver WA, or the
   Mid-Willamette Valley. **Not one mentions West Linn.** Never inherit the
   "Portland, OR, Vancouver, WA, and the Mid-Willamette Valley" formula.
3. **Never invent a market number.** Every figure comes from `src/data/market.json`,
   `market-history.json`, or `neighborhoods.json`, date stamped and sourced.
4. **Fair Housing.** Her community and belonging themes are lovely and also the
   easiest place to drift into steering. Keep it about amenities and daily life,
   never about who lives somewhere. Run the `compliance` skill on every draft.
5. **Do not republish.** The originals are still live on homesbylewisrealtors.com.
   Copying them would create duplicate content that hurts both sites.

## Checklist

- [ ] Opens inside the reader's head, ideally quoting their own worry.
- [ ] Contains one real, specific thing about Melissa's life or a client's.
- [ ] Says some version of "you are not alone."
- [ ] Real estate serves a life transition, not the reverse.
- [ ] Practical middle with a short bullet list.
- [ ] Closes on hope plus a low pressure invitation.
- [ ] 550 to 800 words, about 3 headings, at least one question, contractions throughout.
- [ ] Zero em or en dashes. West Linn, not Portland metro. Numbers traced to a data file.

---

## The 13 source posts

All in `reference/melissa-blog/posts/`, tagged `personal` in `INDEX.md`.

| Date | Post |
|---|---|
| 2025-11-10 | Serving Others Is at the Heart of What We Do |
| 2025-12-08 | When Real Life Meets Real Estate |
| 2025-12-22 | Feeling Stuck? This is What Helped Me Find Hope, Action, and a Fresh Start |
| 2025-05-07 | Unlocking Home Selling Success with Melissa Shaw |
| 2025-07-07 | From Dream Home to Best Life |
| 2025-04-22 | Building Belonging: The Secret to Thriving in Life and Business |
| 2025-05-19 | Overwhelmed by the Idea of Moving? |
| 2025-08-18 | What If Selling Now Leads to More Freedom, Not More Regret? |
| 2025-12-15 | Bridging the Gap: How Small Acts of Kindness Strengthen Our Neighborhoods |
| 2025-11-24 | The Market Feels Uncertain |
| 2025-07-21 | When It Feels Impossible: How One Client Found Her Path to Homeownership |
| 2025-03-10 | 3 Must-Know Factors Before Relocating to Arizona |
| 2026-01-19 | Buying a Home in Today's Market |
