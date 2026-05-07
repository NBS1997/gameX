# Neap N4 — Sub-cycle B Implementation Plan

> **For agentic workers:** This plan is executed by `dev-agent` per the captain protocol's NEW_FEATURE stack. Steps use checkbox (`- [ ]`) syntax for tracking. Per the substitution chain established in cycles 5–9 (and resumed in cycle 11), `superpowers:writing-plans` is substituted by the design memo at `docs/specs/forward-feature-1.md` (committed in cycle 10, refined in cycle 11) plus this implementation contract. `superpowers:brainstorming` and the slim council are similarly substituted by the upstream design memo.

**Goal:** Land the verb (`verbs/withhold.ts`) + heron render module (`render/heron.ts`) + audio cue (`audio.heronSettleChime`) + cursor-tether suppression on N4 + pull-radius `dwellT` brightness modulation. After this cycle, N4 plays end-to-end: the player can reach N4 from the picker, hold-still near the heron at the eastern foam line, watch `dwellT` accumulate, see the pull-radius brighten, see the heron pre-lift then lift on a single wingbeat, hear the 587 Hz settle chime + final bell, see the moon dip below the horizon as the existing closure callback (cycle 5 fade-to-silence + master-restore) fires.

**Architecture:** New verb file follows the existing `verbs/{guide,gather,settle}.ts` pattern (early-return guard + per-frame state mutation on `state.goalProgress` + optional callback hook). New render module follows the cycle-3/6/7 pattern (`Container` + `Graphics` + state machine + per-frame `update(dt)` + `reset()` + `setPosition()` + reduce-motion guard). Audio method mirrors cycle-7's `lanternIgnitesFire()` shape. **No save schema changes** — `SaveDataV3` shape is byte-identical to sub-cycle A's shape. **No new runtime deps.**

**Tech Stack:** TypeScript 6 (strict), Pixi.js 8.18.1, Web Audio (existing `AudioContext`), no new packages.

**Spec:** `docs/specs/forward-feature-1.md` — sections "The verb — withhold (mechanic spec)", "The receiver — heron render module", "Visual identity", "Cycle 11 retro refinements (sub-cycle B implementation clarifications)".

---

## File Structure (sub-cycle B)

**Create:**
- `game/src/verbs/withhold.ts` — `updateWithhold(state, dt, hooks)` per-frame verb logic (~80 LoC).
- `game/src/render/heron.ts` — heron render module with `idle | approaching | recoiling | preLift | lifting | gone` state machine + reduce-motion swap (~140 LoC).

**Modify:**
- `game/src/audio/manager.ts` — add `heronSettleChime()` method (587 Hz sine, mirrors `lanternIgnitesFire` shape; ~12 LoC).
- `game/src/main.ts` — wire `withhold.ts` into the verb-switch (replace cycle-10 no-op `case 'still':`); mount heron render module on `worldLayer` between `intentBeat.container` and `ambientLife.container` (consistent with cycle-3/7 z-order); add `withholdArg` construction; call `audio.heronSettleChime()` on the goal-met rising edge (combined with existing `finalBell` + `fadeToSilence` chain); call `cursorTether.setEnabled(false)` in `enterNight` for night 4 with 250 ms ease-out fade per cycle-11 UX refinement #1; add pull-radius brightness modulation by `dwellT` (read from `state.goalProgress.dwellT` when `kind === 'still'`; apply `smoothstep(dwellT) * 0.15` to the cursor's pull-radius alpha per cycle-11 UX refinement #4).
- `game/src/config.ts` — add `WITHHOLD_*` named constants per cycle-11 feel-tuning principle #11 (DWELL_RISE, DWELL_FALL, STILL_V, SHY_V, RING_R, HARD_R, SHY_BLEED, TOUCH_DWELL, PRE_LIFT_DWELL); change `WATER_PALETTES` typing to `Record<LunarPhase, readonly RGB[]>` per cycle-10 reviewer carry-over #12.
- `game/src/scenes/nightPicker.ts` — add explicit `if (night === 4) return meta.completedNights.has(3); return false;` clause to `isNightSelectable` per cycle-10 reviewer carry-over #13.
- `docs/specs/feel-test-protocol.md` — append "## The N4 withhold-verb test" section (TDD-shape: written BEFORE the dev-agent ships, RED before, GREEN after — manual feel-test steps + automatable static checks).
- `docs/specs/build-log.md` — append cycle-11 entry per the loop's pattern.

