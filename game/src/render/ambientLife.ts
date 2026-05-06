import { Container, Graphics } from 'pixi.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../config.ts';

const GULL_COUNT = 3;
const RIPPLE_INTERVAL_MS_MIN = 4000;
const RIPPLE_INTERVAL_MS_MAX = 9000;
const GULL_BASE_SPEED = 26;
const GULL_COLOUR = 0xc9d4e5;

interface Gull {
  container: Container;
  shape: Graphics;
  x: number;
  y: number;
  baseY: number;
  speed: number;
  bobSeed: number;
  flapPhase: number;
  scale: number;
}

interface Ripple {
  graphic: Graphics;
  ageMs: number;
  durationMs: number;
  x: number;
  y: number;
  maxRadius: number;
}

export interface AmbientLife {
  container: Container;
  update(dt: number): void;
}

export function createAmbientLife(): AmbientLife {
  const container = new Container();
  const gullLayer = new Container();
  const rippleLayer = new Container();
  container.addChild(rippleLayer);
  container.addChild(gullLayer);

  const gulls: Gull[] = [];
  for (let i = 0; i < GULL_COUNT; i++) {
    const g = makeGull(i);
    gulls.push(g);
    gullLayer.addChild(g.container);
  }

  const ripples: Ripple[] = [];
  let nextRippleAtMs = randomBetween(
    RIPPLE_INTERVAL_MS_MIN,
    RIPPLE_INTERVAL_MS_MAX,
  );
  let elapsedMs = 0;

  const update = (dt: number): void => {
    elapsedMs += dt * 1000;

    for (const gull of gulls) {
      gull.x += gull.speed * dt;
      gull.flapPhase += dt * 4.5;
      const flap = Math.sin(gull.flapPhase) * 0.35;
      gull.shape.rotation = flap * 0.15;
      gull.y = gull.baseY + Math.sin(gull.flapPhase * 0.4 + gull.bobSeed) * 6;
      gull.container.position.set(gull.x, gull.y);

      if (gull.x > LOGICAL_WIDTH + 80) {
        respawnGull(gull, true);
      } else if (gull.x < -80) {
        respawnGull(gull, false);
      }
    }

    if (elapsedMs >= nextRippleAtMs) {
      const r = makeRipple();
      ripples.push(r);
      rippleLayer.addChild(r.graphic);
      nextRippleAtMs =
        elapsedMs +
        randomBetween(RIPPLE_INTERVAL_MS_MIN, RIPPLE_INTERVAL_MS_MAX);
    }

    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.ageMs += dt * 1000;
      const t = Math.min(1, r.ageMs / r.durationMs);
      const radius = r.maxRadius * t;
      const alpha = 0.35 * (1 - t);
      r.graphic.clear();
      r.graphic
        .circle(r.x, r.y, radius)
        .stroke({ width: 1.5, color: 0xa8b5cc, alpha });
      if (t >= 1) {
        rippleLayer.removeChild(r.graphic);
        ripples.splice(i, 1);
      }
    }
  };

  return { container, update };
}

function makeGull(idx: number): Gull {
  const c = new Container();
  const shape = new Graphics();
  drawGull(shape);
  c.addChild(shape);

  const baseY = 80 + idx * 70 + Math.random() * 60;
  const direction = Math.random() < 0.5 ? 1 : -1;
  const x =
    direction > 0
      ? -80 - Math.random() * 400
      : LOGICAL_WIDTH + 80 + Math.random() * 400;
  const speed = (GULL_BASE_SPEED + Math.random() * 18) * direction;
  const scale = 0.85 + Math.random() * 0.3;
  shape.scale.set(scale * direction, scale);

  c.position.set(x, baseY);

  return {
    container: c,
    shape,
    x,
    y: baseY,
    baseY,
    speed,
    bobSeed: Math.random() * Math.PI * 2,
    flapPhase: Math.random() * Math.PI * 2,
    scale,
  };
}

function respawnGull(gull: Gull, fromLeft: boolean): void {
  gull.baseY = 80 + Math.random() * 220;
  if (fromLeft) {
    gull.x = -80 - Math.random() * 200;
    gull.speed = Math.abs(gull.speed);
  } else {
    gull.x = LOGICAL_WIDTH + 80 + Math.random() * 200;
    gull.speed = -Math.abs(gull.speed);
  }
  const direction = gull.speed > 0 ? 1 : -1;
  gull.shape.scale.set(gull.scale * direction, gull.scale);
}

function drawGull(g: Graphics): void {
  // Soft V-shape: two short strokes meeting at a peak. Tiny.
  g.moveTo(-7, 2)
    .lineTo(0, -3)
    .lineTo(7, 2)
    .stroke({ width: 1.6, color: GULL_COLOUR, alpha: 0.65 });
}

function makeRipple(): Ripple {
  return {
    graphic: new Graphics(),
    ageMs: 0,
    durationMs: 1800,
    x: 200 + Math.random() * (LOGICAL_WIDTH - 400),
    y: 200 + Math.random() * (LOGICAL_HEIGHT - 400),
    maxRadius: 24 + Math.random() * 20,
  };
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
