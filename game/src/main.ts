import { Application, Container, Graphics } from 'pixi.js';
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
import { createEntityRenderer } from './render/entities.ts';
import { createHarbourRenderer } from './render/harbour.ts';
import { createWaterRenderer } from './render/water.ts';
import { tryRecoverOnPressEdge, updateSoftDrift } from './scenes/softDrift.ts';
import { FluidGrid } from './sim/fluid.ts';
import { createGameState } from './state/gameState.ts';
import { updateGuide } from './verbs/guide.ts';
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

const nightParam = new URLSearchParams(window.location.search).get('night');
const initialNight: NightNumber =
  nightParam === '2' ? 2 : nightParam === '3' ? 3 : 1;
const level = loadLevel(initialNight);
const state = createGameState(level, initialNight);

// Layer split: world (water + entities + harbour) is what soft-drift scales;
// ui (cursor) stays at full size + on top of everything for clip-render.
const worldLayer = new Container();
const uiLayer = new Container();
app.stage.addChild(worldLayer);
app.stage.addChild(uiLayer);

worldLayer.pivot.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
worldLayer.position.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);

const grid = new FluidGrid();
const water = createWaterRenderer(grid);
worldLayer.addChild(water.sprite);

const harbour = createHarbourRenderer(state);
worldLayer.addChild(harbour.container);

const entities = createEntityRenderer(state.receivers);
worldLayer.addChild(entities.container);

const cursor = new Graphics()
  .circle(0, 0, CURSOR_PLACEHOLDER_RADIUS)
  .fill(CURSOR_COLOUR);
uiLayer.addChild(cursor);

const pointer = createPointerState(app.stage, app.screen);

let wasHolding = false;

app.ticker.add((ticker) => {
  const dt = ticker.deltaMS / 1000;
  const pressEdge = pointer.holding && !wasHolding;

  tryRecoverOnPressEdge(state, pressEdge);

  if (pointer.holding && !state.softDrift.active) {
    grid.applyPull(
      pointer.x,
      pointer.y,
      state.level.night.pullRadius,
      state.level.night.pullStrength,
      dt,
    );
    pointer.holdMs += ticker.deltaMS;
  } else {
    pointer.holdMs = 0;
  }

  grid.step(dt);
  updateGuide(state, grid, dt);

  water.update();
  entities.sync(state.receivers);
  harbour.sync(state);
  updateSoftDrift(state, worldLayer, cursor, dt);

  cursor.position.set(pointer.x, pointer.y);
  wasHolding = pointer.holding;
});
