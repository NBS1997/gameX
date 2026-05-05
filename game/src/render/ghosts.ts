import { Container, Graphics } from 'pixi.js';
import type { ReceiverInstance } from '../state/gameState.ts';

const GHOST_ALPHA = 0.35;
const BOAT_FILL = 0x8b6f47;
const BOAT_RIM = 0xd6b88a;
const LANTERN_FILL = 0xfff4d6;
const LANTERN_HALO = 0xffae5a;

export function renderGhosts(ghosts: readonly ReceiverInstance[]): Container {
  const container = new Container();
  container.alpha = GHOST_ALPHA;

  for (const r of ghosts) {
    const g = new Graphics();
    switch (r.type) {
      case 'boat':
        g.ellipse(0, 0, 28, 12)
          .fill(BOAT_FILL)
          .stroke({ width: 2, color: BOAT_RIM });
        break;
      case 'lantern':
        g.circle(0, 0, 10).fill(LANTERN_HALO).circle(0, 0, 6).fill(LANTERN_FILL);
        break;
    }
    g.position.set(r.position.x, r.position.y);
    container.addChild(g);
  }

  return container;
}
