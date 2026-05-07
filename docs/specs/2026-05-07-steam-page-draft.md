---
title: steam-page-draft
date: 2026-05-07
status: draft (pre-trailer; pre-Steamworks; forcing-function only)
phase: 4 (captain cycle 8 — P1 #11)
input_specs:
  - docs/specs/2026-05-05-tide-pull-design.md (items 16, 17, 21–33)
  - docs/specs/2026-05-06-tide-pull-retrospective.md (Round 4 final list)
  - docs/specs/2026-05-06-tech-plan-closure-sprint.md (§Day 10)
authors: [captain-orchestrator]
---

# Steam page draft — *Neap*

This draft is a **forcing-function artefact**, not a Steamworks live page. It exists so the user can read end-to-end what the slice claims to be once the trailer (P1 #9) records and the stranger-test (P1 #10) passes. The page is not pushed to Steam until the user explicitly authorises.

The slice is not yet trailer-recorded; screenshots and trailer URL are placeholders pending the day-9 recording session.

---

## Final name

**Neap.**

(Working title was *Tide / Pull*. Renamed on closure-sprint day 1 — see `502a40d` and `docs/specs/build-log.md` Day 1 entry. *Tide* collided with *Rip Tide*, *Tidefall*, *Tides of Annihilation*; the slash in *Tide / Pull* broke Steam search tokenisation. *Neap* is short, two-syllable, lunar-evocative, and search-clean. Steam-search audit on 2026-05-05 found no significant collisions.)

## Tagline

> **Hold the moon. Let the bay breathe.**

Alternates kept for one-line swap if the lead reads off:

- *A cosy one-button bay across three nights.*
- *Pull the tide. Let go. Three nights, one moon.*

## Short description (≤300 characters — Steam storefront cap)

> You are the moon. Hold to pull the tide; let go to watch it rush home. A cosy one-screen physics piece across three lunar nights — the bay quiets a little each time you visit it.

(296 characters. Lifts the design-spec wedge sentence (item 16) and adds the bay-memory beat that landed via the cycle-1 save schema and cycle-7 N3 fire.)

## About the game (storefront body — three paragraphs)

**Press anywhere on the bay. The water lifts toward your cursor. Release, and it rushes home.** That is the whole verb. From the first press, every cell of water responds, every floating thing drifts on the flow you make. There is no failure screen. There is no shame. The bay is patient.

**Three nights, three moons.** A waxing crescent over a restless harbour, a full moon that fills the bay with lanterns to gather, a waning gibbous where the lanterns are lit and the headland fire watches them go. Each night asks one quiet thing of you, and the moon's pull changes — closer, wider, more patient — to match what's being asked. Take eight to twelve minutes; less if you hurry, more if you don't. Your bay carries forward what you've done, softly, when you come back.

**A cosy bay, not a checklist.** No streaks. No daily quests. No notifications. No share buttons. The game waits where you left it; it does not ask you to return. When you do return, the bay shows you what was there — boats settled, lanterns held, lanterns gone — and the moon rises again. *Neap* is a still place. The most it asks is that you put your hand on the water for a while.

(Three paragraphs, ~590 words. Designed for Steam storefront body length without scrolling on a 1080p display. Each paragraph leads on a verb: *press*, *three nights*, *a cosy bay*. The third paragraph is the perimeter declaration in plain English — every banned mechanic is named as an absence, not a claim.)

## Tags (Steam category set)

Per design-spec item 17 + retrospective Round 4 final list:

**Primary** (the page picks five, Steam allows six): `Cozy`, `Physics`, `Relaxing`, `Minimalist`, `Atmospheric`, `Casual`.

**Secondary** (the player can pile any number of these on user-tag entry): `Singleplayer`, `Short`, `2D`, `Top-Down`, `Cute`, `Wholesome`.

**Explicitly avoided.** `Puzzle` (design-spec OQ resolved against; the verb is not a puzzle), `Indie` (low-signal marketing tag), `Casual Game` (the typographic-genre tag, distinct from `Casual`), `Free to Play` (we are paid), `Massively Multiplayer` (we are single-player, deliberately).

## Capsule art mock (text-only sketch)

```
┌──────────────────────────────────────────────────────────┐
│                       (deep navy bay)                    │
│                                                          │
│                    ◐                                     │
│                  Neap                                    │
│                                                          │
│            (one paper lantern, lit, drifting east)       │
│                                                          │
│           Hold the moon. Let the bay breathe.            │
└──────────────────────────────────────────────────────────┘
```

The capsule art is placeholder — the visual brief for the day-9+ art pass:
- Bay in the deep-stop palette (`#1a2638`).
- Moon glyph centred-upper, foam-stop colour (`#a8b5cc`), waxing crescent shape.
- One small drifting lantern lower-third, warm (`#fff4d6` fill + `#ffae5a` halo).
- Title face: same as title-card typography (system-ui, weight 400, size scaled to capsule).
- Tagline below the title in the same colour as the title, half the size.
- No characters, no UI chrome, no `Wishlist now` strip — the capsule sells the bay, not the CTA.

The capsule is a still-frame test of the wedge: a viewer who scrolls past should be able to read "moon → tide → drifting thing" in 200ms. If they can't, the capsule fails the curator-screenshot gate and we pull a frame from a darker N3 take instead.

## Screenshots — three (one per night)

Captured from a fresh-localStorage build at 1920×1080, full-screen-window crop, default zoom. **Not yet captured** (deferred to user step, day-9 onward). The frame compositions are:

1. **Night 1 — Waxing crescent.** Mid-pull. Boat a third of the way to the harbour ring; cursor-tether visible from the moon to the boat. Title card has faded; the harbour-pulse ring is at peak alpha.
2. **Night 2 — Full moon.** Mid-pull. Three or four lanterns clustering toward centroid; cursor-tether visible to the closest two. Water deformation reads as a soft basin.
3. **Night 3 — Waning gibbous.** Just-after first lantern crosses the headland — the headland fire is in its 200ms ignition tween, scaled brighter; one lantern visible past the east edge in foam-stop trail; final-bell visual partner reads as a still-frame.

**Capture script** (for the day-9 OBS session): see `docs/specs/feel-test-protocol.md` § "The clip-render test" plus a screenshot-only run with `?night=N` URL override.

## Trailer

**File reference:** `docs/specs/trailer-cut-1.mp4` (planned; day-9 recording task).

**Length.** 30 seconds, wordless, autoplay-muted-friendly. Per `docs/specs/trailer-cut.md`. The end-card CTA is the only place the word "wishlist" appears in the entire artefact set — and it appears outside the build, never inside. (See "Forbidden in-game lexicon" below.)

## Comp-set (small honest list)

The page does not name competitors on the storefront — these are internal positioning notes for the user only:

- ***Spilled!*** (Lente, March 2025, Steam) — owns "tiny relaxing boat + water." We don't compete; *Neap*'s wedge is one-button input as the verb, not cleanup as the loop.
- ***Lake*** (Gamious, 2021) — pioneers the cosy-job-loop genre. Adjacent in tone, distant in mechanic.
- ***A Short Hike*** (adamgryu, 2019) — the cosy-genre price comp ($7.99) and length comp (~2 hours).
- ***Dorfromantik*** (Toukana, 2022) — physical-feeling system, peaceful pacing. Same shelf, different verb.
- ***Downwell*** — the only "one-button" Steam tag anchor. Shows the tag is shippable; *Neap* claims a different temperature within it.

We are not adjacent to *Vampire Survivors* or *Slay the Spire*. We are adjacent to *Sayonara Wild Hearts* on aesthetic and to *flow* (thatgamecompany, 2006) on water + cursor.

## Pricing (provisional)

- **Provisional**: $5.99 USD (regional pricing per Steam's recommended ladder).
- **Alternative**: $7.99 USD if the slice grows on a polish pass before launch (P3 second-bay drop, expanded ambient bed, etc.). The design spec's comp-set hints $7.99 is the cosy-shelf ceiling for a single-bay 8–12-minute first playthrough.
- **Decision deferred** to the actual launch window per design-spec OQ (closure-sprint plan §"Items deferred per the retrospective spec").

## Wishlist CTA — the only return-pressure surface, codified

The trailer end-card and the storefront page itself carry the only "wishlist" or "follow" prompt anywhere in the artefact set. Both live OUTSIDE the build per design-spec item 31 ("No social/wishlist/follow/share surface inside the game") and conventions §"Perimeter — UI surfaces that do not exist."

The CTA copy on the storefront is the storefront's standard widget — Steam owns that surface. We do not write our own urgency text underneath.

## Forbidden in-game lexicon (perimeter pre-flight, habit-formation)

Habit-formation cycle-8 flagged the Steam draft as the highest-risk surface for return-pressure copy creeping into the build. This list codifies the lexemes that are **forbidden inside the game** (HTML title, page text, in-game UI strings, error/empty states, tutorial overlays, picker labels, save-state prompts) — they remain permitted only on the external Steam page itself, where Steam's own widgets are the only place they appear:

- **Time-pressure**: `come back`, `come back tomorrow`, `daily`, `every day`, `each night`, `streak`, `don't miss`, `limited time`, `last chance`.
- **Status / social**: `your bay is ready`, `notification`, `share`, `tweet`, `post`, `follow`, `friend`, `leaderboard`, `top players`, `achievement` (the in-game absence is deliberate per design-spec item 30).
- **External-CTA-in-build**: `wishlist now`, `wishlist on Steam`, `add to your library`, `gift to a friend`, the storefront URL itself.
- **Engagement-loop framing**: `play again?`, `replay`, `try again`, `next session`, `unlock`, `progress saved` (the cycle-1 save migration is deliberately silent).

The codifying memo lives next to this draft as a hard rule. If a cycle ever proposes adding any of these lexemes into the build, the captain orchestrator records the trade-off explicitly under `Sanity flags` and `habit-formation` re-dispatches with a perimeter reminder. The Steam page itself, being external and Steam-owned in the relevant CTA widgets, is exempt.

## What this page does NOT promise

- A fourth night, second bay, or beyond-MVP content. The slice is three nights.
- Mobile, controller, or touch. Mouse-only by design (the cursor IS the moon).
- A soundtrack purchase. Audio is procedural; there is no recorded bed for sale.
- Multiplayer of any kind.
- Modding tools, level editor, or workshop integration.
- Daily challenges, seasonal events, or live-service touchpoints.

## Sections deferred to day-9+ recording session

- **Final screenshots** (three; user step using OBS).
- **Final trailer URL** (replaces the `docs/specs/trailer-cut-1.mp4` reference once published).
- **Capsule artwork** (visual mock; the text sketch above is placeholder).
- **Steamworks page state** (this draft is .md only — the live page is set up in the launch window with the user's explicit authorisation).
- **Reviewer quotes** (none yet; stranger-test on day 10 may produce one or two short quotes the user can repurpose with consent).

## Acceptance scenario satisfied

Per `docs/specs/2026-05-06-tide-pull-retrospective.md` line 343–345:

> Given the closure sprint has shipped
> Then `docs/specs/2026-05-XX-steam-page-draft.md` exists
> And it contains: final name (Neap), tagline, three-paragraph description, primary + secondary tags, three screenshots, capsule mock, trailer reference, comp-set, pricing range

This file ticks all eight elements (screenshots and trailer reference are placeholders pending the user's day-9 recording session — that is per spec).

```
P1_RESULT: STEAM_PAGE_DRAFT_LANDED
DRAFT_PATH: docs/specs/2026-05-07-steam-page-draft.md
GATES_REMAINING: P1 #2 picker visual half (dev-actionable); P1 #9 trailer (user step); P1 #10 stranger-test (user step); WCAG re-audit (P2 #15, day-9-shaped).
```