**Out of scope (sub-cycle B — explicitly NOT touched):**
- `game/src/render/intentBeat.ts` (sub-cycle C adds the N4 path).
- `motion-and-colour-bible.md` (sub-cycle C swap-table additions).
- `2026-05-07-steam-page-draft.md` (sub-cycle C per strategist cycle-11 retro).

---

## Tasks

### Task 1: Add WITHHOLD feel-tuning constants to `config.ts`

**Files:**
- Modify: `game/src/config.ts`

- [ ] **Step 1: Add the constants block**

Append after the existing N3 closure-beat constants (after the `MASTER_RESTORE_RAMP_S` line area):

```ts
// N4 withhold feel-tuning (cycle 11 sub-cycle B; tuned in sub-cycle C feel-test).
export const WITHHOLD_RING_R = 220;
export const WITHHOLD_HARD_R = 90;
export const WITHHOLD_STILL_V = 25;
export const WITHHOLD_SHY_V = 220;
export const WITHHOLD_DWELL_RISE = 0.45;
export const WITHHOLD_DWELL_FALL = 0.35;
export const WITHHOLD_SHY_BLEED = 0.6;
export const WITHHOLD_TOUCH_DWELL = 1.0;
export const WITHHOLD_PRE_LIFT_DWELL = 0.85;
export const WITHHOLD_RECOIL_COOLDOWN_MS = 2000;
```

(Single-line comment per conventions §131.)

- [ ] **Step 2: Update `WATER_PALETTES` typing per cycle-10 reviewer carry-over**

If `WATER_PALETTES` currently uses an inline union or untyped Record, change the declaration to:

```ts
import type { LunarPhase } from './level/types.ts';

// (existing constant retains its values; only the type annotation changes.)
export const WATER_PALETTES: Record<LunarPhase, readonly RGB[]> = { /* ... */ };
```

(If `LunarPhase` is already imported, skip the import line. If `RGB` is not the existing type name, use whatever the existing palette element type is.)

### Task 2: Create `verbs/withhold.ts`

**Files:**
- Create: `game/src/verbs/withhold.ts`

- [ ] **Step 1: Write the verb file**

```ts
import {
  WITHHOLD_DWELL_FALL,
  WITHHOLD_DWELL_RISE,
  WITHHOLD_HARD_R,
  WITHHOLD_RING_R,
  WITHHOLD_SHY_BLEED,
  WITHHOLD_SHY_V,
  WITHHOLD_STILL_V,
  WITHHOLD_TOUCH_DWELL,
} from '../config.ts';
import type { GameState } from '../state/gameState.ts';
import type { Vec2 } from '../level/types.ts';

export interface WithholdHooks {
  heronPosition: Vec2;
  cursorPosition: Vec2;
  cursorVelocity: number;
  isPressed: boolean;
  onShy?: () => void;
  onGoalMet?: () => void;
}

export function updateWithhold(
  state: GameState,
  dt: number,
  hooks: WithholdHooks,
): void {
  if (state.level.night.goal.kind !== 'still') return;
  if (state.goalProgress.kind !== 'still') return;
  if (state.goalProgress.complete) return;

  const dx = hooks.heronPosition.x - hooks.cursorPosition.x;
  const dy = hooks.heronPosition.y - hooks.cursorPosition.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > WITHHOLD_RING_R) {
    state.goalProgress.dwellT = Math.max(
      0,
      state.goalProgress.dwellT - WITHHOLD_DWELL_FALL * dt,
    );
  } else if (d < WITHHOLD_HARD_R && hooks.cursorVelocity > WITHHOLD_SHY_V) {
    state.goalProgress.dwellT = Math.max(
      0,
      state.goalProgress.dwellT - WITHHOLD_SHY_BLEED,
    );
    if (hooks.onShy) hooks.onShy();
  } else if (
    (hooks.isPressed && hooks.cursorVelocity < WITHHOLD_STILL_V) ||
    !hooks.isPressed
  ) {
    state.goalProgress.dwellT = Math.min(
      1.0,
      state.goalProgress.dwellT + WITHHOLD_DWELL_RISE * dt,
    );
  } else {
    state.goalProgress.dwellT = Math.max(
      0,
      state.goalProgress.dwellT - WITHHOLD_DWELL_FALL * dt,
    );
  }

  if (state.goalProgress.dwellT >= WITHHOLD_TOUCH_DWELL) {
    state.goalProgress.complete = true;
    if (hooks.onGoalMet) hooks.onGoalMet();
  }
}
```

