# LifeHub Risers — Immune System Defenders

A self-paced, pictorial, interactive digital quest built for LifeHub Risers,
covering the immune system at IGCSE (Cambridge Biology 0610, "Diseases and
Immunity") depth, adapted for a Grade 7 reader:

**Part 1 — Missions 1–3**
1. 🦠 Meet the Enemy (pathogens: bacteria, viruses, fungi, protoctists, and
   how they're transmitted)
2. 🛡️ The Body's Walls (physical and chemical barriers: skin, mucus, cilia,
   stomach acid, lysozyme, blood clotting)
3. 🧫 Search and Destroy (phagocytes and phagocytosis — the non-specific
   defense)

**Part 2 — Missions 4–5 & the Final Boss**
4. 🎯 The Antibody Squad (antigens, lymphocytes, antibodies, memory cells —
   the specific defense)
5. 💉 Vaccines & Immunity (active/passive immunity, how vaccines work, herd
   immunity, antibiotics vs. antibiotic resistance)
6. 🏆 The Final Boss Challenge — a rigorous 20-question assessment, written
   fresh (not copies of the mission checkpoint questions), spanning both
   parts
7. 🎓 Claim Your Reward — a printable certificate, unlocked by beating the
   Final Boss

**Plus, not locked to any mission:**
- 🧪 **Build a 3D Model** (`build.html`) — choose a virus, a phagocyte mid-
  engulfment, or an antibody/antigen "lock and key" pair. Spin an on-screen,
  auto-rotating CSS 3D preview labeling every part, then build the real
  thing with ordinary craft materials, with step-by-step instructions and a
  self-check rubric.

It's deliberately not chaptered by calendar day — "Part 1" and "Part 2" are
just two pages for load-time reasons, not a schedule. There's no time-boxed
"today you must finish X" framing anywhere; progress saves itself, so it's
fine to stop mid-mission and resume days later.

Each of the first 5 missions opens with a short interactive story starring
two recurring characters, **Mac** (a macrophage — a phagocyte) and **Ana**
(a lymphocyte), drawn as cartoon cell mascots (see `js/characters.js`), has
either a real embedded video or a looping CSS/SVG animated mini-scene, a
glossary of new words, one or two "Think about it" scenarios, and ends with
a mixed practice quiz. A bonus game card appears at the end of each part,
linking to **Conflict: Immunity**, a free HTML5 browser game from BiomanBio
where you command an army of white blood cells against real pathogens.

## Video resources

Three missions embed a real YouTube video from The Amoeba Sisters, a
well-known biology education channel, via privacy-enhanced
`youtube-nocookie.com` embeds:
- Mission 1 (pathogens): "Viruses (Updated)"
- Mission 3 (phagocytes): "Immune System"
- Mission 5 (vaccines): "Antibiotics, Antivirals, and Vaccines"

To swap in a different video, replace the `src` on the relevant
`.video-card .video-embed iframe` with `https://www.youtube-nocookie.com/embed/VIDEO_ID`.

## How the practice quizzes work (Missions 1–5)

Every question must be finished before the next mission unlocks:

- Answer correctly on the first try → done immediately.
- Answer wrong → pick again if you like, then explain your thinking in a
  short open-text box. That box isn't graded right or wrong — it just needs
  to have something written in it. Once it's filled in, the question is
  marked done.

A mission stays visibly locked (blurred, non-interactive, with a padlock
message) until every question in the previous one is finished, and unlocks
automatically the moment the last one is done. Progress is saved in the
browser (`localStorage`), so it survives closing the tab and coming back
later — see "Continuing across devices" below for the one case that doesn't
cover.

## How the Final Boss Challenge works

This one is graded for real, no reflection shortcut, and its 20 questions
are written from scratch — not reused from the mission checkpoints —
leaning on scenarios and application rather than recall. All 20 are
answered, then submitted together with one "Submit Final Assessment"
button. The pass bar is 80% (16 out of 20). Passing unlocks the certificate
section immediately below; falling short shows the score and a "Try Again"
button that resets the whole assessment for another attempt. See
`js/assessment.js`.

## The certificate

Locked until the Final Boss Challenge is passed. Type a name and it fills
into a styled certificate live, saved in `localStorage` so it's remembered
on refresh, with today's date filled in automatically. The "Print / Save as
PDF" button calls `window.print()`.

## Build a 3D Model (`build.html`)

Not gated by the mission-locking system — it's meant to be usable any time,
though the page nudges readers toward the mission that gives each project
context. Three tabs (Virus / Phagocyte in Action / Antibody & Antigen) each
switch:
- the shared auto-rotating CSS 3D cube preview (`.model3d`), whose six
  faces label the real parts of that structure (pure CSS 3D transforms —
  no JS libraries, no external assets)
- a materials list and five numbered build steps for a physical model made
  from ordinary craft supplies
- its own progress checklist, persisted per player via `Player.pSet` —
  informational only, nothing else on the site is gated by it

A shared self-check rubric below the three projects applies to whichever
one was built.

## Sharing one computer between kids (no login)

The very first thing anyone sees on any page is a "👋 Who's on this quest?"
name prompt (see `js/player.js` and `buildPlayerGate` in `js/app.js`).
Typing a name namespaces every progress key under it, so a second kid can
type their own name and get a completely clean slate on the same computer.
The "👤 Name ▾" badge in the header lets anyone switch out.

This is deliberately not a real login: there's no password and nothing
stops someone from typing any name, including someone else's.

## Continuing across devices (no login)

Progress lives in `localStorage`, tied to one browser on one device. The
"🔄 Restore Session" button in the header packs the current player's name
and progress into a short code you can copy on one device and paste into
the same panel on another to restore both instantly.

## Running the quest

No build step is required — it's plain HTML/CSS/JS.

- Open `index.html` directly in a browser, or
- Serve the folder locally, e.g. `python3 -m http.server`, then visit
  `http://localhost:8000`, or
- Enable GitHub Pages on this repository (Settings → Pages → deploy from
  the default branch) to host it online.

## Structure

```
index.html          Course home page
part1.html           Part 1 content + stories + quizzes (missions 1–3)
part2.html           Part 2 content + stories + quizzes + Final Boss + certificate (missions 4–5, 6, 7)
build.html           Build-a-3D-model project page (not mission-locked)
css/styles.css        Shared styling
js/quiz.js            Practice quiz engine (mcq / true-false / fill-in / match + reflection)
js/assessment.js      Final Boss engine (graded, pass/fail, retry)
js/characters.js      Mac & Ana cartoon cell mascot art
js/story.js           Interactive story/comic-strip component
js/player.js          Per-name progress namespacing (shared-computer support)
js/app.js             Mission locking, progress tracking, and the cross-device sync widget
```
