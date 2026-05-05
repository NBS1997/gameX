import { Graphics } from 'pixi.js';
import type { LunarPhase } from '../level/types.ts';

const WAXING_FILL = 0xfff4d6;
const FULL_FILL = 0xfffcec;
const FULL_HALO = 0xffe9bc;
const WANING_FILL = 0xe9e1d0;
const WANING_SHADOW = 0x3a3636;

export function makeCursorForPhase(phase: LunarPhase): Graphics {
  const g = new Graphics();
  switch (phase) {
    case 'waxing-crescent':
      g.circle(0, 0, 24).fill(WAXING_FILL);
      break;
    case 'full':
      g.circle(0, 0, 38).fill({ color: FULL_HALO, alpha: 0.4 });
      g.circle(0, 0, 32).fill(FULL_FILL);
      break;
    case 'waning-gibbous':
      g.circle(0, 0, 28).fill(WANING_FILL);
      g.circle(8, 0, 22).fill({ color: WANING_SHADOW, alpha: 0.55 });
      break;
  }
  return g;
}