Notes:
- Early-return guards mirror `verbs/guide.ts`, `verbs/gather.ts`, `verbs/settle.ts` patterns.
- `dwellT` lives in `state.goalProgress` per cycle-11 architectural clarification #5.
- Recoil event surfaces via `onShy` callback; the heron render module subscribes to it (Task 4 wires this in `main.ts`).
- No banned identifiers (`creatureTrust`, `bond`, `affinity`, `friendship`, `trust` outside the existing `localStorage` quota messaging if present elsewhere) — verified by Task 7 grep.

### Task 3: Create `render/heron.ts`

**Files:**
- Create: `game/src/render/heron.ts`

- [ ] **Step 1: Write the render module**

```ts
import { Container, Graphics } from 'pixi.js';
import { WITHHOLD_RECOIL_COOLDOWN_MS, WITHHOLD_PRE_LIFT_DWELL } from '../config.ts';
import { prefersReducedMotion } from './reduceMotion.ts';
import type { Vec2 } from '../level/types.ts';

const HERON_FILL = 0x9aa6bd;
const HERON_RIM = 0xcdd6e6;
const HERON_BODY_W = 28;
const HERON_BODY_H = 56;
const IDLE_TILT_AMP_DEG = 2;
const IDLE_TILT_PERIOD_MS = 4300;
const APPROACH_MS = 600;
const RECOIL_MS = 350;
const RECOIL_DISTANCE_PX = 18;
const PRE_LIFT_MS = 1500;
const LIFT_MS = 2400;
const LIFT_TRANSLATE_X = 800;
const LIFT_TRANSLATE_Y = -400;
const FOAM_LINE_Y = 1000;

type HeronPhase =
  | 'idle'
  | 'approaching'
  | 'recoiling'
  | 'preLift'
  | 'lifting'
  | 'gone';

export interface Heron {
  container: Container;
  setPosition(pos: Vec2): void;
  reset(): void;
  update(
    dt: number,
    inputs: {
      dwellT: number;
      cursorPos: Vec2;
      goalComplete: boolean;
    },
  ): void;
  triggerRecoil(): void;
  isLifting(): boolean;
}

export function createHeron(): Heron {
  const container = new Container();
  const body = new Graphics();
  body
    .ellipse(0, -HERON_BODY_H / 2, HERON_BODY_W / 2, HERON_BODY_H / 2)
    .fill(HERON_FILL)
    .stroke({ width: 1, color: HERON_RIM, alpha: 0.5 });
  container.addChild(body);

  let phase: HeronPhase = 'idle';
  let phaseElapsedMs = 0;
  let basePosition: Vec2 = { x: 0, y: 0 };
  let recoilStartPos: Vec2 = { x: 0, y: 0 };
  let recoilEndPos: Vec2 = { x: 0, y: 0 };
  let recoilCooldownUntil = 0;
  let elapsedTotalMs = 0;
  let liftStartPos: Vec2 = { x: 0, y: 0 };

  const setPosition = (pos: Vec2): void => {
    basePosition = { x: pos.x, y: pos.y };
    container.position.set(pos.x, pos.y);
  };

  const reset = (): void => {
    phase = 'idle';
    phaseElapsedMs = 0;
    recoilCooldownUntil = 0;
    elapsedTotalMs = 0;
    container.alpha = 1;
    container.rotation = 0;
    container.position.set(basePosition.x, basePosition.y);
  };

  const triggerRecoil = (): void => {
    if (phase !== 'idle' && phase !== 'approaching') return;
    if (elapsedTotalMs < recoilCooldownUntil) return;
    if (prefersReducedMotion()) return;
    const cursorAwayDx = container.position.x - basePosition.x;
    const cursorAwayDy = container.position.y - basePosition.y;
    const len = Math.sqrt(cursorAwayDx * cursorAwayDx + cursorAwayDy * cursorAwayDy) || 1;
    recoilStartPos = { x: container.position.x, y: container.position.y };
    recoilEndPos = {
      x: container.position.x + (cursorAwayDx / len) * RECOIL_DISTANCE_PX,
      y: Math.min(
        FOAM_LINE_Y,
        container.position.y + (cursorAwayDy / len) * RECOIL_DISTANCE_PX,
      ),
    };
    phase = 'recoiling';
    phaseElapsedMs = 0;
    recoilCooldownUntil = elapsedTotalMs + WITHHOLD_RECOIL_COOLDOWN_MS;
  };

  const update = (
    dt: number,
    inputs: { dwellT: number; cursorPos: Vec2; goalComplete: boolean },
  ): void => {
    elapsedTotalMs += dt * 1000;
    phaseElapsedMs += dt * 1000;
    const reduced = prefersReducedMotion();

    if (
      inputs.goalComplete &&
      phase !== 'lifting' &&
      phase !== 'gone'
    ) {
      liftStartPos = { x: container.position.x, y: container.position.y };
      phase = 'lifting';
      phaseElapsedMs = 0;
    } else if (
      !inputs.goalComplete &&
      inputs.dwellT >= WITHHOLD_PRE_LIFT_DWELL &&
      phase !== 'preLift' &&
      phase !== 'lifting' &&
      phase !== 'gone'
    ) {
      phase = 'preLift';
      phaseElapsedMs = 0;
    }

    switch (phase) {
      case 'idle': {
        if (reduced) {
          container.rotation = 0;
        } else {
          const t = (elapsedTotalMs % IDLE_TILT_PERIOD_MS) / IDLE_TILT_PERIOD_MS;
          const eased = -Math.cos(t * Math.PI * 2) * 0.5 + 0.5;
          container.rotation = ((IDLE_TILT_AMP_DEG * Math.PI) / 180) * (eased * 2 - 1);
        }
        break;
      }
      case 'approaching': {
        if (reduced) {
          container.alpha = 0.85 + 0.15 * Math.sin(phaseElapsedMs / 100);
          if (phaseElapsedMs > 100) {
            container.alpha = 1;
            phase = 'idle';
          }
        } else {
          const t = Math.min(1, phaseElapsedMs / APPROACH_MS);
          container.rotation = ((IDLE_TILT_AMP_DEG * Math.PI) / 180) * (1 - 2 * (1 - Math.pow(1 - t, 3)));
          if (t >= 1) phase = 'idle';
        }
        break;
      }
      case 'recoiling': {
        const t = Math.min(1, phaseElapsedMs / RECOIL_MS);
        const eased = 1 - Math.pow(1 - t, 3);
        container.position.set(
          recoilStartPos.x + (recoilEndPos.x - recoilStartPos.x) * eased,
          recoilStartPos.y + (recoilEndPos.y - recoilStartPos.y) * eased,
        );
        if (t >= 1) {
          phase = 'idle';
          phaseElapsedMs = 0;
        }
        break;
      }
      case 'preLift': {
        if (reduced) {
          container.scale.set(1, 1.05);
        } else {
          const t = Math.min(1, phaseElapsedMs / PRE_LIFT_MS);
          const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
          container.scale.set(1, 1 + 0.05 * eased);
        }
        break;
      }
      case 'lifting': {
        if (reduced) {
          const t = Math.min(1, phaseElapsedMs / 600);
          container.alpha = 1 - t;
          if (t >= 1) phase = 'gone';
        } else {
          const t = Math.min(1, phaseElapsedMs / LIFT_MS);
          const eased = 1 - Math.pow(1 - t, 3);
          container.position.set(
            liftStartPos.x + LIFT_TRANSLATE_X * eased,
            liftStartPos.y + LIFT_TRANSLATE_Y * eased,
          );
          container.alpha = 1 - eased * 0.4;
          container.scale.set(1 + eased * 0.1, 1 + eased * 0.1);
          if (t >= 1) {
            phase = 'gone';
            container.alpha = 0;
          }
        }
        break;
      }
      case 'gone':
        container.alpha = 0;
        break;
    }
  };

  const isLifting = (): boolean => phase === 'lifting' || phase === 'preLift';

  return { container, setPosition, reset, update, triggerRecoil, isLifting };
}
```

