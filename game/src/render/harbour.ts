import { Container, Graphics } from 'pixi.js';
import type { GameState } from '../state/gameState.ts';

const HARBOUR_RIM = 0x4d5c7a;
const HARBOUR_GLOW = 0xa8b5cc;
const HARBOUR_COMPLETE = 0xfff4d6;
const PULSE_HZ = 0.6;
const PULSE_DEPTH = 0.18;

export interface HarbourRenderer {
  container: Container;
  sync(state: GameState): void;
  update(dt: number, state: GameState): void;
}

export function createHarbourRenderer(state: GameState): HarbourRenderer {
  const container = new Container();
  const ring = new Graphics();
  container.addChild(ring);

  if (state.level.night.goal.kind === 'guide') {
    const goal = state.level.night.goal;
    ring.position.set(goal.target.x, goal.target.y);
  } else {
    container.visible = false;
  }

  let pulsePhase = 0;
  let baseAlpha = 0.4;
  let highlight = false;
  let complete = false;

  drawRing(ring, state, false);

  const sync = (s: GameState): void => {
    if (s.level.night.goal.kind !== 'guide') return;
    if (s.goalProgress.kind !== 'guide') return;
    highlight = s.goalProgress.inHarbourMs > 0;
    complete = s.goalProgress.complete;
    baseAlpha = complete ? 0.9 : highlight ? 0.7 : 0.4;
    drawRing(ring, s, highlight || complete);
  };

  const update = (dt: number, s: GameState): void => {
    if (s.level.night.goal.kind !== 'guide') return;
    pulsePhase += dt;
    if (complete) {
      ring.alpha = baseAlpha;
      return;
    }
    if (highlight) {
      ring.alpha = baseAlpha;
      return;
    }
    const pulse = Math.sin(pulsePhase * 2 * Math.PI * PULSE_HZ);
    ring.alpha = baseAlpha + PULSE_DEPTH * pulse;
  };

  return { container, sync, update };
}

function drawRing(graphic: Graphics, state: GameState, highlight: boolean): void {
  if (state.level.night.goal.kind !== 'guide') return;
  if (state.goalProgress.kind !== 'guide') return;

  const goal = state.level.night.goal;
  const progress = state.goalProgress;
  graphic.clear();

  const colour = progress.complete
    ? HARBOUR_COMPLETE
    : highlight
      ? HARBOUR_GLOW
      : HARBOUR_RIM;

  graphic.circle(0, 0, goal.target.radius).stroke({ width: 4, color: colour });
}
