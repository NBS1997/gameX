import { Container, Graphics } from 'pixi.js';
import type { LevelDef, SpawnDef } from '../level/types.ts';

const BOAT_FILL = 0x8b6f47;
const BOAT_RIM = 0xd6b88a;
const LANTERN_FILL = 0xfff4d6;
const LANTERN_HALO = 0xffae5a;

export function renderEntities(level: LevelDef): Container {
  const container = new Container();
  for (const spawn of level.night.spawns) {
    container.addChild(renderSpawn(spawn));
  }
  return container;
}

function renderSpawn(spawn: SpawnDef): Graphics {
  const g = new Graphics();
  switch (spawn.type) {
    case 'boat':
      g.ellipse(0, 0, 28, 12).fill(BOAT_FILL).stroke({ width: 2, color: BOAT_RIM });
      break;
    case 'lantern':
      g.circle(0, 0, 10).fill(LANTERN_HALO).circle(0, 0, 6).fill(LANTERN_FILL);
      break;
  }
  g.position.set(spawn.position.x, spawn.position.y);
  return g;
}