Notes:
- State machine matches the design memo §"The receiver — heron render module".
- `gone` is a single post-lift terminal per cycle-11 architectural clarification #6. `reset()` returns to `idle` on every `enterNight(4)` per perimeter enforcement #9.
- Recoil clamps to `FOAM_LINE_Y` per cycle-11 UX refinement #2.
- Pre-lift wing-stretch (1500 ms) runs its own clock per cycle-11 UX refinement #3.
- Reduce-motion swaps per the design memo §"Reduce-motion swap (mandatory)".
- No banned identifiers; the only state-name approaching relationship-shape is `recoilCooldownUntil` which is mechanical.

### Task 4: Add `heronSettleChime()` to `audio/manager.ts`

**Files:**
- Modify: `game/src/audio/manager.ts`

- [ ] **Step 1: Add the method**

Following the cycle-7 `lanternIgnitesFire()` shape, add to the audio manager's surface:

```ts
heronSettleChime: () => {
  if (!ctx || !masterGain) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = 587;  // 880 * 2^(-7/12), perfect-fifth below N1's bell
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.18, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(now);
  osc.stop(now + 1.3);
},
```

(Add to the returned manager object alongside `lanternIgnitesFire`. The frequency 587 Hz is `880 * 2^(-7/12) ≈ 587.33` — a perfect fifth below the N1/N3 bell, matching the design memo's spec. Envelope: 0.05s attack (matching `goalMet`), 1.2s decay (slightly shorter than `goalMet`'s 1.4s for a softer tail), peak 0.18 between `lanternIgnitesFire`'s 0.14 and `goalMet`'s 0.22.)

