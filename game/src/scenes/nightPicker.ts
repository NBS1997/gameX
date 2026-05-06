import { Container } from 'pixi.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../config.ts';
import type { LunarPhase, NightNumber } from '../level/types.ts';
import { makeCursorForPhase } from '../render/cursor.ts';
import type { MetaState } from '../state/meta.ts';

const ACTIVE_ALPHA = 1.0;
const INACTIVE_ALPHA = 0.25;
const SLOT_SPACING = 360;
const HOVER_SCALE = 1.1;

const NIGHT_PHASES: Record<NightNumber, LunarPhase> = {
  1: 'waxing-crescent',
  2: 'full',
  3: 'waning-gibbous',
};

export interface NightPicker {
  container: Container;
  setMeta(meta: MetaState): void;
  setVisible(visible: boolean): void;
}

export function createNightPicker(
  onSelect: (night: NightNumber) => void,
): NightPicker {
  const container = new Container();
  container.position.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);

  const slots: { container: Container; night: NightNumber }[] = [];

  ([1, 2, 3] as NightNumber[]).forEach((night, idx) => {
    const slot = new Container();
    slot.position.set((idx - 1) * SLOT_SPACING, 0);
    slot.pivot.set(0, 0);
    const glyph = makeCursorForPhase(NIGHT_PHASES[night]);
    slot.addChild(glyph.container);
    container.addChild(slot);
    slots.push({ container: slot, night });
  });

  const setMeta = (meta: MetaState): void => {
    for (const slot of slots) {
      const isSelectable = isNightSelectable(slot.night, meta);
      slot.container.alpha = isSelectable ? ACTIVE_ALPHA : INACTIVE_ALPHA;
      slot.container.eventMode = isSelectable ? 'static' : 'none';
      slot.container.cursor = isSelectable ? 'pointer' : 'default';
      slot.container.scale.set(1);
      slot.container.removeAllListeners();
      if (isSelectable) {
        slot.container.on('pointertap', () => onSelect(slot.night));
        slot.container.on('pointerover', () => slot.container.scale.set(HOVER_SCALE));
        slot.container.on('pointerout', () => slot.container.scale.set(1));
      }
    }
  };

  const setVisible = (visible: boolean): void => {
    container.visible = visible;
    container.eventMode = visible ? 'passive' : 'none';
  };

  return { container, setMeta, setVisible };
}

function isNightSelectable(night: NightNumber, meta: MetaState): boolean {
  if (meta.freeReentry) return true;
  if (meta.completedNights.has(night)) return false;
  if (night === 1) return true;
  if (night === 2) return meta.completedNights.has(1);
  return meta.completedNights.has(2);
}
