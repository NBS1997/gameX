import bayBaseJson from '../../levels/bay.base.json' with { type: 'json' };
import night1Json from '../../levels/night-1.delta.json' with { type: 'json' };
import night2Json from '../../levels/night-2.delta.json' with { type: 'json' };
import night3Json from '../../levels/night-3.delta.json' with { type: 'json' };
import night4Json from '../../levels/night-4.delta.json' with { type: 'json' };
import type { BayBase, LevelDef, NightDelta, NightNumber } from './types.ts';

const bayBase = bayBaseJson as BayBase;
const nights: Record<NightNumber, NightDelta> = {
  1: night1Json as NightDelta,
  2: night2Json as NightDelta,
  3: night3Json as NightDelta,
  4: night4Json as NightDelta,
};

export function loadLevel(nightNumber: NightNumber): LevelDef {
  return { base: bayBase, night: nights[nightNumber] };
}
