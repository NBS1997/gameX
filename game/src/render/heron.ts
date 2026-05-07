import { Container, Graphics } from 'pixi.js';
import { WITHHOLD_PRE_LIFT_DWELL, WITHHOLD_RECOIL_COOLDOWN_MS } from '../config.ts';
import { prefersReducedMotion } from '../a11y/reduceMotion.ts';
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
    container.scale.set(1);
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
