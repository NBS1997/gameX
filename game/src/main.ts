import { Application, Container } from 'pixi.js';
import {
  onReduceMotionChange,
  prefersReducedMotion,
} from './a11y/reduceMotion.ts';
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
import { createCursorTrail } from './render/cursorTrail.ts';
import { createEntityRenderer } from './render/entities.ts';
import { renderGhosts } from './render/ghosts.ts';
import { createHarbourRenderer } from './render/harbour.ts';
import { createTitleCard } from './render/titleCard.ts';
import { createWaterRenderer } from './render/water.ts';
import { createNightPicker } from './scenes/nightPicker.ts';
import { tryRecoverOnPressEdge, updateSoftDrift } from './scenes/softDrift.ts';
import { FluidGrid } from './sim/fluid.ts';
import { createGameState, type GameState } from './state/gameState.ts';
import {
  createMetaState,
  ghostsForNight,
  metaToPersisted,
  nextLinearNight,
  recordNightComplete,
} from './state/meta.ts';
import { loadSave, writeSave } from './state/save.ts';
import { updateGather } from './verbs/gather.ts';
import { updateGuide } from './verbs/guide.ts';
import { updateSend } from './verbs/settle.ts';
import './style.css';

const HELD_SUCCESS_HOLD_MS = 2500;

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

const meta = createMetaState(loadSave());

const worldLayer = new Container();
const uiLayer = new Container();
app.stage.addChild(worldLayer);
app.stage.addChild(uiLayer);

worldLayer.pivot.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
worldLayer.position.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);

const grid = new FluidGrid();
const water = createWaterRenderer(grid);
worldLayer.addChild(water.sprite);

const ghostLayer = new Container();
worldLayer.addChild(ghostLayer);

let activeScene: ActiveScene = { kind: 'none' };
const cursorTrail = createCursorTrail();
uiLayer.addChild(cursorTrail.container);
let cursor = makeCursorForPhase('waxing-crescent');
uiLayer.addChild(cursor);

const titleCard = createTitleCard();
uiLayer.addChild(titleCard.container);

cursorTrail.setEnabled(!prefersReducedMotion());
onReduceMotionChange((reduced) => {
  cursorTrail.setEnabled(!reduced);
});

const pointer = createPointerState(app.stage, app.screen);
const audio = createAudioManager();

const picker = createNightPicker((night) => enterNight(night));
uiLayer.addChild(picker.container);
picker.setMeta(meta);
picker.setVisible(false);

let wasHolding = false;
let wasGoalComplete = false;
let wasSoftDriftActive = false;
let releaseHoldMs = 0;
let postCompleteMs = 0;

interface NightScene {
  kind: 'night';
  state: GameState;
  entities: ReturnType<typeof createEntityRenderer>;
  harbour: ReturnType<typeof createHarbourRenderer>;
}

type ActiveScene = { kind: 'none' } | { kind: 'picker' } | NightScene;

const nightParam = new URLSearchParams(window.location.search).get('night');
const overrideNight: NightNumber | null =
  nightParam === '1' ? 1 : nightParam === '2' ? 2 : nightParam === '3' ? 3 : null;

if (overrideNight) {
  enterNight(overrideNight);
} else if (meta.freeReentry) {
  showPicker();
} else {
  const next = nextLinearNight(meta) ?? 1;
  enterNight(next);
}

