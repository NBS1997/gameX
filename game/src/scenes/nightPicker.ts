import { Container, Graphics } from 'pixi.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../config.ts';
import type { LunarPhase, NightNumber, ReceiverType } from '../level/types.ts';
import { makeCursorForPhase } from '../render/cursor.ts';
import type { MetaState } from '../state/meta.ts';

const ACTIVE_ALPHA = 1.0;
const INACTIVE_ALPHA = 0.25;
const SLOT_SPACING = 360;
const HOVER_SCALE = 1.1;

const PICKER_GHOST_COLOUR = 0xa8b5cc;
const PICKER_GHOST_ALPHA = 0.35;
const PICKER_GHOST_SCALE = 0.18;
const PICKER_GHOST_BOAT_RX = 28 * PICKER_GHOST_SCALE * 1.6;
const PICKER_GHOST_BOAT_RY = 12 * PICKER_GHOST_SCALE * 1.6;
const PICKER_GHOST_LANTERN_R = 10 * PICKER_GHOST_SCALE * 1.8;

const NIGHT_PHASES: Record<NightNumber, LunarPhase> = {
  1: 'waxing-crescent',
  2: 'full',
  3: 'waning-gibbous',
  4: 'last-quarter',
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

  const slots: { container: Container; night: NightNumber; ghostContainer: Container }[] = [];

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

  const setMeta = (meta: MetaState): void => {
    const ghostsByNight = collectGhostsByNight(meta);
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

      slot.ghostContainer.removeChildren();
      const ghosts = ghostsByNight.get(slot.night) ?? [];
      for (const ghost of ghosts) {
        const px = (ghost.x - LOGICAL_WIDTH / 2) * PICKER_GHOST_SCALE;
        const py = (ghost.y - LOGICAL_HEIGHT / 2) * PICKER_GHOST_SCALE;
        const g = new Graphics();
        if (ghost.type === 'boat') {
          g.ellipse(0, 0, PICKER_GHOST_BOAT_RX, PICKER_GHOST_BOAT_RY)
            .stroke({ width: 1, color: PICKER_GHOST_COLOUR, alpha: PICKER_GHOST_ALPHA });
        } else {
          g.circle(0, 0, PICKER_GHOST_LANTERN_R)
            .stroke({ width: 1, color: PICKER_GHOST_COLOUR, alpha: PICKER_GHOST_ALPHA });
        }
        g.position.set(px, py);
        slot.ghostContainer.addChild(g);
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
  if (night === 3) return meta.completedNights.has(2);
  return meta.completedNights.has(3);
}

function collectGhostsByNight(
  meta: MetaState,
): Map<NightNumber, { type: ReceiverType; x: number; y: number }[]> {
  const out = new Map<NightNumber, { type: ReceiverType; x: number; y: number }[]>();
  for (const [night, receivers] of meta.sessionGhosts) {
    const list: { type: ReceiverType; x: number; y: number }[] = [];
    for (const r of receivers) {
      if (r.sent) continue;
      list.push({ type: r.type, x: r.position.x, y: r.position.y });
    }
    out.set(night, list);
  }
  for (const g of meta.persistedGhosts) {
    if (meta.sessionGhosts.has(g.night)) continue;
    let list = out.get(g.night);
    if (list === undefined) {
      list = [];
      out.set(g.night, list);
    }
    list.push({ type: g.type, x: g.x, y: g.y });
  }
  return out;
}
