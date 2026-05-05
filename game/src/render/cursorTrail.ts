import { Container, Graphics } from 'pixi.js';

const TRAIL_LENGTH = 6;
const TRAIL_RADIUS = 4;
const TRAIL_COLOUR = 0xfff4d6;

export interface CursorTrail {
  container: Container;
  push(x: number, y: number): void;
  setEnabled(enabled: boolean): void;
}

export function createCursorTrail(): CursorTrail {
  const container = new Container();
  const dots: Graphics[] = [];

  for (let i = 0; i < TRAIL_LENGTH; i++) {
    const g = new Graphics().circle(0, 0, TRAIL_RADIUS).fill(TRAIL_COLOUR);
    g.alpha = 0;
    container.addChild(g);
    dots.push(g);
  }

  let writeIndex = 0;
  let enabled = true;

  const push = (x: number, y: number): void => {
    if (!enabled) return;
    const dot = dots[writeIndex];
    dot.position.set(x, y);
    dot.alpha = 0.35;
    writeIndex = (writeIndex + 1) % TRAIL_LENGTH;

    for (let i = 0; i < TRAIL_LENGTH; i++) {
      if (i === (writeIndex - 1 + TRAIL_LENGTH) % TRAIL_LENGTH) continue;
      dots[i].alpha *= 0.78;
    }
  };

  const setEnabled = (next: boolean): void => {
    enabled = next;
    if (!next) {
      for (const dot of dots) dot.alpha = 0;
    }
  };

  return { container, push, setEnabled };
}
