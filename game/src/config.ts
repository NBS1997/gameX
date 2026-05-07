import type { LunarPhase } from './level/types.ts';

export const LOGICAL_WIDTH = 1920;
export const LOGICAL_HEIGHT = 1080;

export const BAY_COLOUR = 0x1a2638;
export const LETTERBOX_COLOUR = '#0e1722';

export const CURSOR_COLOUR = 0xfff4d6;
export const CURSOR_PLACEHOLDER_RADIUS = 12;

// Fluid-sim grid (96 × 54 cells over 1920 × 1080 logical pixels = 20px per cell)
export const GRID_W = 96;
export const GRID_H = 54;
export const CELL_SIZE = LOGICAL_WIDTH / GRID_W;

// Sim tunables — iterated to feel after user feedback.
export const REST_HEIGHT = 1.0;
export const REST_RATE = 0.6;
export const SPRING = 22;
export const DAMPING_RATE = 1.8;
export const HOLD_FORCE_BASE = 50;
// Pump softened: previously 1.2 saturated wide areas to foam on long holds.
export const HEIGHT_PUMP = 0.55;
// Cap below the foam stop (1.5) so the bay's full palette range stays visible
// during play — only brief peaks reach foam, not sustained holds.
export const HEIGHT_CAP = 1.32;
// Velocity magnitude cap. Without this, sustained holds let the velocity field
// accumulate unboundedly until the bay becomes a churn.
export const MAX_VELOCITY = 80;

// Receiver direct-attraction tunables — applied each frame during hold,
// in addition to flow-advection. Without this, sustained holds left
// receivers in low-velocity plateaus and they barely moved.
export const RECEIVER_DIRECT_PULL = 320;
export const RECEIVER_PULL_RADIUS_MULTIPLIER = 1.8;

// Five-stop water palette — height -> colour mapping. Per-phase tints keep
// the same five stops but shift the palette subtly so each lunar phase reads
// distinctly. Differences are within ±~10% per channel; deuteran/protan/
// tritan-friendly because the contrast envelope (deepest vs foam) stays
// constant.
//
// Stops + palettes must stay aligned in length (5) and matched by index.
export const WATER_STOPS: readonly number[] = [0.0, 0.6, 0.95, 1.15, 1.5];

interface RGB {
  r: number;
  g: number;
  b: number;
}

export const WATER_PALETTES: Record<LunarPhase, readonly RGB[]> = {
  // Waxing crescent: the canonical palette — cool, intimate, slightly cooler.
  'waxing-crescent': [
    { r: 0x0e, g: 0x17, b: 0x22 },
    { r: 0x1a, g: 0x26, b: 0x38 },
    { r: 0x2c, g: 0x3a, b: 0x55 },
    { r: 0x4d, g: 0x5c, b: 0x7a },
    { r: 0xa8, g: 0xb5, b: 0xcc },
  ],
  // Full moon: a touch warmer + brighter (the moon is closer / radiant).
  full: [
    { r: 0x12, g: 0x1b, b: 0x27 },
    { r: 0x21, g: 0x2c, b: 0x40 },
    { r: 0x35, g: 0x42, b: 0x5e },
    { r: 0x5a, g: 0x68, b: 0x86 },
    { r: 0xb6, g: 0xc1, b: 0xd5 },
  ],
  // Waning gibbous: silvered, slightly desaturated; the bay quieting.
  'waning-gibbous': [
    { r: 0x10, g: 0x1a, b: 0x23 },
    { r: 0x1d, g: 0x29, b: 0x3a },
    { r: 0x30, g: 0x3d, b: 0x58 },
    { r: 0x53, g: 0x60, b: 0x7d },
    { r: 0xae, g: 0xb8, b: 0xce },
  ],
  // Last quarter: compressed-toward-deep per N4 design memo; darkest of the four.
  'last-quarter': [
    { r: 0x0e, g: 0x17, b: 0x22 },
    { r: 0x17, g: 0x21, b: 0x32 },
    { r: 0x27, g: 0x33, b: 0x4d },
    { r: 0x46, g: 0x55, b: 0x6f },
    { r: 0xa8, g: 0xb5, b: 0xcc },
  ],
};

// Backwards-compat: default palette used until setPhase swaps it.
export const WATER_PALETTE: readonly RGB[] = WATER_PALETTES['waxing-crescent'];

// N3 closure-beat timings (cycle 5 P1 #7); MASTER_RESTORE_RAMP_S restores after a fade.
export const N3_FINAL_BELL_DELAY_MS = 1500;
export const N3_FADE_TO_SILENCE_DELAY_MS = 3500;
export const N3_FADE_TO_SILENCE_DURATION_S = 4;
export const MASTER_RESTORE_RAMP_S = 0.4;

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
