# Neap N4 — Sub-cycle A Implementation Plan

> **For agentic workers:** This plan is executed by `dev-agent` per the captain protocol's NEW_FEATURE stack step 4 (substituting `subagent-driven-development` because the captain cycle dispatches `dev-agent` for the whole sub-cycle as one chunk, then `qa-agent` + `reviewer` once after). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Land the schema, level data, and picker scaffolding for N4 (last-quarter, withhold verb, heron) such that N4 loads via the picker but is mechanically inert. Sub-cycles B (verb + render module + audio) and C (intent-beat + polish) follow in subsequent captain cycles.

**Architecture:** Extend `level/types.ts` (LunarPhase, GoalKind, NightNumber, AmbientDef), author `night-4.delta.json`, register in `loader.ts`, bump save schema v2→v3 with permissive backwards-compatible migration, extend meta-state for 4 nights, extend `GoalProgress` discriminated union with the `still` kind, add no-op verb-switch branches for exhaustiveness, render the picker's 4th slot with a new last-quarter cursor glyph, add the title-card N4 line. **No new render modules; no new verb files; no audio changes; no main.ts logic changes beyond exhaustiveness no-ops.** That all lands in sub-cycle B.

**Tech Stack:** TypeScript 6 (strict), Pixi.js 8.18.1, Vite, Web Audio (untouched this cycle), localStorage.

**Spec:** `docs/specs/forward-feature-1.md` (sections "In scope", "Out of scope", "Sub-cycle decomposition" — sub-cycle A only this cycle).

**Captain protocol substitution:** `superpowers:brainstorming` user-approval gate satisfied by Stage-3 8-specialist ratification (cycle 10 retro: 8/8 NEW_FEATURE on cluster A "Build a fourth night," mean URG 4.5). User's verbatim cycle-10 nudge — *"build without my input — I want to be impressed"* — explicit delegation. Recorded for traceability.

---

## File Structure (sub-cycle A)

**Create:**
- `game/levels/night-4.delta.json` — level data for N4 (last-quarter, pull strength 0.75, pull radius 95, no spawns, `goal.kind: 'still'`, ambient heron position).

**Modify:**
- `game/src/level/types.ts` — extend `LunarPhase`, `GoalKind`, `NightNumber`, add `StillGoal`, extend `Goal` union, extend `AmbientDef` with `heron?: Vec2`.
- `game/src/level/loader.ts` — register `night-4.delta.json`.
- `game/src/state/save.ts` — bump `SAVE_KEY` to `'neap/save/v3'`, add `LEGACY_KEY_V2 = 'neap/save/v2'`, add `SaveDataV3`, extend `loadSave`/`writeSave`, extend `filterNights` and `filterGhosts` validators to include night 4.
- `game/src/state/meta.ts` — change `meta.completedNights.size === 3` to `=== 4` at line 70, extend `nextLinearNight` to chain through 4.
- `game/src/state/gameState.ts` — extend `GoalProgress` union with `{ kind: 'still'; dwellT: number; complete: boolean }`, extend `initialGoalProgress` and `recoverFromSoftDrift` switches with `still` cases (no-ops mechanically — the verb is sub-cycle B).
- `game/src/main.ts` — add `case 'still':` no-op branch in the verb-switch at line 210 to preserve TypeScript exhaustiveness.
- `game/src/render/cursor.ts` — extend `PULL_RADII` and the `switch (phase)` in `makeCursorForPhase` with the `last-quarter` variant.
- `game/src/scenes/nightPicker.ts` — extend `NIGHT_PHASES` record with `4: 'last-quarter'`, change the slots-array literal `[1, 2, 3]` to `[1, 2, 3, 4]`, change slot positioning `(idx - 1)` to `(idx - 1.5)`, extend `isNightSelectable` with the night-4 linear-gate clause.
- `game/src/render/titleCard.ts` — add `'last-quarter': 'Last quarter.  The bay holds what was given.'` to `TITLE_STRINGS`.
- `docs/specs/feel-test-protocol.md` — append "## The N4 schema-only test" section with manual + automatable checks (TDD-shape: written before the dev-agent ships, RED before, GREEN after).
- `docs/specs/build-log.md` — append cycle-10 entry per the loop's pattern (Built / Files touched / Verification / P3 cuts / Out of scope / Watch-outs / Commit).

**Out of scope (sub-cycle A — explicitly NOT touched):**
- `game/src/verbs/withhold.ts` (new file — sub-cycle B).
- `game/src/render/heron.ts` (new file — sub-cycle B).
- `game/src/audio/manager.ts` (no changes — sub-cycle B adds `heronSettleChime`).
- `game/src/render/intentBeat.ts` (no changes — sub-cycle C adds N4 path).
- `motion-and-colour-bible.md` (no changes — sub-cycle C swap-table additions).

---

## Tasks

### Task 1: Extend type definitions for N4

