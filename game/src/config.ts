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

// Sim tunables — initial day-3 spike values; iterate to feel.
export const REST_HEIGHT = 1.0;
export const REST_RATE = 0.4;
export const SPRING = 30;
export const DAMPING_RATE = 1.5;
export const HOLD_FORCE_BASE = 60;
export const HEIGHT_PUMP = 1.2;

// Five-stop water palette — height -> colour mapping.
// Stops + palette must stay aligned in length and matched in index.
export const WATER_STOPS: readonly number[] = [0.0, 0.6, 0.95, 1.15, 1.5];
export const WATER_PALETTE: readonly { r: number; g: number; b: number }[] = [
  { r: 0x0e, g: 0x17, b: 0x22 },
  { r: 0x1a, g: 0x26, b: 0x38 },
  { r: 0x2c, g: 0x3a, b: 0x55 },
  { r: 0x4d, g: 0x5c, b: 0x7a },
  { r: 0xa8, g: 0xb5, b: 0xcc },
];
