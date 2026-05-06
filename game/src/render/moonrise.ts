import type { Container } from 'pixi.js';
import { prefersReducedMotion } from '../a11y/reduceMotion.ts';

const FIRST_LAUNCH_DURATION_MS = 8000;
const RETURN_LAUNCH_DURATION_MS = 1800;
const Y_OFFSET = 220;

type Phase = 'idle' | 'rising';

export interface Moonrise {
  start(firstLaunch: boolean): void;
  update(dt: number, worldLayer: Container, cursorAlpha: { value: number }): void;
  skip(): void;
  isActive(): boolean;
}

export function createMoonrise(): Moonrise {
  let phase: Phase = 'idle';
  let elapsedMs = 0;
  let durationMs = RETURN_LAUNCH_DURATION_MS;

  const start = (firstLaunch: boolean): void => {
    phase = 'rising';
    elapsedMs = 0;
    durationMs = firstLaunch ? FIRST_LAUNCH_DURATION_MS : RETURN_LAUNCH_DURATION_MS;
  };

  const update = (
    dt: number,
    worldLayer: Container,
    cursorAlpha: { value: number },
  ): void => {
    if (phase !== 'rising') return;
    // Reduce-motion swap (motion bible §reduce-motion swap rules): instant cut, no camera lift.
    if (prefersReducedMotion()) {
      worldLayer.position.y = worldLayerBaseY(worldLayer);
      cursorAlpha.value = 1;
      phase = 'idle';
      elapsedMs = durationMs;
      return;
    }
    elapsedMs += dt * 1000;
    const t = Math.min(1, elapsedMs / durationMs);
    const eased = 1 - Math.pow(1 - t, 3);

    worldLayer.position.y = (1 - eased) * Y_OFFSET + worldLayerBaseY(worldLayer);
    cursorAlpha.value = eased;

    if (elapsedMs >= durationMs) {
      phase = 'idle';
      worldLayer.position.y = worldLayerBaseY(worldLayer);
      cursorAlpha.value = 1;
    }
  };

  const skip = (): void => {
    if (phase !== 'rising') return;
    elapsedMs = durationMs;
  };

  const isActive = (): boolean => phase === 'rising';

  return { start, update, skip, isActive };
}

function worldLayerBaseY(worldLayer: Container): number {
  // worldLayer was set to position.y = LOGICAL_HEIGHT / 2 at boot (centred pivot).
  // Read whatever the centred-pivot baseline is from the runtime.
  const stored = (worldLayer as { __baseY?: number }).__baseY;
  return stored ?? worldLayer.position.y;
}

export function rememberWorldLayerBaseY(worldLayer: Container): void {
  (worldLayer as { __baseY?: number }).__baseY = worldLayer.position.y;
}
