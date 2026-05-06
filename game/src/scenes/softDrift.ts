import type { Container } from 'pixi.js';
import { prefersReducedMotion } from '../a11y/reduceMotion.ts';
import {
  recoverFromSoftDrift,
  type GameState,
} from '../state/gameState.ts';

const DRIFT_DURATION_MS = 1200;
const DRIFT_TARGET_SCALE = 0.9;
const DRIFT_TARGET_CURSOR_ALPHA = 0.6;
const RECOVER_SCALE_RATE = 2;
const RECOVER_ALPHA_RATE = 5;

export function updateSoftDrift(
  state: GameState,
  worldLayer: Container,
  dt: number,
): void {
  const drift = state.softDrift;
  const reduced = prefersReducedMotion();

  if (drift.active) {
    drift.elapsedMs = Math.min(drift.elapsedMs + dt * 1000, DRIFT_DURATION_MS);
    const t = drift.elapsedMs / DRIFT_DURATION_MS;
    drift.cameraScale = reduced
      ? 1
      : 1 - (1 - DRIFT_TARGET_SCALE) * t;
    drift.cursorAlpha = 1 - (1 - DRIFT_TARGET_CURSOR_ALPHA) * t;
  } else {
    if (drift.cameraScale < 1) {
      drift.cameraScale = Math.min(
        1,
        drift.cameraScale + RECOVER_SCALE_RATE * dt,
      );
    }
    if (drift.cursorAlpha < 1) {
      drift.cursorAlpha = Math.min(
        1,
        drift.cursorAlpha + RECOVER_ALPHA_RATE * dt,
      );
    }
  }

  worldLayer.scale.set(drift.cameraScale);
}

export function tryRecoverOnPressEdge(
  state: GameState,
  pressEdge: boolean,
): void {
  if (state.softDrift.active && pressEdge) {
    recoverFromSoftDrift(state);
  }
}