**Files:**
- Modify: `game/src/level/types.ts`

- [ ] **Step 1: Add `'last-quarter'` to `LunarPhase`**

```ts
export type LunarPhase = 'waxing-crescent' | 'full' | 'waning-gibbous' | 'last-quarter';
```

- [ ] **Step 2: Add `'still'` to `GoalKind`**

```ts
export type GoalKind = 'guide' | 'gather' | 'send' | 'still';
```

- [ ] **Step 3: Add `StillGoal` interface and extend `Goal` union**

```ts
export interface StillGoal {
  kind: 'still';
  proximityRadius: number;
  hardRadius: number;
  dwellSeconds: number;
}

export type Goal = GuideGoal | GatherGoal | SendGoal | StillGoal;
```

- [ ] **Step 4: Extend `AmbientDef` with `heron?: Vec2`**

```ts
export interface AmbientDef {
  fire?: Vec2;
  heron?: Vec2;
}
```

- [ ] **Step 5: Extend `NightNumber`**

```ts
export type NightNumber = 1 | 2 | 3 | 4;
```

- [ ] **Step 6: Run `npx tsc --noEmit` from `game/` and confirm errors point to the call sites that need updating in subsequent tasks**

Expected: TypeScript will now flag missing exhaustiveness at:
- `game/src/state/gameState.ts:68-76` (`initialGoalProgress`)
- `game/src/state/gameState.ts:96-105` (`recoverFromSoftDrift`)
- `game/src/main.ts:210` (the verb switch)
- `game/src/render/cursor.ts:32-44` (the `switch (phase)`)
- `game/src/render/cursor.ts:11-15` (`PULL_RADII` record missing `last-quarter`)
- `game/src/scenes/nightPicker.ts:19-23` (`NIGHT_PHASES` record missing `4`)
- `game/src/render/titleCard.ts:9-13` (`TITLE_STRINGS` record missing `last-quarter`)
- `game/src/level/loader.ts:8-12` (`nights` Record<NightNumber, NightDelta> missing `4`)

This is intended — the next tasks resolve them.

### Task 2: Author night-4 level data

**Files:**
- Create: `game/levels/night-4.delta.json`

- [ ] **Step 1: Write the JSON**

```json
{
  "lunarPhase": "last-quarter",
  "pullStrength": 0.75,
  "pullRadius": 95,
  "spawns": [],
  "goal": {
    "kind": "still",
    "proximityRadius": 220,
    "hardRadius": 90,
    "dwellSeconds": 2.22
  },
  "ambient": { "heron": { "x": 1700, "y": 880 } }
}
```

Notes for the dev-agent:
- `spawns: []` is correct — N4 has no boats or lanterns. The heron is in `ambient`, not in `state.receivers`, consistent with how the cycle-7 fire is held outside `state.receivers` (per design-spec items in the closure-sprint plan §2.2).
- `pullStrength: 0.75` and `pullRadius: 95` per the N4 design memo (between waxing-crescent's 0.7/80 and full's 1.0/140; the gentlest of the four phases).
- `proximityRadius: 220`, `hardRadius: 90`, `dwellSeconds: 2.22` are placeholder feel-tuning constants per the mechanic spec (1.0 / DWELL_RISE = 2.22s minimum stillness time at 0.45 /s rise rate). They will be tuned in sub-cycle B's feel-test, not now.
- `heron.x: 1700, heron.y: 880` is at the eastern foam line, sharing the spatial axis of N3's headland fire (`x: 1700, y: 980`) but ground-level rather than mid-water.

### Task 3: Register night-4 in the loader

**Files:**
- Modify: `game/src/level/loader.ts`

- [ ] **Step 1: Add the import**

```ts
import night4Json from '../../levels/night-4.delta.json' with { type: 'json' };
```

- [ ] **Step 2: Extend the `nights` record**

```ts
const nights: Record<NightNumber, NightDelta> = {
  1: night1Json as NightDelta,
  2: night2Json as NightDelta,
  3: night3Json as NightDelta,
  4: night4Json as NightDelta,
};
```

### Task 4: Extend `gameState.ts` for the `still` goal

**Files:**
- Modify: `game/src/state/gameState.ts`

- [ ] **Step 1: Extend `GoalProgress` union**

Replace lines 18–26 with:

```ts
export type GoalProgress =
  | { kind: 'guide'; inHarbourMs: number; complete: boolean }
  | {
      kind: 'gather';
      clusterCount: number;
      clusterMs: number;
      complete: boolean;
    }
  | { kind: 'send'; sentCount: number; complete: boolean }
  | { kind: 'still'; dwellT: number; complete: boolean };
```

- [ ] **Step 2: Extend `initialGoalProgress` switch**

Add a `case 'still'` branch:

```ts
function initialGoalProgress(kind: GoalKind): GoalProgress {
  switch (kind) {
    case 'guide':
      return { kind: 'guide', inHarbourMs: 0, complete: false };
    case 'gather':
      return { kind: 'gather', clusterCount: 0, clusterMs: 0, complete: false };
    case 'send':
      return { kind: 'send', sentCount: 0, complete: false };
    case 'still':
      return { kind: 'still', dwellT: 0, complete: false };
  }
}
```

- [ ] **Step 3: Extend `recoverFromSoftDrift` with the `still` reset**

Add after the `'send'` clause at line 103:

```ts
  if (state.goalProgress.kind === 'still') {
    state.goalProgress.dwellT = 0;
  }
```

(Note: soft-drift will not fire on N4 in practice because the heron is not a receiver, but the exhaustiveness reset is correct defensive code per the loop's existing pattern.)

### Task 5: Add `case 'still':` no-op branch in the main verb-switch

**Files:**
- Modify: `game/src/main.ts`

- [ ] **Step 1: Add the no-op branch**

In the switch at line 210, add a `case 'still':` clause after the `case 'send':` block:

```ts
      switch (scene.state.level.night.goal.kind) {
        case 'guide':
          updateGuide(scene.state, grid, dt);
          break;
        case 'gather':
          updateGather(scene.state, grid, dt);
          break;
        case 'send': {
          // ... existing send block unchanged
          break;
        }
        case 'still':
          // Sub-cycle A: mechanically inert; updateWithhold lands in sub-cycle B.
          break;
      }
```

The single-line comment is within conventions §131 (one short line max); preserves traceability for the reviewer.

### Task 6: Add `last-quarter` to the cursor module

**Files:**
- Modify: `game/src/render/cursor.ts`

- [ ] **Step 1: Add the colour constants**

After the existing colour constants (line 8 area), add:

```ts
const LAST_QUARTER_FILL = 0xe7ddc8;
const LAST_QUARTER_SHADOW = 0x2c2a26;
```

- [ ] **Step 2: Extend `PULL_RADII`**

```ts
const PULL_RADII: Record<LunarPhase, number> = {
  'waxing-crescent': 80,
  full: 140,
  'waning-gibbous': 110,
  'last-quarter': 95,
};
```

- [ ] **Step 3: Add the `'last-quarter'` case in the `switch (phase)`**

After the `'waning-gibbous'` case in the disc switch (around line 40):

```ts
    case 'last-quarter':
      disc.circle(0, 0, 26).fill(LAST_QUARTER_FILL);
      disc.circle(-8, 0, 22).fill({ color: LAST_QUARTER_SHADOW, alpha: 0.55 });
      break;
```

The `-8` x-offset on the shadow puts it on the **leading hemisphere** (opposite the waning-gibbous `+8` trailing-hemisphere shadow), distinguishing N4 visually from N3 at a 200ms screenshot glance per the design memo.

### Task 7: Bump save schema v2→v3

**Files:**
- Modify: `game/src/state/save.ts`

- [ ] **Step 1: Add the new constants and interface**

Replace lines 4–18 with:

```ts
const SAVE_KEY = 'neap/save/v3';
const LEGACY_KEY_V2 = 'neap/save/v2';
const LEGACY_KEY_V1 = 'tide-pull/save/v1';

interface SaveDataV1 {
  version: 1;
  completedNights: NightNumber[];
  freeReentry: boolean;
}

interface SaveDataV2 {
  version: 2;
  completedNights: NightNumber[];
  freeReentry: boolean;
  ghosts: PersistedGhost[];
}

interface SaveDataV3 {
  version: 3;
  completedNights: NightNumber[];
  freeReentry: boolean;
  ghosts: PersistedGhost[];
}
```

- [ ] **Step 2: Update `loadSave` to read v3 → v2 → v1 → empty**

Replace the body of `loadSave()` (lines 26–58) with:

```ts
export function loadSave(): PersistedMeta {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveDataV3>;
      if (parsed.version === 3) {
        return {
          completedNights: filterNights(parsed.completedNights),
          freeReentry: Boolean(parsed.freeReentry),
          ghosts: filterGhosts(parsed.ghosts),
        };
      }
    }
  } catch {
    // Fall through.
  }

  try {
    const raw = localStorage.getItem(LEGACY_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveDataV2>;
      if (parsed.version === 2) {
        const migrated: PersistedMeta = {
          completedNights: filterNights(parsed.completedNights),
          freeReentry: Boolean(parsed.freeReentry),
          ghosts: filterGhosts(parsed.ghosts),
        };
        writeSave(migrated);
        return migrated;
      }
    }
  } catch {
    // Fall through.
  }

  try {
    const raw = localStorage.getItem(LEGACY_KEY_V1);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<SaveDataV1>;
    if (parsed.version !== 1) return { ...EMPTY };
    const migrated: PersistedMeta = {
      completedNights: filterNights(parsed.completedNights),
      freeReentry: Boolean(parsed.freeReentry),
      ghosts: [],
    };
    writeSave(migrated);
    return migrated;
  } catch {
    return { ...EMPTY };
  }
}
```

- [ ] **Step 3: Update `writeSave` to write v3**

Replace the body (lines 60–72):

```ts
export function writeSave(persisted: PersistedMeta): void {
  const data: SaveDataV3 = {
    version: 3,
    completedNights: persisted.completedNights,
    freeReentry: persisted.freeReentry,
    ghosts: persisted.ghosts,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Quota / disabled storage stays non-fatal.
  }
}
```

- [ ] **Step 4: Extend `filterNights` to include night 4**

Replace lines 74–77:

```ts
function filterNights(input: unknown): NightNumber[] {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (n): n is NightNumber => n === 1 || n === 2 || n === 3 || n === 4,
  );
}
```

- [ ] **Step 5: Extend `filterGhosts` night-validator**

Replace the night clause in the filter at line 87:

```ts
return (
  (obj.night === 1 || obj.night === 2 || obj.night === 3 || obj.night === 4) &&
  typeof obj.x === 'number' &&
  typeof obj.y === 'number' &&
  typeof obj.type === 'string' &&
  RECEIVER_TYPES.includes(obj.type as ReceiverType)
);
```

### Task 8: Extend meta state for 4 nights

**Files:**
- Modify: `game/src/state/meta.ts`

- [ ] **Step 1: Update the `freeReentry` gate at line 70**

Change:
```ts
if (meta.completedNights.size === 3) {
```
to:
```ts
if (meta.completedNights.size === 4) {
```

- [ ] **Step 2: Extend `nextLinearNight` to chain through 4**

Replace the body (lines 75–80):

```ts
export function nextLinearNight(meta: MetaState): NightNumber | null {
  if (!meta.completedNights.has(1)) return 1;
  if (!meta.completedNights.has(2)) return 2;
  if (!meta.completedNights.has(3)) return 3;
  if (!meta.completedNights.has(4)) return 4;
  return null;
}
```

### Task 9: Render 4 slots in the picker

**Files:**
- Modify: `game/src/scenes/nightPicker.ts`

- [ ] **Step 1: Extend `NIGHT_PHASES`**

Replace lines 19–23:

```ts
const NIGHT_PHASES: Record<NightNumber, LunarPhase> = {
  1: 'waxing-crescent',
  2: 'full',
  3: 'waning-gibbous',
  4: 'last-quarter',
};
```

- [ ] **Step 2: Update the slots-iteration literal and centring**

Replace lines 39–49:

```ts
  ([1, 2, 3, 4] as NightNumber[]).forEach((night, idx) => {
    const slot = new Container();
    slot.position.set((idx - 1.5) * SLOT_SPACING, 0);
    slot.pivot.set(0, 0);
    const ghostContainer = new Container();
    slot.addChild(ghostContainer);
    const glyph = makeCursorForPhase(NIGHT_PHASES[night]);
    slot.addChild(glyph.container);
    container.addChild(slot);
    slots.push({ container: slot, night, ghostContainer });
  });
```

The `(idx - 1.5)` centres four slots symmetrically: indices 0..3 produce x-offsets `-1.5, -0.5, 0.5, 1.5` × `SLOT_SPACING`.

- [ ] **Step 3: Extend `isNightSelectable` for night 4**

Replace the body (lines 93–99):

```ts
function isNightSelectable(night: NightNumber, meta: MetaState): boolean {
  if (meta.freeReentry) return true;
  if (meta.completedNights.has(night)) return false;
  if (night === 1) return true;
  if (night === 2) return meta.completedNights.has(1);
  if (night === 3) return meta.completedNights.has(2);
  return meta.completedNights.has(3);
}
```

The final `return meta.completedNights.has(3)` covers night 4. Per the existing pattern, completed nights are not re-selectable in linear mode.

### Task 10: Add the title-card N4 line

**Files:**
- Modify: `game/src/render/titleCard.ts`

- [ ] **Step 1: Extend `TITLE_STRINGS`**

Replace lines 9–13:

```ts
const TITLE_STRINGS: Record<LunarPhase, string> = {
  'waxing-crescent': 'Waxing crescent.  The harbour is restless tonight.',
  full: 'Full moon.  The bay fills.',
  'waning-gibbous': 'Waning gibbous.  The lanterns are lit.',
  'last-quarter': 'Last quarter.  The bay holds what was given.',
};
```

(Two spaces after the period between sentences, matching the existing pattern.)

### Task 11: Author the feel-test section (TDD-shape — written BEFORE the dev-agent ships)

**Files:**
- Modify: `docs/specs/feel-test-protocol.md`

- [ ] **Step 1: Append the new section at the end of the file**

Add a `## The N4 schema-only test` section with:

```markdown
## The N4 schema-only test (sub-cycle A — schema lands; verb is sub-cycle B)

**Automatable static checks** (run from `game/`):

```powershell
# 1. Schema files exist and parse.
Test-Path levels/night-4.delta.json                                              # → True
node -e "JSON.parse(require('fs').readFileSync('levels/night-4.delta.json','utf8'))"  # → no throw

# 2. Type extensions present.
Select-String -Path src/level/types.ts -Pattern "'last-quarter'" -Quiet           # → True
Select-String -Path src/level/types.ts -Pattern "'still'" -Quiet                  # → True
Select-String -Path src/level/types.ts -Pattern "StillGoal" -Quiet                # → True
Select-String -Path src/level/types.ts -Pattern "1 \| 2 \| 3 \| 4" -Quiet         # → True
Select-String -Path src/level/types.ts -Pattern "heron\?: Vec2" -Quiet            # → True

# 3. Loader registration.
Select-String -Path src/level/loader.ts -Pattern "night-4.delta.json" -Quiet      # → True
Select-String -Path src/level/loader.ts -Pattern "4: night4Json" -Quiet           # → True

# 4. Save schema v3.
Select-String -Path src/state/save.ts -Pattern "'neap/save/v3'" -Quiet            # → True
Select-String -Path src/state/save.ts -Pattern "'neap/save/v2'" -Quiet            # → True (legacy key reference)
Select-String -Path src/state/save.ts -Pattern "version: 3" -Quiet                # → True
Select-String -Path src/state/save.ts -Pattern "n === 4" -Quiet                   # → True

# 5. Meta state.
Select-String -Path src/state/meta.ts -Pattern "size === 4" -Quiet                # → True
Select-String -Path src/state/meta.ts -Pattern "completedNights.has\(4\)" -Quiet  # → True

# 6. Picker scaffolding.
Select-String -Path src/scenes/nightPicker.ts -Pattern "1, 2, 3, 4" -Quiet        # → True
Select-String -Path src/scenes/nightPicker.ts -Pattern "'last-quarter'" -Quiet    # → True
Select-String -Path src/scenes/nightPicker.ts -Pattern "idx - 1.5" -Quiet         # → True

# 7. Cursor + title-card additions.
Select-String -Path src/render/cursor.ts -Pattern "'last-quarter'" -Quiet         # → True
Select-String -Path src/render/titleCard.ts -Pattern "'last-quarter'" -Quiet      # → True
Select-String -Path src/render/titleCard.ts -Pattern "Last quarter" -Quiet        # → True

# 8. Verb-switch exhaustiveness no-op for 'still'.
Select-String -Path src/main.ts -Pattern "case 'still'" -Quiet                    # → True

# 9. GoalProgress union extended + initialGoalProgress + recoverFromSoftDrift cover 'still'.
Select-String -Path src/state/gameState.ts -Pattern "kind: 'still'" -Quiet        # → True

# 10. tsc + lint clean.
npx tsc --noEmit                                                                   # → exit 0
npm run lint                                                                       # → exit 0
```

**Manual feel-test steps** (browser, run `npm run dev` from `game/`):

1. Fresh tab, clear `localStorage`, reload. Picker shows **four slots** (waxing-crescent / full / waning-gibbous / last-quarter glyphs). No padlocks. No badges. Slots are symmetrically centred around the screen midpoint.
2. Press the N4 slot. Routing falls back to N1 (linear gate). N1 plays normally.
3. Complete N1, N2, N3 in order. After N3 completes, picker shows N4 selectable.
4. Press the N4 slot. Title card reads exactly **"Last quarter.  The bay holds what was given."** (two spaces between sentences). Card holds 3000 ms then fades.
5. After title fades, the cursor displays the **last-quarter half-disc** glyph (leading hemisphere shadowed; opposite of N3's trailing-hemisphere shadow). Pull-radius ring is 95 px.
6. Press-and-hold pulls water with strength 0.75× (gentlest of the four). The water responds; nothing else happens. The bay is empty (no boats, no lanterns). **The night never completes** — this is correct for sub-cycle A; the heron + verb land in sub-cycle B.
7. Press the browser back-button or refresh. Save is written under `localStorage['neap/save/v3']` (DevTools → Application → localStorage). `version: 3` field present. `completedNights` includes 1, 2, 3 (not 4 — N4 didn't complete because the verb is inert).
8. **v2 → v3 migration check.** Open DevTools console, run:
   ```js
   localStorage.clear();
   localStorage.setItem('neap/save/v2', JSON.stringify({
     version: 2,
     completedNights: [1, 2],
     freeReentry: false,
     ghosts: [{ night: 1, type: 'boat', x: 1700, y: 540 }],
   }));
   ```
   Reload the tab. Picker shows N3 selectable, ghost silhouettes render for N1 at the picker (cycle-9 pattern), and `localStorage['neap/save/v3']` exists with the migrated data; `localStorage['neap/save/v2']` is left in place defensively.
9. **Reduce-motion check (no behaviour change for sub-cycle A).** OS reduce-motion ON, repeat steps 1–6. The picker, cursor, title-card, and water-pull behaviours are unchanged from existing nights — sub-cycle A introduces no new motion.
```

The static-check section is the **automatable gate**; the manual section is the **browser feel-test** that QA flags as pending human pass per the loop's pattern.

### Task 12: Run verification

- [ ] **Step 1: Run `npx tsc --noEmit` from `game/`**

Expected: exit 0.

- [ ] **Step 2: Run `npm run lint` from `game/`**

Expected: exit 0.

- [ ] **Step 3: Run the cycle-10 automatable static checks** (the section authored in Task 11, item 1–9).

Expected: every Select-String returns True; the `JSON.parse` returns no throw.

- [ ] **Step 4: Re-run the cycle 1–9 regression checks** to confirm no regressions:

```powershell
Select-String -Path src/render/moonrise.ts -Pattern 'prefersReducedMotion' -Quiet         # cycle 1 → True
Select-String -Path src/main.ts -Pattern 'SAVOUR_MIN_MS' -Quiet                            # cycle 2 → True
Test-Path src/render/intentBeat.ts                                                          # cycle 3 → True
Select-String -Path src/main.ts -Pattern "'intentBeat'" -Quiet                             # cycle 3 → True
Select-String -Path src/main.ts -Pattern 'OQ18' -Quiet                                     # cycle 4 → True
Select-String -Path src/audio/manager.ts -Pattern 'finalBell|fadeToSilence|restoreMaster' -Quiet  # cycle 5 → True
Test-Path src/render/cursorTether.ts                                                        # cycle 6 → True
-not (Test-Path src/render/cursorTrail.ts)                                                  # cycle 6 negative → True
Select-String -Path src/config.ts -Pattern 'N3_FINAL_BELL_DELAY_MS' -Quiet                 # cycle 6 → True
Test-Path src/render/headlandFire.ts                                                        # cycle 7 → True
Select-String -Path src/audio/manager.ts -Pattern 'lanternIgnitesFire' -Quiet              # cycle 7 → True
Select-String -Path src/scenes/nightPicker.ts -Pattern 'PICKER_GHOST' -Quiet               # cycle 9 → True
Select-String -Path src/scenes/nightPicker.ts -Pattern 'sessionGhosts.has' -Quiet          # cycle 9 fix → True
```

- [ ] **Step 5: Run the ethics-perimeter sweep** per the loop's pattern:

```powershell
# No analytics imports.
Select-String -Path src -Pattern 'import .* from .[^.].*amplitude|posthog|sentry|mixpanel|google-analytics|plausible' -Recurse | Select-Object -First 5
# (expect: empty)

# No outbound network.
Select-String -Path src -Pattern 'fetch\(|XMLHttpRequest|WebSocket|EventSource|navigator\.sendBeacon|new Notification' -Recurse | Select-Object -First 5
# (expect: empty)

# No forbidden UI strings.
Select-String -Path src -Pattern 'streak|leaderboard|share|wishlist|follow|invite|earn|achievement|badge|trophy|complete|completed|score|tally|count|stat|stats|mins played|sessions played|today.s seed|daily challenge' -Recurse | Select-Object -First 10
# (expect: only existing usages — review any new hits)

# Save key conformance.
Select-String -Path src -Pattern "localStorage\.(getItem|setItem|removeItem)" -Recurse
# (expect: only references to 'neap/save/v3', 'neap/save/v2', 'tide-pull/save/v1' — no new keys)

# No new runtime deps.
git diff package.json
# (expect: no `dependencies` changes)
```

### Task 13: Append cycle-10 entry to build-log

**Files:**
- Modify: `docs/specs/build-log.md`

- [ ] **Step 1: Append the cycle-10 entry**

Append at the end of the file, following the cycle-9 pattern:

```markdown
## Captain cycle 10 — N4 schema scaffolding (forward-feature-1 sub-cycle A)

### Cycle 10 — 2026-05-07

- **Built:**
  - **N4 schema scaffolding (sub-cycle A of forward-feature-1).** First captain cycle running the full NEW_FEATURE stack — substitution chain established in cycles 5-9 was exhausted, so brainstorming + slim council ran fresh. Six-specialist slim council synthesised into `docs/specs/forward-feature-1.md`; pm decomposed into three sub-cycles (A: schema scaffolding [this cycle]; B: verb + render module + audio; C: intent-beat + polish). N4 is **last-quarter, the withhold night** — heron at the eastern foam line, stillness verb, kishōtenketsu kyū. Sub-cycle A ships the schema lands cleanly and N4 loads but is mechanically inert; the verb and heron render module land in sub-cycle B.
  - Type extensions: `LunarPhase` += `'last-quarter'`, `GoalKind` += `'still'`, new `StillGoal` interface, `Goal` union extended, `NightNumber` extended to `1 | 2 | 3 | 4`, `AmbientDef` += `heron?: Vec2`.
  - Level data: new `game/levels/night-4.delta.json` (`pullStrength: 0.75`, `pullRadius: 95`, empty spawns, `goal.kind: 'still'` with placeholder feel-tuning constants `proximityRadius: 220 / hardRadius: 90 / dwellSeconds: 2.22`, ambient heron at `(1700, 880)` — eastern foam line, sharing the spatial axis of N3's headland fire).
  - Loader: registers `night-4.delta.json` at `nights[4]`.
  - Save schema bump v2 → v3 with backwards-compatible migration: read order is v3 → v2 → v1 → empty; v2 lifts shape unchanged (no field changes between v2 and v3); v1 still reachable; quota / disabled storage stays non-fatal per the existing `try`/`catch` pattern.
  - `meta.ts`: `size === 3` extends to `size === 4` (`freeReentry` gate); `nextLinearNight` extends to chain 1 → 2 → 3 → 4.
  - `gameState.ts`: `GoalProgress` union extended with `{ kind: 'still'; dwellT: number; complete: boolean }`; `initialGoalProgress` and `recoverFromSoftDrift` extended with `still` cases.
  - Verb-switch in `main.ts`: `case 'still':` no-op branch added for TypeScript exhaustiveness; one short comment line within conventions §131.
  - Cursor: `last-quarter` glyph variant added — half-disc with leading-hemisphere shadow (opposite of N3's trailing-hemisphere shadow), 26 px disc, `#e7ddc8` fill, `#2c2a26` shadow, pull-radius 95 px.
  - Picker: 4 slots from launch (`[1, 2, 3, 4]`); centring `(idx - 1.5) * SLOT_SPACING`; `NIGHT_PHASES[4] = 'last-quarter'`; `isNightSelectable` linear-gate extended.
  - Title card: `'last-quarter': 'Last quarter.  The bay holds what was given.'` added to `TITLE_STRINGS` (storyboarder line, two-space inter-sentence spacing matching existing pattern).
- **Files touched:** `game/src/level/types.ts`, `game/src/level/loader.ts`, `game/levels/night-4.delta.json` (new), `game/src/state/save.ts`, `game/src/state/meta.ts`, `game/src/state/gameState.ts`, `game/src/main.ts`, `game/src/render/cursor.ts`, `game/src/scenes/nightPicker.ts`, `game/src/render/titleCard.ts`, `docs/specs/feel-test-protocol.md`, `docs/specs/forward-feature-1.md` (new), `docs/specs/forward-feature-1-plan.md` (new), `docs/specs/build-log.md` (this entry).
- **Verification:**
  1. `npx tsc --noEmit` — exit 0.
  2. `npm run lint` — exit 0.
  3. Cycle-10 automatable static checks (Task 11 list, items 1–9) — all True.
  4. Cycles 1–9 regression checks — all True.
  5. Ethics-perimeter sweep — clean (no new analytics, no new outbound network, no new forbidden UI strings, no new localStorage keys other than the v3 key, no new runtime deps).
- **P3 cuts taken:** None.
- **Out of scope (sub-cycle A — explicitly NOT touched):**
  - `game/src/verbs/withhold.ts` (sub-cycle B).
  - `game/src/render/heron.ts` (sub-cycle B).
  - `game/src/audio/manager.ts` heron chime (sub-cycle B).
  - `game/src/render/intentBeat.ts` N4 path (sub-cycle C).
  - `motion-and-colour-bible.md` swap-table additions (sub-cycle C).
- **Watch-outs:**
  - The `goal.kind === 'still'` no-op branch in `main.ts` means N4 cannot complete in sub-cycle A. This is correct and tested manually in feel-test step 6. Sub-cycle B's `updateWithhold` call replaces the no-op.
  - The `dwellSeconds: 2.22` constant in `night-4.delta.json` is a placeholder feel-tuning value (1.0 / DWELL_RISE = 2.22 at DWELL_RISE = 0.45/s). Sub-cycle B's feel-test will tune.
  - The heron's coordinates `(1700, 880)` share x with N3's headland fire `(1700, 980)` but at a higher y (closer to bay-centre). This is intentional spatial design per the N4 design memo — heron stands at the eastern foam line, fire burns at the headland mid-water. Verify in sub-cycle B's render module.
- **Commit:** `feat(n4-schema): captain cycle 10 sub-cycle A — N4 last-quarter schema + level data + picker scaffolding (mechanically inert; sub-cycle B lands the verb)`
```

### Task 14: Commit

- [ ] **Step 1: Stage the changes**

```powershell
git add game/src/level/types.ts game/src/level/loader.ts game/levels/night-4.delta.json game/src/state/save.ts game/src/state/meta.ts game/src/state/gameState.ts game/src/main.ts game/src/render/cursor.ts game/src/scenes/nightPicker.ts game/src/render/titleCard.ts docs/specs/feel-test-protocol.md docs/specs/forward-feature-1.md docs/specs/forward-feature-1-plan.md docs/specs/build-log.md
```

- [ ] **Step 2: Create the commit**

```powershell
git commit -m "feat(n4-schema): captain cycle 10 sub-cycle A — N4 last-quarter schema + level data + picker scaffolding"
```

(The full one-line message — no body — per the loop's pattern. The build-log entry holds the full design rationale.)

- [ ] **Step 3: Confirm the commit landed**

```powershell
git log --oneline -1
```

Expected: the commit hash + the message above.

---

## Self-Review

**Spec coverage:** Sub-cycle A items 1–13 in `forward-feature-1.md` "Sub-cycle decomposition" all map to tasks above:

| Spec item | Task |
|---|---|
| New night entry: `night-4.delta.json` + loader registration + `NightNumber` extended | Tasks 1, 2, 3 |
| `LunarPhase` extended to include `'last-quarter'` | Task 1 step 1 |
| `GoalKind` extended to include `'still'` | Task 1 step 2 |
| `StillGoal` interface; `Goal` union extended | Task 1 step 3 |
| `AmbientDef` extended with `heron?: Vec2` | Task 1 step 4 |
| Save schema bump `neap/save/v2` → `neap/save/v3` with migration | Task 7 |
| Picker integration: fourth slot rendered with `last-quarter` glyph | Tasks 6, 9 |
| `nextLinearNight` extends to chain through 4 | Task 8 |
| `meta.ts:70` size check extends | Task 8 |
| Title card storyboarder line | Task 10 |
| Verb-switch exhaustiveness for `still` (no-op) | Tasks 4, 5 |
| Feel-test protocol section | Task 11 |
| Verification + commit | Tasks 12, 14 |
| Build-log entry | Task 13 |

**Out-of-scope items (sub-cycle B/C) are explicitly not in any task:**
- New verb file `withhold.ts` (sub-cycle B).
- New render module `heron.ts` (sub-cycle B).
- Audio: new `heronSettleChime()` (sub-cycle B).
- Cursor-tether suppression on N4 (sub-cycle B — the cursor-tether interaction needs the verb to exist first).
- Intent-beat N4 path (sub-cycle C).
- Pull-radius brightness modulation by `dwellT` (sub-cycle B — the verb owns `dwellT`).

**Placeholder scan:** No "TBD," no "TODO," no "implement later." Every step has the actual code, exact file path, and the expected output. The single comment in Task 5 is one short line per conventions §131.

**Type consistency:** The `still` discriminant appears identically in `level/types.ts` (Task 1), `gameState.ts` (Task 4 — `GoalProgress` and `initialGoalProgress`), `main.ts` (Task 5 — switch case), the JSON file (Task 2), the picker (Task 9 indirectly via `NIGHT_PHASES`), the cursor (Task 6 indirectly via `LunarPhase`), and the title-card (Task 10). No naming drift.

**Field-name consistency:** `dwellT` is the canonical name across the design memo, the spec, this plan, and Task 4. No `creatureTrust`, no `bond`, no `affinity`, no `friendship` anywhere — habit-formation perimeter contract holds.

**Save key consistency:** `'neap/save/v3'` appears in Task 7 (writes), Task 11 (the static check), and Task 13 (the build-log entry). `'neap/save/v2'` appears as the **legacy read** key only. No drift.

---

## Captain protocol — execution shape after the plan

After this plan executes (one `dev-agent` dispatch with the plan in hand), the captain cycle continues:

1. `Agent(qa-agent)` — runs the feel-test-protocol §"The N4 schema-only test" automatable section + cycles 1–9 regression suite + ethics-perimeter sweep + drafts the QA build-log entry.
2. `Agent(reviewer)` — reviews the diff `ce651c6..HEAD` against the spec (`forward-feature-1.md`), this plan, and conventions; drafts the reviewer verdict build-log entry.
3. `superpowers:requesting-code-review` — orchestrator final review pass before logging the cycle.
4. Stage 6 verification — `npx tsc --noEmit` + automatable feel-test-protocol subset.
5. Append `forward-log.md` cycle-10 entry per the standard template.
6. `ScheduleWakeup` for cycle 11 with `delaySeconds: 1200` (NEW_FEATURE cycle, paid the cache miss, amortise; sub-cycle B is heavier than a typical BUG_POLISH cycle and warrants the longer interval).

If sub-cycle A's plan execution + qa + reviewer surfaces blockers (per the cycles-4/6/7/9 mid-cycle blocker-fix pattern), orchestrator fixes orchestrator-side per the established precedent and records the fix in the cycle-10 forward-log entry.
