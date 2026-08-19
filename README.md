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

| Instance | Path | Lens | Day 2 build | Day 3 output |
|---|---|---|---|---|
| Shalom | `/shalom/` | 🚨 Outbreak Response Commander | Builds a labeled model of ONE real pathogen type (his choice — bacteria/virus/fungus/protoctist), justified by the outbreak he's commanding | Containment Briefing |
| Michael | `/michael/` | 💰 Vaccine Program Director | Builds a labeled antibody-antigen "lock and key" model, proving specificity with a second, non-matching antigen | Funding Pitch |
| Karis | `/karis/` | 🩺 Field Triage Medic | Builds a labeled phagocyte model caught mid-engulfment (detect/engulf/digest), not before or after | Shift Handover Report |

`index.html` at the repo root is a name-check gate, not a page of links —
see "Individual displays" below.

## The quest spans 3 days, and it shows: a game on Day 1, a progress bar, and nothing resets

**Day 1 ends with a game, not just reading.** After the full briefing (all
5 sections + History + Real-World Application), each kid plays a term-
matching game (`#game-day1`, `QuestUI.initMatchGame`) covering one concept
from every section — pathogen, vector, cilia, phagocytosis, antibody, herd
immunity — so it reinforces the whole Day 1 breadth, not just the last
thing they read. It's framed as play: the "score" is moves taken, a wrong
guess just shakes and resets, and there's no pass/fail. Day 2 stays the
hands-on build (see below).

**A 3-segment progress bar** sits right under the header on every kid page
(`.progress-summary`) — Day 1 (reflections answered, out of 4), Day 2
(build steps checked + the Day 2 debrief, out of 6), and Day 3. It reads
straight from each subsystem's own saved state, so it can't drift out of
sync with what's actually been filled in, and it updates live as you type.

**Nothing resets on reload**, because this is a 3-day quest worked on
across multiple sessions — a kid coming back to Day 2 needs to see Day 1
exactly as they left it, not a blank page:
- Reflection answers (already had this) — text and pass/fail state.
- The Day 1 game — which pairs are matched and the move count.
- The Day 2 material-justification table and Results table — every text
  field, via a generic autosave (`QuestUI.initFieldAutosave`) keyed by DOM
  position, so no table cell needed its own id.
- The Day 2 build-step checklist — checked state, and the checkbox now
  actually turns the row green/struck-through when checked (this was
  previously just CSS with nothing wiring it up).
- The materials pool picks — so Day 2 shows the same kit chosen on Day 1,
  not the HTML defaults again.

## Open-ended questions: keyword check + a pointer back to the reading after 3 tries

The 5 open-ended callout questions per kid page (the 4 rotating-mechanism
prompts in Day 1, plus the Day 2 self-check debrief) now have a "Check my
thinking" button. It isn't real grading — it's a plain keyword search:
each question has 2–3 required *concept groups* (e.g. for Shalom's "the
outbreak is a virus, so we ordered antibiotics" error, one group is
`virus`/`viral`, another is a phrase like `won't work`/`doesn't work`), and
the answer needs at least one match from **every** group to count as
having the key idea.

