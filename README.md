# Immune System — Level 3 Quest

Three variations of one Level 3 "Quests"-format quest (per the Term 2 Quests
Design & Framework Guidelines), all covering the full immune system topic —
pathogens & transmission, physical/chemical barriers, phagocytes,
lymphocytes & antibodies, vaccines/immunity and antibiotics — but each
framed through a different real-world decision-making role, per **Approach
A** ("same process, different lens/framing/output"). No two share both a
lens and an output format.

Prepared for **Shalom, Michael, and Karis**. Served from one domain/one
repo — three folders, not three repositories:

| Instance | Path | Lens | Day 2 decision activity | Day 3 output |
|---|---|---|---|---|
| Shalom | `/shalom/` | 🚨 Outbreak Response Commander | Allocate 12 resource tokens across 6 settlements with different real R0/transmissibility profiles; unresourced zones roll a die to see if the outbreak spreads | Containment Briefing |
| Michael | `/michael/` | 💰 Vaccine Program Director | Run a 100-unit budget across 5 disease programs using the real herd-immunity threshold formula (1 − 1/R0); draw Budget Event cards for real mid-cycle shocks | Funding Pitch |
| Karis | `/karis/` | 🩺 Field Triage Medic | Work a 10-patient shift with only 3 antibiotic tokens, deciding on each patient as their card is drawn face-down, one at a time | Shift Handover Report |

`index.html` at the repo root is a name-check gate, not a page of links —
see "Individual displays" below.

## Individual displays (kids can't wander into a sibling's quest)

Each instance is meant to be worked through on its own — no distractions
from seeing what the other two are doing. This is enforced client-side
(there's no backend, so it's a soft, distraction-reducing gate, not real
access control — a determined kid could still view source):

- **`index.html`** no longer links directly to `/shalom/`, `/michael/`,
  `/karis/`. It's just a "Who's continuing their quest?" name box. Typing a
  recognized name stores it (`localStorage`, key `imm-l3-kid`) and routes
  straight to that kid's own page. Typing anything else shows an error, not
  a hint about who the valid names are. A returning kid on the same device
  sees "Welcome back, \<name\>" instead of retyping.
- **Each kid page** (`shalom/`, `michael/`, `karis/index.html`) re-checks
  that same stored name on load, before anything renders — a blocking
  inline `<script>`/`<style>` in `<head>` hides `<main>` before first paint,
  so there's no flash of another kid's content. If the stored name doesn't
  match that page's own kid, a "This is \<X\>'s quest" screen stays up with
  its own name box (scoped to only accept that one name) instead of the
  reading. So visiting Karis's URL while checked in as Shalom — or with
  nothing checked in yet — shows the block screen, not Karis's quest.
- A **"🔁 Switch quest"** button in the header clears the stored name and
  returns to the hub, for shared devices between sessions.

## Highlighter + side notes

Each kid page has a built-in highlighter and a notes panel, both scoped and
saved per kid/page (`localStorage`, keys `imm-l3-hl::<kid>` and
`imm-l3-notes::<kid>`) so they persist across a reload but never mix
between kids:

- **Highlighter** — select any text in the reading (or anywhere else in
  `<main>`) and a small "🖍 Highlight" button appears next to the selection;
  clicking it wraps the exact selected text in a `<mark>`, even across
  nested `<strong>`/`<em>` tags. Click an existing highlight to remove it.
  Highlights are stored as plain-text offsets within their paragraph/list
  item (auto-tagged at load time), so they reapply correctly on reload
  regardless of how the selection crossed inline formatting.
- **Side notes** — a "📝 My Notes" button in the header opens a slide-in
  drawer with two parts: a running list of every highlighted snippet (with
  its own remove button, synced with the on-page highlight), and a free
  textarea for typed notes, auto-saved on every keystroke.

Implementation: `QuestUI.initHighlighter(pageKey)` and
`QuestUI.initNotesDrawer(pageKey)` in `js/quest.js`, called once per kid
page with that page's own key (`'shalom'` / `'michael'` / `'karis'`).

## Why this structure (and not the earlier build)

An earlier draft of this repo used a quiz/certificate/lock-progression
website format borrowed from a different LifeHub Risers course. That
format doesn't fit this program's actual **Term 2 Quests Design &
Framework Guidelines** (Level 3 = "Quests" format, not "Discovery"), which
explicitly rule out visible quiz/test/assessment language and require a
scenario-driven, decision-under-constraints structure instead. This build
replaces that draft entirely.

## What each instance follows, per the framework

- **Cover** — format pill, lens-specific subtitle, kid's name, a framing
  paragraph establishing the identity and the week's real stakes.
- **Day 1 reading** — opens with a proper intro (not a cold list), covers
  the full topic to IGCSE-textbook depth, includes a mandatory **History**
  section (real dates/names: Jenner 1796, Pasteur 1880s, Metchnikoff 1882 /
  Nobel 1908, von Behring 1890 / Nobel 1901, Fleming 1928, WHO smallpox
  eradication 1980, mRNA vaccines 2020) and a mandatory **Real-World
  Application** section, with invisible-evaluation prompts (rotating
  mechanisms — explain-the-error, compare-two-cases, evidence-sourcing,
  teach-it-forward) embedded roughly once per sub-section. Nothing on the
  page is labeled "quiz," "test," or "assessment."
- **Materials** — presented as a pool to choose from (checkboxes), not a
  fixed checklist, with common fallbacks noted inline. Selections live-update
  a printable "Materials I'm Bringing" slip, isolated on its own printed
  page via `@media print` (same mechanism as a certificate-print isolation
  pattern — nothing else on the page prints alongside it).
- **Day 2** — a real, physical, non-symbolic decision activity with genuine
  unpredictability (a die roll, a shuffled event deck, or face-down patient
  cards) that the student doesn't fully control in advance. Structured like
  a real report: a plan/prediction table filled in *before* acting, a
  decision log filled in *during*, a results tally, and a self-check
  reflection prompt.
- **Day 3** — a concrete presentation hook (not "begin your presentation"),
  a kid-facing "what to include" checklist, and a facilitator-only tip
  (visually marked `FACILITATOR ONLY`) that reframes an imperfect outcome as
  the most interesting part of the presentation, not something to hide.

## Real data used (not fabricated)

R0 and herd immunity threshold figures (flu ~0.9–2.1 / ~45–52%; COVID-19
original strain ~2–3 / ~50–67%; polio ~3–4 / ~75–80%; measles ~12–18 /
~93–95%) are drawn from published epidemiological reviews and WHO/CDC-cited
figures, used identically across all three instances. Michael's per-dose
costs are explicitly labeled as illustrative simulation units, not claimed
real-world prices — the epidemiological core (R0, threshold, and the
1 − 1/R0 formula) is real.

## Structure

```
index.html          Name-check gate — routes each kid to their own instance
shalom/index.html    Outbreak Response Commander instance
michael/index.html   Vaccine Program Director instance
karis/index.html     Field Triage Medic instance
css/styles.css        Shared styling — one stylesheet, three lens palettes
                       (body.lens-shalom / .lens-michael / .lens-karis)
js/quest.js           Materials-pool → printable-slip wiring, print trigger,
                       random-event helpers (shuffle/pickRandom), the per-kid
                       access gate, the highlighter, and the notes drawer.
```

No build step — plain HTML/CSS/JS. Open `index.html` directly, serve the
folder locally (`python3 -m http.server`), or enable GitHub Pages.
