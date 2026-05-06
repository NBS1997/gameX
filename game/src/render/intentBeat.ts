import { Container, Graphics } from 'pixi.js';
import { prefersReducedMotion } from '../a11y/reduceMotion.ts';
import type { LevelDef, NightNumber } from '../level/types.ts';

const N1_DURATION_MS = 1500;
const N2_DURATION_MS = 600;
const N3_DURATION_MS = 800;
const REDUCE_MOTION_DURATION_MS = 200;
const RING_COLOUR = 0xa8b5cc;

export interface IntentBeat {
  container: Container;
  start(night: NightNumber, level: LevelDef): void;
  update(dt: number): void;
  skip(): void;
  isActive(): boolean;
}

export function createIntentBeat(): IntentBeat {
  const container = new Container();
  const ring = new Graphics();
  container.addChild(ring);
  container.visible = false;

  const seenSet = new Set<NightNumber>();
  let phase: 'idle' | 'playing' = 'idle';
  let elapsedMs = 0;
  let durationMs = 0;
  let nightKind: NightNumber = 1;
  let centroid = { x: 960, y: 540 };
  let reduced = false;

  const finish = (): void => {
    phase = 'idle';
    container.visible = false;
    ring.clear();
  };

  const start = (night: NightNumber, level: LevelDef): void => {
    if (seenSet.has(night)) {
      phase = 'idle';
      container.visible = false;
      return;
    }
    seenSet.add(night);
    nightKind = night;
    reduced = prefersReducedMotion();
    elapsedMs = 0;
    phase = 'playing';
    ring.clear();

    if (night === 1) {
      container.visible = false;
      durationMs = N1_DURATION_MS;
      return;
    }

    if (night === 2) {
      const lanterns = level.night.spawns.filter((s) => s.type === 'lantern');
      if (lanterns.length > 0) {
        const sumX = lanterns.reduce((acc, s) => acc + s.position.x, 0);
        const sumY = lanterns.reduce((acc, s) => acc + s.position.y, 0);
        centroid = { x: sumX / lanterns.length, y: sumY / lanterns.length };
      } else {
        centroid = { x: 960, y: 540 };
      }
      durationMs = reduced ? REDUCE_MOTION_DURATION_MS : N2_DURATION_MS;
      container.visible = true;
      return;
    }

    // night === 3
    centroid = { x: 1920, y: 540 };
    durationMs = reduced ? REDUCE_MOTION_DURATION_MS : N3_DURATION_MS;
    container.visible = true;
  };

  const update = (dt: number): void => {
    if (phase !== 'playing') return;
    elapsedMs += dt * 1000;
    const t = Math.min(1, elapsedMs / durationMs);

    if (nightKind === 1) {
      if (elapsedMs >= durationMs) finish();
      return;
    }

    if (nightKind === 2) {
      if (reduced) {
        if (elapsedMs <= dt * 1000 + 1) {
          ring.clear();
          ring.circle(0, 0, 90).stroke({ width: 4, color: RING_COLOUR });
          ring.position.set(centroid.x, centroid.y);
          ring.alpha = 0.35;
        }
      } else {
        const triangle = 1 - Math.abs(2 * t - 1);
        const scale = 1 + 0.15 * triangle;
        const alpha = 0.35 * triangle;
        ring.clear();
        ring.circle(0, 0, 90).stroke({ width: 4, color: RING_COLOUR });
        ring.position.set(centroid.x, centroid.y);
        ring.scale.set(scale);
        ring.alpha = alpha;
      }
      if (elapsedMs >= durationMs) finish();
      return;
    }

    // nightKind === 3
    if (reduced) {
      if (elapsedMs <= dt * 1000 + 1) {
        ring.clear();
        ring.circle(0, 0, 100).stroke({ width: 4, color: RING_COLOUR });
        ring.position.set(1920, 540);
        ring.alpha = 0.4;
      }
    } else {
      ring.clear();
      ring.circle(0, 0, 200 * t).stroke({ width: 4, color: RING_COLOUR });
      ring.position.set(1920, 540);
      ring.alpha = 0.4 * (1 - t);
    }
    if (elapsedMs >= durationMs) finish();
  };

  const skip = (): void => {
    if (phase === 'playing') finish();
  };

  const isActive = (): boolean => phase === 'playing';

  return { container, start, update, skip, isActive };
}