- [ ] **Step 2: Add the method to the `AudioManager` interface**

If `AudioManager` interface lists the method names, append `heronSettleChime: () => void;` to it.

### Task 5: Wire withhold + heron + audio + cursor-tether + brightness in `main.ts`

**Files:**
- Modify: `game/src/main.ts`

- [ ] **Step 1: Add the imports**

```ts
import { createHeron, type Heron } from './render/heron.ts';
import { updateWithhold } from './verbs/withhold.ts';
```

- [ ] **Step 2: Instantiate the heron and mount it on `worldLayer`**

Find the existing instantiation block where `headlandFire` is created (search for `createHeadlandFire` or `headlandFire`). Add adjacent:

```ts
const heron: Heron = createHeron();
worldLayer.addChild(heron.container);
// Z-order: heron sits between intentBeat.container and ambientLife.container per design memo.
```

If `worldLayer.addChild` ordering matters, ensure heron is added AFTER `intentBeat.container` and BEFORE `ambientLife.container`.

- [ ] **Step 3: Track `heronGoalMetThisNight` flag and per-frame `prevCursorPos` for velocity**

Add module-scope:

```ts
let heronGoalMetThisNight = false;
let prevCursorPos: { x: number; y: number } = { x: 0, y: 0 };
```

(If a cursor velocity is already tracked elsewhere in `main.ts`, reuse it instead of recomputing.)

- [ ] **Step 4: Update `enterNight` for night 4**

In the existing `enterNight` function (search for `enterNight` definition), add to the night-4 branch (or unconditionally if cleaner):

```ts
heron.reset();
const heronPos = scene.state.level.night.ambient?.heron;
if (heronPos !== undefined) {
  heron.setPosition(heronPos);
}
heron.container.visible = scene.state.currentNight === 4 && heronPos !== undefined;
heronGoalMetThisNight = false;

if (scene.state.currentNight === 4) {
  // Cycle-11 UX refinement #1: 250ms ease-out fade, not instant cut.
  cursorTether.fadeOut(250);
} else {
  cursorTether.setEnabled(true);
}
```

If `cursorTether.fadeOut(durationMs)` doesn't exist, add it as a simple `setTimeout(() => setEnabled(false), 0)` with an alpha tween, OR just call `cursorTether.setEnabled(false)` for now and document the cycle-11 refinement #1 as deferred to sub-cycle C feel-test polish (acceptable tradeoff if `cursorTether` doesn't currently support fade — say so in the build-log entry).

- [ ] **Step 5: Wire `updateWithhold` into the verb-switch**

Replace the cycle-10 no-op `case 'still':` branch in the switch at `main.ts:210` with:

```ts
case 'still': {
  const heronPos = scene.state.level.night.ambient?.heron;
  if (heronPos !== undefined) {
    const cursorVelocity = Math.sqrt(
      (pointer.x - prevCursorPos.x) ** 2 + (pointer.y - prevCursorPos.y) ** 2,
    ) / Math.max(dt, 0.001);
    updateWithhold(scene.state, dt, {
      heronPosition: heronPos,
      cursorPosition: { x: pointer.x, y: pointer.y },
      cursorVelocity,
      isPressed: pointer.holding,
      onShy: () => heron.triggerRecoil(),
      onGoalMet: () => {
        if (heronGoalMetThisNight) return;
        heronGoalMetThisNight = true;
        audio.heronSettleChime();
        // Existing closure callback chain (final bell + fade-to-silence + master restore) fires
        // through the existing held-success rising-edge in main.ts elsewhere — no new scheduling here.
      },
    });
  }
  break;
}
```

- [ ] **Step 6: Per-frame `heron.update` and `prevCursorPos` capture**

After `updateSoftDrift` (around `main.ts:240`), add:

```ts
if (scene.state.currentNight === 4) {
  const dwellT =
    scene.state.goalProgress.kind === 'still'
      ? scene.state.goalProgress.dwellT
      : 0;
  heron.update(dt, {
    dwellT,
    cursorPos: { x: pointer.x, y: pointer.y },
    goalComplete: scene.state.goalProgress.complete,
  });
}
prevCursorPos = { x: pointer.x, y: pointer.y };
```

- [ ] **Step 7: Pull-radius brightness modulation by `dwellT`**