- **Hit the key idea:** soft, non-numeric confirmation ("✅ Nice — you've
  got the key idea.") — no score, no "correct," nothing that reads as a
  grade.
- **Miss it (tries 1–2):** a gentle nudge to revise and check again — no
  hint yet.
- **Still missing it on try 3:** a link appears below the box pointing
  back to the exact section of the Day 1 reading (or, for the Day 2
  debrief, back to their own plan table / decision log) that has the
  answer — e.g. "📖 Take another look: **5. Vaccines, immunity & the
  numbers behind command decisions →**" — not the answer itself, and not a
  leading question. Clicking it scrolls straight to that heading. It stays
  visible on every later try until the key idea is found.

State (attempts, whether it's been hit, and the typed text) persists per
kid/page (`localStorage`, key `imm-l3-reflect::<kid>::<question-id>`), so a
reload never resets progress or re-hides an already-earned pointer. Engine:
`QuestUI.initReflectionChecks(pageKey, configs)` in `js/quest.js`; each
kid page passes its own 5 `{id, groups, reread: {anchor, label}}` entries,
where `anchor` is an `id` added to the relevant `<h3>` in that page.

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
  `<main>`, including diagram captions and animation labels) and a small
  "🖍 Highlight" button appears next to the selection; clicking it wraps the
  exact selected text in a `<mark>`, even across nested `<strong>`/`<em>`
  tags **and across paragraph/heading/caption boundaries** — dragging a
  selection from the end of one paragraph into the start of the next works
  correctly, not just single-block selections. Click an existing highlight
  to remove it (a multi-block highlight is removed as one unit). Under the
  hood this uses `Range.intersectsNode()` to find every tagged block the
  selection touches and records plain-text offsets per block, so a single
  highlight can carry several spans under one id and all of them reapply
  correctly on reload regardless of how the selection crossed formatting or
  block boundaries.
- **Side notes** — a "📝 My Notes" button in the header opens a slide-in
  drawer with two parts: a running list of every highlighted snippet (with
  its own remove button, synced with the on-page highlight), and a free
  textarea for typed notes, auto-saved on every keystroke.

Implementation: `QuestUI.initHighlighter(pageKey)` and
`QuestUI.initNotesDrawer(pageKey)` in `js/quest.js`, called once per kid
page with that page's own key (`'shalom'` / `'michael'` / `'karis'`).

## Day 2 is a build day (not a simulation)

Each kid builds a real, physical, labeled 3D model of a different immune-system
structure — see the table above. This replaced an earlier draft where Day 2
was a token/dice/card decision-simulation; that version worked but didn't
give the "pictorial, hands-on biology" the topic calls for. The build still
satisfies the framework's Day 2 requirements and the Level 3 skill
(Decision-Making Under Constraints) — the decision now lives in the
**material-justification table** (`table.justify-table`): before touching
any material, each kid records, per labeled part, *what it represents*,
*which material they're using*, and *why that material fits* — a real
constrained choice with reasoning attached, not a craft project with no
stakes. Structure per kid, all under `#day2`:

1. A rotating labeled 3D CSS preview of their specific build target
   (`.model3d` cube, six faces, auto-rotating, pausable) — see below.
2. "What your model has to prove" — the one non-negotiable detail (e.g.
   Karis's phagocyte must show *mid*-engulfment, not before/after).
3. "Plan before you build" — the material-justification table.
4. "Build it" — a numbered, checkable build-step list (`.build-checklist`).
5. "Results" — a short structured write-up of the finished model.
6. The Day 2 self-check reflection (keyword-checked, see below).

Materials are a **suggestive pool**, not a fixed kit — every kid's "Choose
What You're Bringing" section lists household/craft items (a ball or
balloon, pipe cleaners, clay, beads, cardboard) with common fallbacks noted
inline, and nothing is pre-selected as mandatory beyond what's checked by
default. They decide their own combination based on their own plan, exactly
per the framework's "materials as a pool, never a checklist" rule.

## Pictorial biology: diagrams and animations, not a wall of text

Every kid's Day 1 reading now includes, at the point in the text where the
concept is introduced:

- **Labeled SVG diagrams** (`.diagram-card`) — numbered circles baked
  directly into the SVG, with a legend below matching each number to a
  real part: virus anatomy (capsid / genetic material / spike proteins),
  a phagocyte mid-engulfment (membrane / engulfed pathogen / enzymes), and
  an antibody-antigen pair (binding site / antibody / antigen).
- **Looping CSS/SVG process animations** (`.process-scene`) that show a
  *mechanism*, not just a part: cilia sweeping a trapped pathogen out,
  a phagocyte pulsing as it engulfs a target, an antibody snapping onto
  its matching antigen. All respect `prefers-reduced-motion`.
- **Numbered section badges** (`.sec-num`) on each of the five core-content
  headings, and a large faint **cover watermark** icon per lens, so the
  page reads as a structured field manual rather than a plain blog post.

These three diagrams/animations are the same underlying biology across all
three kids (same process, per Approach A) — only the surrounding prose and
which one gets extra emphasis differs, matching whichever structure that
kid is building in Day 2.

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
- **Day 2** — a real, physical, non-symbolic build (see "Day 2 is a build
  day" above): a material-justification table filled in *before* building,
  a numbered build-step checklist, a results write-up, and a self-check
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
                       the per-kid access gate, the highlighter, the notes
                       drawer, the keyword-checked reflection engine, the
                       Day 1 matching game, the Day 2 build checklist and
                       field autosave, and the cross-day progress bar.
```

`js/quest.js` functions (all exposed on `window.QuestUI`):

- `initKidGate(expectedName, hubPath)` — per-kid name-check access gate.
- `initHighlighter(pageKey)` — the text highlighter (see above).
- `initNotesDrawer(pageKey)` — the side notes drawer.
- `initReflectionChecks(pageKey, configs)` — keyword-checked open-ended
  reflections with the "reread this section" fallback after 3 attempts.
- `initMaterialsPool(pageKey)` — the materials-pool checkboxes and their
  live printable slip, now saved per kid so picks survive a reload.
- `initBuildChecklist(pageKey)` — the Day 2 numbered build-step checklist;
  saves checked state per kid and toggles the visual "done" styling.
- `initFieldAutosave(pageKey)` — autosaves every plain text/textarea field
  outside the reflection boxes (mainly the Day 2 justification and results
  tables) so typed answers survive a reload.
- `initProgressBar(pageKey)` — fills the 3-segment header progress bar by
  reading straight from the other subsystems' own saved state (reflections,
  build checklist, game), so it can never drift out of sync with them.
- `initMatchGame(containerId, pairs, opts)` — the Day 1 term-matching game
  engine; saves matched pairs and move count per kid.
- `initPrintSlip()` — wires up the "Print materials slip" button.

No build step — plain HTML/CSS/JS. Open `index.html` directly, serve the
folder locally (`python3 -m http.server`), or enable GitHub Pages.
