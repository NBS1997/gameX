# How to Play — *Neap*

You are the moon. The bay is below you. Press and hold the mouse button anywhere on the bay to pull the tide toward where you're hovering. Let go and the water rushes home.

That is the entire control scheme.

## The cursor is the moon

The cursor isn't an OS pointer — it's the moon, drawn by the game. Its shape and size change with each night:

- **Waxing crescent (Night 1).** A small warm-cream disc. Gentle pull, modest reach.
- **Full moon (Night 2).** A larger cool-white disc with a faint halo. The strongest pull, the widest reach.
- **Waning gibbous (Night 3).** A silvered disc with a shadow on the trailing edge. A measured pull, between the other two.

A faint trail follows the cursor at low opacity. That's so it reads cleanly in screen recordings. If you have OS-level reduce-motion enabled, the trail is suppressed.

## What each night is asking of you

There are three nights, played in order on a first run. Each ends with a held-success beat — a chime and a swell — when its goal is met.

- **Night 1 — guide.** A small boat sits in the bay. There's a soft ring on the water; that's the harbour. Guide the boat into the ring and hold it there for about a second and a half. The ring brightens, then goes cream when the boat has settled.
- **Night 2 — gather.** Lanterns are scattered across the bay. Pull them together. The goal is reached when most of them are clustered close to one another.
- **Night 3 — the third night reveals itself.** No spoilers; you'll see what to do.

There is no on-screen text during play other than the three-second card at the start of each night ("Waxing crescent. The harbour is restless tonight." / "Full moon. The bay fills." / "Waning gibbous. The lanterns are lit."). The card fades on its own, or you can press to skip it.

## When things drift wrong

There is no fail screen and no retry button.

If the boat drifts off-screen, or too many lanterns wander out, the game eases back gently — the camera draws back a touch, the moon dims to about sixty per cent, the world keeps moving. The receivers respawn quietly at where they started. Your next press-and-hold re-engages: the moon brightens, the camera comes back, the night continues.

This is "soft drift". It's not a punishment, just a moment to breathe.

## The release is the payoff

Pulling water in is the wind-up. Releasing is where the boat actually moves, where the lanterns drift, where the night-3 verb resolves. Hold for the position you want; release for the consequence. Short pulls feel different from long pulls.

## After the third night

When all three nights are complete, you land on a moon-glyph picker — three lunar phases side by side. From then on you can revisit any night in any order. There is no "done" state, no "complete" badge, no record of how many times you've played. The bay simply waits.

If you completed nights in this session, the bay you re-enter shows faint ghosts of what you did — a boat sits where you guided it, lanterns linger where you gathered them. From the v0.5 closure sprint onward, those ghost positions also persist across sessions in a single `localStorage` key called `neap/save/v2` (the legacy `tide-pull/save/v1` key is read once on first load and migrated forward; nothing is sent anywhere).

## What the slice does not do

- No score, no stars, no medals.
- No streak counter, no consecutive-days tracking, no calendar.
- No notifications. The game does not ask for permission to interrupt you.
- No leaderboards or "your friend just finished faster" comparisons.
- No in-game share, follow, or wishlist surface.
- No real-money anything.
- No third-party analytics or telemetry. The browser network tab is empty after the page loads.
- No real-world date or moon-phase look-up. The lunar cycle is in-game and abstracted.

These are all listed as a hard ban in `docs/specs/conventions.md`.

## Reduce-motion

If you have your OS-level reduce-motion accessibility setting turned on, the soft-drift camera ease is skipped (the moon still dims), and the cursor-trail is suppressed. The title-card fade is preserved — its alpha curve is below the WCAG flash threshold.

To toggle on Windows: Settings → Accessibility → Visual effects → Animation effects.

## Dev-only quick-jump

While the slice is local-only, three URL parameters skip the picker and load a specific night directly:

- `http://localhost:5173/?night=1`
- `http://localhost:5173/?night=2`
- `http://localhost:5173/?night=3`

This bypasses first-playthrough linear ordering and won't show ghosts from earlier nights, so it's a testing tool rather than the real flow. It will be removed before any public deployment.

## Reset

If you want a clean slate, open DevTools (F12) → Application → Local Storage → right-click `localhost:5173` → Clear. Reload the page; the linear-first-playthrough flow starts again.

There is no in-game reset button by design.

## If something feels off

The slice is a vertical proof and not all polish has landed. A handful of items are explicitly deferred and noted in `docs/specs/build-log.md`:

- The 6–10 second moonrise sequence on first launch is not built. The lunar-phase title card carries the identity beat instead.
- Per-phase tinted water palette is not yet differentiated; the moon's pull and the audio filter do the per-phase work.
- The sent-lantern fade on Night 3 is a teleport-stop, not a graceful fade.

If something doesn't behave as described above, that's a regression rather than a deferral, and the build-log will not list it. Worth surfacing.
