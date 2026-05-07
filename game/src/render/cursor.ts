import { Container, Graphics } from 'pixi.js';
import type { LunarPhase } from '../level/types.ts';

const WAXING_FILL = 0xfff4d6;
const FULL_FILL = 0xfffcec;
const FULL_HALO = 0xffe9bc;
const WANING_FILL = 0xe9e1d0;
const WANING_SHADOW = 0x3a3636;
const LAST_QUARTER_FILL = 0xe7ddc8;
const LAST_QUARTER_SHADOW = 0x2c2a26;
const RING_COLOUR = 0xa8b5cc;

const PULL_RADII: Record<LunarPhase, number> = {
  'waxing-crescent': 80,
  full: 140,
  'waning-gibbous': 110,
  'last-quarter': 95,
};

export interface MoonCursor {
  container: Container;
  setHoldStrength(t: number): void;
  setRingAlphaBoost(boost: number): void;
}

export function makeCursorForPhase(phase: LunarPhase): MoonCursor {
  const container = new Container();
  const pullRadius = PULL_RADII[phase];

  const ring = new Graphics()
    .circle(0, 0, pullRadius)
    .stroke({ width: 1, color: RING_COLOUR, alpha: 0.18 });
  container.addChild(ring);

  const disc = new Graphics();
  switch (phase) {
    case 'waxing-crescent':
      disc.circle(0, 0, 24).fill(WAXING_FILL);
      break;
    case 'full':
      disc.circle(0, 0, 38).fill({ color: FULL_HALO, alpha: 0.4 });
      disc.circle(0, 0, 32).fill(FULL_FILL);
      break;
    case 'waning-gibbous':
      disc.circle(0, 0, 28).fill(WANING_FILL);
      disc.circle(8, 0, 22).fill({ color: WANING_SHADOW, alpha: 0.55 });
      break;
    case 'last-quarter':
      disc.circle(0, 0, 26).fill(LAST_QUARTER_FILL);
      disc.circle(-8, 0, 22).fill({ color: LAST_QUARTER_SHADOW, alpha: 0.55 });
      break;
  }
  container.addChild(disc);

  let ringBoost = 0;

  const setHoldStrength = (t: number): void => {
    const clamped = Math.max(0, Math.min(1, t));
    ring.alpha = 0.18 + 0.45 * clamped + ringBoost;
    disc.scale.set(1 + 0.06 * clamped);
  };

  const setRingAlphaBoost = (boost: number): void => {
    ringBoost = boost;
  };

  return { container, setHoldStrength, setRingAlphaBoost };
}
