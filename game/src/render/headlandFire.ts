import { Container, Graphics } from 'pixi.js';
import { prefersReducedMotion } from '../a11y/reduceMotion.ts';
import type { Vec2 } from '../level/types.ts';

const FIRE_RADIUS = 14;
const FIRE_FILL = 0xff8a4a;
const FIRE_HALO_FILL = 0xffd966;
const IDLE_PULSE_HZ = 1.2;
const IDLE_PULSE_DEPTH = 0.15;
const IDLE_BASE_ALPHA = 0.45;
const IGNITED_ALPHA = 0.95;
const IGNITION_TWEEN_MS = 200;
const IGNITION_SCALE_FROM = 1.0;
const IGNITION_SCALE_TO = 1.4;

export interface HeadlandFire {
  container: Container;
  setPosition(pos: Vec2): void;
  reset(): void;
  setIgnited(): void;
  update(dt: number): void;
  isIgnited(): boolean;
}

export function createHeadlandFire(): HeadlandFire {
  const container = new Container();
  const graphics = new Graphics();
  container.addChild(graphics);

  let phase: 'idle' | 'igniting' | 'ignited' = 'idle';
  let pulsePhase = 0;
  let igniteElapsedMs = 0;

  const draw = (alpha: number, scale: number): void => {
    graphics.clear();
    graphics.circle(0, 0, FIRE_RADIUS * 1.8).fill({ color: FIRE_HALO_FILL, alpha: alpha * 0.4 });
    graphics.circle(0, 0, FIRE_RADIUS).fill({ color: FIRE_FILL, alpha });
    container.scale.set(scale);
  };

  const setPosition = (pos: Vec2): void => {
    container.position.set(pos.x, pos.y);
  };

  const reset = (): void => {
    phase = 'idle';
    pulsePhase = 0;
    igniteElapsedMs = 0;
    draw(IDLE_BASE_ALPHA, 1.0);
  };

  const setIgnited = (): void => {
    // No transitions back — strict idle → igniting → ignited state machine.
    if (phase === 'igniting' || phase === 'ignited') return;
    phase = 'igniting';
    igniteElapsedMs = 0;
  };

  const update = (dt: number): void => {
    const reduced = prefersReducedMotion();

    if (reduced) {
      if (phase === 'idle') {
        draw(IDLE_BASE_ALPHA, 1.0);
      } else if (phase === 'igniting') {
        phase = 'ignited';
        draw(IGNITED_ALPHA, IGNITION_SCALE_TO);
      } else {
        draw(IGNITED_ALPHA, IGNITION_SCALE_TO);
      }
      return;
    }

    if (phase === 'idle') {
      pulsePhase += dt;
      const alpha = IDLE_BASE_ALPHA + IDLE_PULSE_DEPTH * Math.sin(pulsePhase * 2 * Math.PI * IDLE_PULSE_HZ);
      draw(alpha, 1.0);
    } else if (phase === 'igniting') {
      igniteElapsedMs += dt * 1000;
      const t = Math.min(1, igniteElapsedMs / IGNITION_TWEEN_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      const currentIdleAlpha = IDLE_BASE_ALPHA + IDLE_PULSE_DEPTH * Math.sin(pulsePhase * 2 * Math.PI * IDLE_PULSE_HZ);
      const alpha = currentIdleAlpha + (IGNITED_ALPHA - currentIdleAlpha) * eased;
      const scale = IGNITION_SCALE_FROM + (IGNITION_SCALE_TO - IGNITION_SCALE_FROM) * eased;
      draw(alpha, scale);
      if (t >= 1) {
        phase = 'ignited';
      }
    } else {
      draw(IGNITED_ALPHA, IGNITION_SCALE_TO);
    }
  };

  const isIgnited = (): boolean => phase === 'igniting' || phase === 'ignited';

  draw(IDLE_BASE_ALPHA, 1.0);

  return { container, setPosition, reset, setIgnited, update, isIgnited };
}