Find the existing cursor-update block (where `cursor.setHoldStrength` is called or the cursor's pull-radius alpha is set). Add a brightness boost when N4 is active:

```ts
if (scene.state.currentNight === 4 && scene.state.goalProgress.kind === 'still') {
  const dwellT = scene.state.goalProgress.dwellT;
  const eased = dwellT * dwellT * (3 - 2 * dwellT);  // smoothstep(dwellT)
  cursor.setRingAlphaBoost(0.15 * eased);
}
```

If `cursor.setRingAlphaBoost(boost)` doesn't exist, add it to the `MoonCursor` interface in `cursor.ts` as a simple alpha-add on the pull-radius ring's stroke. Otherwise repurpose `setHoldStrength` by chaining with the boost.

(If neither extension is convenient, add a one-line alpha set on the cursor's ring graphics directly from `main.ts` — but document the choice in the build-log.)

### Task 6: Add explicit night-4 clause to `isNightSelectable`

**Files:**
- Modify: `game/src/scenes/nightPicker.ts`

- [ ] **Step 1: Make night-4 explicit**

Find `isNightSelectable` (around line 93). Replace the current cascade's tail with:

```ts
function isNightSelectable(night: NightNumber, meta: MetaState): boolean {
  if (meta.freeReentry) return true;
  if (meta.completedNights.has(night)) return false;
  if (night === 1) return true;
  if (night === 2) return meta.completedNights.has(1);
  if (night === 3) return meta.completedNights.has(2);
  if (night === 4) return meta.completedNights.has(3);
  return false;
}
```

The trailing `return false` is unreachable defensive code; harmless and improves explicitness.

### Task 7: Author the feel-test section (TDD-shape)

**Files:**
- Modify: `docs/specs/feel-test-protocol.md`

- [ ] **Step 1: Append the new section**

```markdown
## The N4 withhold-verb test (sub-cycle B — verb + heron + audio land; intent-beat is sub-cycle C)

**Automatable static checks** (run from `game/`):

```powershell
# 1. Verb file exists.
Test-Path src/verbs/withhold.ts                                                          # → True

# 2. Render module exists.
Test-Path src/render/heron.ts                                                            # → True

# 3. Heron state machine phases all present.
Select-String -Path src/render/heron.ts -Pattern "'idle'" -Quiet                         # → True
Select-String -Path src/render/heron.ts -Pattern "'approaching'" -Quiet                  # → True
Select-String -Path src/render/heron.ts -Pattern "'recoiling'" -Quiet                    # → True
Select-String -Path src/render/heron.ts -Pattern "'preLift'" -Quiet                      # → True
Select-String -Path src/render/heron.ts -Pattern "'lifting'" -Quiet                      # → True
Select-String -Path src/render/heron.ts -Pattern "'gone'" -Quiet                         # → True

# 4. Audio method.
Select-String -Path src/audio/manager.ts -Pattern 'heronSettleChime' -Quiet              # → True
Select-String -Path src/audio/manager.ts -Pattern '587' -Quiet                           # → True

# 5. main.ts wiring.
Select-String -Path src/main.ts -Pattern 'updateWithhold' -Quiet                         # → True
Select-String -Path src/main.ts -Pattern 'heron\.update' -Quiet                          # → True
Select-String -Path src/main.ts -Pattern 'heron\.reset' -Quiet                           # → True
Select-String -Path src/main.ts -Pattern 'heron\.triggerRecoil' -Quiet                   # → True
Select-String -Path src/main.ts -Pattern 'heronSettleChime' -Quiet                       # → True

# 6. config.ts feel-tuning constants.
Select-String -Path src/config.ts -Pattern 'WITHHOLD_RING_R' -Quiet                      # → True
Select-String -Path src/config.ts -Pattern 'WITHHOLD_DWELL_RISE' -Quiet                  # → True
Select-String -Path src/config.ts -Pattern 'WITHHOLD_PRE_LIFT_DWELL' -Quiet              # → True

# 7. Perimeter — banned identifiers (case-sensitive).
Select-String -Path src -Pattern 'creatureTrust|bond|affinity|friendship' -Recurse -CaseSensitive
# (expect: zero matches in NEW code; pre-existing matches if any are recorded in cycle-10 review)

# 8. Save-schema unchanged.
git diff ce651c6..HEAD -- src/state/save.ts
# (expect: no SaveDataV3 interface body changes; v3 read order unchanged)

# 9. Picker — explicit night-4 clause.
Select-String -Path src/scenes/nightPicker.ts -Pattern 'night === 4' -Quiet              # → True

# 10. tsc + lint clean.
npx tsc --noEmit                                                                          # → exit 0
npm run lint                                                                              # → exit 0
```

**Manual feel-test steps** (browser, run `npm run dev` from `game/`):

1. Fresh tab, clear `localStorage`, complete N1 → N2 → N3 → reach N4 selectable. Press N4. Title card "Last quarter. The bay holds what was given." holds 3000 ms, fades 400 ms.
2. After title fades, the heron is visible at the eastern foam line (`x ≈ 1700, y ≈ 880`). It's standing, body roughly upright, with a faint cool halo. Idle micro-tilt is visible but subtle (±2°, slow 4.3s cycle).
3. Hover the cursor over the bay (no press). The pull-radius ring brightens slightly as the cursor enters within 220 px of the heron. The brightening is smooth (smoothstep), not linear.
4. Press-and-hold near the heron, **keep the cursor still**. Within ~2.5 seconds the heron's wings stretch out (pre-lift wing-stretch). Continue holding still. The heron lifts on a single slow wingbeat, translates east-and-up over ~2.4s, and exits the frame. A 587 Hz settle chime plays as the lift starts; the existing final-bell + fade-to-silence + master-restore chain fires per N3's pattern.
5. **Hard-pull recoil:** restart N4 (free-reentry should be enabled after step 4). Press-and-hold and rapidly move the cursor across the heron (faster than 220 px/s within 90 px of it). The heron does a single 350 ms ease-out body-shift away from the cursor (along the cursor→heron unit vector, clamped above the foam line). It does NOT die, NOT flee permanently. Stop moving — the heron settles back to idle. Subsequent stillness re-grows `dwellT` toward the goal threshold. **No failure surface, no modal, no "RETRY?"**.
6. **Withhold without press:** restart N4. Move the cursor near the heron (within 220 px) and **don't press at all**. `dwellT` should still rise (lifting the press counts as stillness too); after ~2.5s the heron lifts.
7. **Reduce-motion check.** OS reduce-motion ON. Restart N4. Heron's idle is a static pose (no micro-tilt). Approach is an instant 100ms alpha pulse 0.85→1→0.85. Recoil is omitted (alpha pulse only). Pre-lift wing-stretch is an instant scale-pose. Lift is a 600ms alpha-fade in place (no translation).
8. **Cursor-tether suppression.** On entering N4 the foam-line cursor tether (visible on N1/N2/N3 when cursor is near a receiver) fades to alpha 0 over 250 ms. On returning to picker → N1, the tether is restored.
9. **Save schema unchanged.** Open DevTools → Application → localStorage. `neap/save/v3` exists with completedNights including 4 after step-4 success. **No new fields about the heron** (no `heronSeen`, `lastHeronVisitAt`, `heronTrust`, etc).
10. **Perimeter check.** Throughout the session, no UI text mentions "heron," "creature," "trust," "bond," "friend," etc. The game is wordless about it; the player meets the heron silently.
```

### Task 8: Run verification

- [ ] **Step 1: tsc + lint**

```powershell
cd game; npx tsc --noEmit; npm run lint
```

Expected: both exit 0.

- [ ] **Step 2: Cycle-11 automatable checks** (Task 7 list, items 1–10).

Expected: every Select-String True; banned-identifier grep returns zero NEW matches; save.ts diff shows no `SaveDataV3` body changes.

- [ ] **Step 3: Cycles 1–10 regression checks** (per cycle-10 plan Task 12 step 4 + add the new cycle-10 anchors).

Expected: all True except the cursorTrail.ts negative.

- [ ] **Step 4: Ethics-perimeter sweep** (per cycle-10 plan Task 12 step 5).

Expected: clean.

### Task 9: Append cycle-11 entry to build-log

**Files:**
- Modify: `docs/specs/build-log.md`

- [ ] **Step 1: Append**

Follow the cycle-10 entry's structure (Built / Files touched / Verification / P3 cuts / Out of scope / Watch-outs / Commit). Specifically capture:
- Sub-cycle B's three deliverables (verb / heron / audio) plus the four wirings (cursor-tether / brightness / picker carry-over / WATER_PALETTES typing).
- Cycle-11 retro refinements applied (cycle-10 reviewer carry-overs bundled, UX refinements + architectural clarifications + perimeter enforcement honoured).
- Any deviations from this plan flagged.

### Task 10: Commit

- [ ] **Step 1: Stage + commit**

```powershell
git add game/src/verbs/withhold.ts game/src/render/heron.ts game/src/audio/manager.ts game/src/main.ts game/src/config.ts game/src/scenes/nightPicker.ts docs/specs/feel-test-protocol.md docs/specs/forward-feature-1.md docs/specs/forward-feature-1-plan-b.md docs/specs/build-log.md
git commit -m "feat(n4-withhold): captain cycle 11 sub-cycle B — verb + heron render + settle chime + cursor-tether suppression + dwellT brightness modulation"
```

---

## Self-Review

**Spec coverage:** Sub-cycle B items in `forward-feature-1.md` "Sub-cycle decomposition" (B: verb + render module + audio + cursor-tether suppression + pull-radius brightness modulation by `dwellT`) all map to tasks above. Cycle-11 retro refinements 1–13 all surface in tasks: 1→Task 5 step 4; 2→Task 3; 3→Task 3; 4→Task 5 step 7; 5→Task 2; 6→Task 3; 7→Task 5 step 4; 8→Task 7 + Task 8; 9→Task 8; 10→Task 1, 2; 11→Task 1; 12→Task 1 step 2; 13→Task 6.

**Placeholder scan:** No "TBD" / "TODO" / "implement later." Every step has actual code or exact command. Comments are single-line per §131.

**Type consistency:** `still` GoalProgress kind matches cycle-10's discriminant; `dwellT` field name matches cycle-10's field; `heron` ambient block matches the level-data shape from sub-cycle A; `WITHHOLD_*` constants are referenced by `verbs/withhold.ts` (Task 2) using the exact names defined in `config.ts` (Task 1).

**Banned-identifier scan:** No `creatureTrust`, `bond`, `affinity`, `friendship`, `trust` in any code block in this plan. Variable names are `dwellT`, `recoilCooldownUntil`, `heronGoalMetThisNight`, `liftStartPos`, etc.

**Save schema invariant:** No task touches `SaveDataV3`'s body. Persistence shape is byte-identical to sub-cycle A.

---

## Captain protocol — execution shape

After this plan executes (one `dev-agent` dispatch), the captain cycle continues:

1. `Agent(qa-agent)` — runs the feel-test protocol §"The N4 withhold-verb test" automatable section + cycles 1–10 regression suite + ethics-perimeter sweep + the perimeter banned-identifier grep gate; drafts the QA build-log entry.
2. `Agent(reviewer)` — reviews the diff against this plan + `forward-feature-1.md` + conventions; drafts the reviewer verdict.
3. Stage 6 — orchestrator final tsc + lint + verification sweep; append `forward-log.md` cycle-11 entry; `ScheduleWakeup` for cycle 12 with `delaySeconds: 1200` (sub-cycle C is the sub-cycle finale — intent-beat + polish + Steam-page propagation; expect lighter cycle than B).
