import { Application, Container } from 'pixi.js';
import { createAudioManager } from './audio/manager.ts';
import {
  BAY_COLOUR,
  LETTERBOX_COLOUR,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from './config.ts';
import { createPointerState } from './input/pointer.ts';
import { loadLevel } from './level/loader.ts';
import type { NightNumber } from './level/types.ts';
import { makeCursorForPhase } from './render/cursor.ts';
import { createEntityRenderer } from './render/entities.ts';
import { createHarbourRenderer } from './render/harbour.ts';
import { createWaterRenderer } from './render/water.ts';
import { tryRecoverOnPressEdge, updateSoftDrift } from './scenes/softDrift.ts';
import { FluidGrid } from './sim/fluid.ts';
import { createGameState } from './state/gameState.ts';
import { updateGather } from './verbs/gather.ts';
import { updateGuide } from './verbs/guide.ts';
import { updateSend } from './verbs/settle.ts';
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

const cursor = makeCursorForPhase(state.level.night.lunarPhase);
uiLayer.addChild(cursor);

const pointer = createPointerState(app.stage, app.screen);
const audio = createAudioManager();

let wasHolding = false;
let wasGoalComplete = false;
let wasSoftDriftActive = false;
let releaseHoldMs = 0;

app.ticker.add((ticker) => {
  const dt = ticker.deltaMS / 1000;
  const pressEdge = pointer.holding && !wasHolding;
  const releaseEdge = !pointer.holding && wasHolding;

  if (pressEdge && !audio.started) {
    void audio.start(state.level.night.lunarPhase);
  }
  if (pressEdge) {
    audio.pressAttack();
  }
  if (releaseEdge) {
    audio.releaseWhoosh(releaseHoldMs);
    releaseHoldMs = 0;
  }

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
    releaseHoldMs = pointer.holdMs;
  } else if (!pointer.holding) {
    pointer.holdMs = 0;
  }

  grid.step(dt);
  switch (state.level.night.goal.kind) {
    case 'guide':
      updateGuide(state, grid, dt);
      break;
    case 'gather':
      updateGather(state, grid, dt);
      break;
    case 'send':
      updateSend(state, grid, dt);
      break;
  }

  water.update();
  entities.sync(state.receivers);
  harbour.sync(state);
  updateSoftDrift(state, worldLayer, cursor, dt);

  // Audio edge events
  const goalNowComplete =
    (state.goalProgress.kind === 'guide' && state.goalProgress.complete) ||
    (state.goalProgress.kind === 'gather' && state.goalProgress.complete) ||
    (state.goalProgress.kind === 'send' && state.goalProgress.complete);
  if (goalNowComplete && !wasGoalComplete) {
    audio.goalMet();
  }

  const driftStartEdge = state.softDrift.active && !wasSoftDriftActive;
  if (driftStartEdge) {
    audio.softDriftSigh();
    audio.duckBed(0.4, 0.4);
  }
  const driftEndEdge = !state.softDrift.active && wasSoftDriftActive;
  if (driftEndEdge) {
    audio.unduckBed(0.6);
  }

  cursor.position.set(pointer.x, pointer.y);
  wasHolding = pointer.holding;
  wasGoalComplete = goalNowComplete;
  wasSoftDriftActive = state.softDrift.active;
});
