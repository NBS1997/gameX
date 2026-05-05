import { Container, Graphics } from 'pixi.js';
import type { ReceiverInstance } from '../state/gameState.ts';

const BOAT_FILL = 0x8b6f47;
const BOAT_RIM = 0xd6b88a;
const LANTERN_FILL = 0xfff4d6;
const LANTERN_HALO = 0xffae5a;

export interface EntityRenderer {
  container: Container;
  sync(receivers: readonly ReceiverInstance[]): void;
}

export function createEntityRenderer(
  initial: readonly ReceiverInstance[],
): EntityRenderer {
  const container = new Container();
  const graphics = new Map<string, Graphics>();

  for (const receiver of initial) {
    const g = makeReceiverGraphic(receiver);
    g.position.set(receiver.position.x, receiver.position.y);
    graphics.set(receiver.id, g);
    container.addChild(g);
  }

  const sync = (receivers: readonly ReceiverInstance[]): void => {
    for (const receiver of receivers) {
      const g = graphics.get(receiver.id);
      if (g) {
        g.position.set(receiver.position.x, receiver.position.y);
      }
    }
  };

  return { container, sync };
}

function makeReceiverGraphic(receiver: ReceiverInstance): Graphics {
  const g = new Graphics();
  switch (receiver.type) {
    case 'boat':
      g.ellipse(0, 0, 28, 12)
        .fill(BOAT_FILL)
        .stroke({ width: 2, color: BOAT_RIM });
      break;
    case 'lantern':
      g.circle(0, 0, 10).fill(LANTERN_HALO).circle(0, 0, 6).fill(LANTERN_FILL);
      break;
  }
  return g;
}
