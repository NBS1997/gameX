import { Application, Graphics } from 'pixi.js';
import {
  BAY_COLOUR,
  CURSOR_COLOUR,
  CURSOR_PLACEHOLDER_RADIUS,
  LETTERBOX_COLOUR,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from './config.ts';
import { createPointerState } from './input/pointer.ts';
import { loadLevel } from './level/loader.ts';
import type { NightNumber } from './level/types.ts';
import { renderEntities } from './render/entities.ts';
import { createWaterRenderer } from './render/water.ts';
import { FluidGrid } from './sim/fluid.ts';
import './style.css';

document.documentElement.style.setProperty(
  '--letterbox-colour',
  LETTERBOX_COLOUR,
);

const app = new Application();

await app.init({
  width: LOGICAL_WIDTH,
  height: LOGICAL_HEIGHT,
  background: BAY_COLOUR,
  antialias: true,
  autoDensity: true,
  resolution: window.devicePixelRatio || 1,
});

document.body.appendChild(app.canvas);

// Day-3 dev affordance: `?night=N` query param swaps the loaded night so the
// kill-gate's per-phase parameterisation is visually verifiable without the
// picker UI (which lands day 8). Replace this with the picker on day 8.
const nightParam = new URLSearchParams(window.location.search).get('night');
const initialNight: NightNumber =
  nightParam === '2' ? 2 : nightParam === '3' ? 3 : 1;
const level = loadLevel(initialNight);

const grid = new FluidGrid();
const water = createWaterRenderer(grid);
app.stage.addChild(water.sprite);

const entityLayer = renderEntities(level);
app.stage.addChild(entityLayer);

const cursor = new Graphics()
  .circle(0, 0, CURSOR_PLACEHOLDER_RADIUS)
  .fill(CURSOR_COLOUR);
app.stage.addChild(cursor);

const pointer = createPointerState(app.stage, app.screen);

app.ticker.add((ticker) => {
  const dt = ticker.deltaMS / 1000;

  if (pointer.holding) {
    grid.applyPull(
      pointer.x,
      pointer.y,
      level.night.pullRadius,
      level.night.pullStrength,
      dt,
    );
    pointer.holdMs += ticker.deltaMS;
  } else {
    pointer.holdMs = 0;
  }

  grid.step(dt);
  water.update();
  cursor.position.set(pointer.x, pointer.y);
});
