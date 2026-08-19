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

`index.html` at the repo root is the hub page linking all three.

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
index.html          Hub page linking all three instances
shalom/index.html    Outbreak Response Commander instance
michael/index.html   Vaccine Program Director instance
karis/index.html     Field Triage Medic instance
css/styles.css        Shared styling — one stylesheet, three lens palettes
                       (body.lens-shalom / .lens-michael / .lens-karis)
js/quest.js           Materials-pool → printable-slip wiring + print trigger
                       + small random-event helpers (shuffle/pickRandom).
                       No progress-locking, no scoring, no localStorage state.
```

No build step — plain HTML/CSS/JS. Open `index.html` directly, serve the
folder locally (`python3 -m http.server`), or enable GitHub Pages.
