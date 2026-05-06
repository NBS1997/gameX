import { Container, Graphics } from 'pixi.js';
import type { ReceiverInstance } from '../state/gameState.ts';

const BOAT_FILL = 0x8b6f47;
const BOAT_RIM = 0xd6b88a;
const LANTERN_FILL = 0xfff4d6;
const LANTERN_HALO = 0xffae5a;

const SENT_FADE_MS = 600;

interface EntityVisual {
  container: Container;
  body: Graphics;
  glow?: Graphics;
  bobSeed: number;
  type: 'boat' | 'lantern';
  fadingMs: number | null;
}

export interface EntityRenderer {
  container: Container;
  sync(receivers: readonly ReceiverInstance[]): void;
  update(dt: number): void;
}

export function createEntityRenderer(
  initial: readonly ReceiverInstance[],
): EntityRenderer {
  const container = new Container();
  const visuals = new Map<string, EntityVisual>();

  initial.forEach((receiver, idx) => {
    const visual = makeVisual(receiver, idx);
    visual.container.position.set(receiver.position.x, receiver.position.y);
    visuals.set(receiver.id, visual);
    container.addChild(visual.container);
  });

  let elapsed = 0;
  let positions = new Map<string, { x: number; y: number }>();
  let sentFlags = new Map<string, boolean>();

  const sync = (receivers: readonly ReceiverInstance[]): void => {
    positions = new Map(
      receivers.map((r) => [r.id, { x: r.position.x, y: r.position.y }]),
    );
    sentFlags = new Map(receivers.map((r) => [r.id, r.sent]));
  };

  const update = (dt: number): void => {
    elapsed += dt;
    for (const [id, pos] of positions) {
      const visual = visuals.get(id);
      if (!visual) continue;

      const sent = sentFlags.get(id) ?? false;
      if (sent && visual.fadingMs === null) {
        visual.fadingMs = 0;
      }

      if (visual.fadingMs !== null) {
        visual.fadingMs += dt * 1000;
        const t = Math.min(1, visual.fadingMs / SENT_FADE_MS);
        visual.container.alpha = 1 - t;
        if (t >= 1) {
          visual.container.visible = false;
        }
        // Continue moving with momentum until faded out.
        visual.container.position.set(pos.x, pos.y);
        continue;
      }

      const bobY = Math.sin(elapsed * 1.4 + visual.bobSeed) * 1.6;
      visual.container.position.set(pos.x, pos.y + bobY);
      if (visual.type === 'boat') {
        visual.body.rotation = Math.sin(elapsed * 1.0 + visual.bobSeed) * 0.04;
      } else if (visual.type === 'lantern' && visual.glow) {
        const pulse = 0.5 + 0.5 * Math.sin(elapsed * 1.6 + visual.bobSeed);
        visual.glow.alpha = 0.45 + 0.35 * pulse;
      }
    }
  };

  return { container, sync, update };
}

function makeVisual(receiver: ReceiverInstance, idx: number): EntityVisual {
  const c = new Container();
  const body = new Graphics();
  let glow: Graphics | undefined;

  switch (receiver.type) {
    case 'boat':
      body
        .ellipse(0, 0, 28, 12)
        .fill(BOAT_FILL)
        .stroke({ width: 2, color: BOAT_RIM });
      c.addChild(body);
      break;
    case 'lantern': {
      glow = new Graphics().circle(0, 0, 14).fill(LANTERN_HALO);
      glow.alpha = 0.5;
      c.addChild(glow);
      body.circle(0, 0, 8).fill(LANTERN_HALO).circle(0, 0, 5).fill(LANTERN_FILL);
      c.addChild(body);
      break;
    }
  }

  return {
    container: c,
    body,
    glow,
    bobSeed: idx * 0.7,
    type: receiver.type,
    fadingMs: null,
  };
}