app.ticker.add((ticker) => {
  const dt = ticker.deltaMS / 1000;
  const pressEdge = pointer.holding && !wasHolding;
  const releaseEdge = !pointer.holding && wasHolding;

  if (pressEdge && !audio.started) {
    void audio.start(currentLunarPhase());
  }
  if (pressEdge) {
    audio.pressAttack();
    if (titleCard.isActive()) titleCard.skip();
  }
  if (releaseEdge) {
    audio.releaseWhoosh(releaseHoldMs);
    releaseHoldMs = 0;
  }

  titleCard.update(dt);
  cursorTrail.push(pointer.x, pointer.y);

  if (activeScene.kind === 'night') {
    const scene = activeScene;
    tryRecoverOnPressEdge(scene.state, pressEdge);

    if (pointer.holding && !scene.state.softDrift.active) {
      grid.applyPull(
        pointer.x,
        pointer.y,
        scene.state.level.night.pullRadius,
        scene.state.level.night.pullStrength,
        dt,
      );
      pointer.holdMs += ticker.deltaMS;
      releaseHoldMs = pointer.holdMs;
    } else if (!pointer.holding) {
      pointer.holdMs = 0;
    }

    grid.step(dt);
    switch (scene.state.level.night.goal.kind) {
      case 'guide':
        updateGuide(scene.state, grid, dt);
        break;
      case 'gather':
        updateGather(scene.state, grid, dt);
        break;
      case 'send':
        updateSend(scene.state, grid, dt);
        break;
    }

    water.update();
    scene.entities.sync(scene.state.receivers);
    scene.harbour.sync(scene.state);
    updateSoftDrift(scene.state, worldLayer, cursor, dt);

    const goalNowComplete = isGoalComplete(scene.state);
    if (goalNowComplete && !wasGoalComplete) {
      audio.goalMet();
      postCompleteMs = 0;
    }
    if (goalNowComplete) {
      postCompleteMs += ticker.deltaMS;
      if (postCompleteMs >= HELD_SUCCESS_HOLD_MS) {
        finishCurrentNight(scene);
      }
    }

    const driftStartEdge = scene.state.softDrift.active && !wasSoftDriftActive;
    if (driftStartEdge) {
      audio.softDriftSigh();
      audio.duckBed(0.4, 0.4);
    }
    const driftEndEdge = !scene.state.softDrift.active && wasSoftDriftActive;
    if (driftEndEdge) audio.unduckBed(0.6);

    wasGoalComplete = goalNowComplete;
    wasSoftDriftActive = scene.state.softDrift.active;
  } else {
    grid.step(dt);
    water.update();
  }

  cursor.position.set(pointer.x, pointer.y);
  wasHolding = pointer.holding;
});

function enterNight(night: NightNumber): void {
  picker.setVisible(false);
  postCompleteMs = 0;
  wasGoalComplete = false;
  wasSoftDriftActive = false;

  if (activeScene.kind === 'night') {
    worldLayer.removeChild(activeScene.entities.container);
    worldLayer.removeChild(activeScene.harbour.container);
  }
  ghostLayer.removeChildren();

  const level = loadLevel(night);
  const state = createGameState(level, night);

  const ghosts = ghostsForNight(meta, night);
  ghostLayer.addChild(renderGhosts(ghosts));

  const harbour = createHarbourRenderer(state);
  worldLayer.addChild(harbour.container);

  const entities = createEntityRenderer(state.receivers);
  worldLayer.addChild(entities.container);

  uiLayer.removeChild(cursor);
  cursor = makeCursorForPhase(level.night.lunarPhase);
  uiLayer.addChild(cursor);
  uiLayer.addChild(picker.container);

  if (audio.started) audio.setPhase(level.night.lunarPhase);

  uiLayer.removeChild(titleCard.container);
  uiLayer.addChild(titleCard.container);
  titleCard.show(level.night.lunarPhase);

  activeScene = { kind: 'night', state, entities, harbour };
}

function showPicker(): void {
  if (activeScene.kind === 'night') {
    worldLayer.removeChild(activeScene.entities.container);
    worldLayer.removeChild(activeScene.harbour.container);
  }
  ghostLayer.removeChildren();
  picker.setMeta(meta);
  picker.setVisible(true);
  activeScene = { kind: 'picker' };
}

function finishCurrentNight(scene: NightScene): void {
  recordNightComplete(meta, scene.state.currentNight, scene.state.receivers);
  writeSave(metaToPersisted(meta));

  if (meta.freeReentry) {
    showPicker();
    return;
  }

  const next = nextLinearNight(meta);
  if (next) {
    enterNight(next);
  } else {
    showPicker();
  }
}

function isGoalComplete(state: GameState): boolean {
  return (
    (state.goalProgress.kind === 'guide' && state.goalProgress.complete) ||
    (state.goalProgress.kind === 'gather' && state.goalProgress.complete) ||
    (state.goalProgress.kind === 'send' && state.goalProgress.complete)
  );
}

function currentLunarPhase(): 'waxing-crescent' | 'full' | 'waning-gibbous' {
  if (activeScene.kind === 'night') {
    return activeScene.state.level.night.lunarPhase;
  }
  return 'waxing-crescent';
}
