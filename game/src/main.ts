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
  RECEIVER_DIRECT_PULL,
  RECEIVER_PULL_RADIUS_MULTIPLIER,
} from './config.ts';
import { createPointerState } from './input/pointer.ts';
import { loadLevel } from './level/loader.ts';
import type { NightNumber } from './level/types.ts';
import { createAmbientLife } from './render/ambientLife.ts';
import { makeCursorForPhase, type MoonCursor } from './render/cursor.ts';
import { createCursorTrail } from './render/cursorTrail.ts';
import { createEntityRenderer } from './render/entities.ts';
import { renderGhosts } from './render/ghosts.ts';
import { createHarbourRenderer } from './render/harbour.ts';
import {
  createMoonrise,
  rememberWorldLayerBaseY,
} from './render/moonrise.ts';
import { createIntentBeat } from './render/intentBeat.ts';
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
const HELD_SUCCESS_EASE_MS = 1500;
const HELD_SUCCESS_TARGET_SCALE = 1.12;
const SAVOUR_MIN_MS = 1500;
const HOLD_RAMP_MS = 400;

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
const isFirstLaunch = meta.completedNights.size === 0 && !meta.freeReentry;

const worldLayer = new Container();
const uiLayer = new Container();
app.stage.addChild(worldLayer);
app.stage.addChild(uiLayer);

worldLayer.pivot.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
worldLayer.position.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
rememberWorldLayerBaseY(worldLayer);

const grid = new FluidGrid();
const water = createWaterRenderer(grid);
worldLayer.addChild(water.sprite);

const ghostLayer = new Container();
worldLayer.addChild(ghostLayer);

const intentBeat = createIntentBeat();
worldLayer.addChild(intentBeat.container);

const ambientLife = createAmbientLife();
worldLayer.addChild(ambientLife.container);

let activeScene: ActiveScene = { kind: 'none' };
const cursorTrail = createCursorTrail();
uiLayer.addChild(cursorTrail.container);
let cursor: MoonCursor = makeCursorForPhase('waxing-crescent');
uiLayer.addChild(cursor.container);

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

const moonrise = createMoonrise();
const moonriseCursorAlpha = { value: 1 };

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

// DEV-ONLY override (?night=N): skips the picker and loads that night directly.
// Acceptable for localhost iteration. Remove (or feature-gate behind a build env)
// before the slice ships to any public URL — bypassing the picker fights the
// first-playthrough linear-ordering design.
const nightParam = new URLSearchParams(window.location.search).get('night');
const overrideNight: NightNumber | null =
  nightParam === '1' ? 1 : nightParam === '2' ? 2 : nightParam === '3' ? 3 : null;

if (overrideNight) {
  enterNight(overrideNight);
  moonrise.start(false);
} else if (meta.freeReentry) {
  showPicker();
} else {
  const next = nextLinearNight(meta) ?? 1;
  enterNight(next);
  moonrise.start(isFirstLaunch);
}

app.ticker.add((ticker) => {
  const dt = ticker.deltaMS / 1000;
  const pressEdge = pointer.holding && !wasHolding;
  const releaseEdge = !pointer.holding && wasHolding;

  if (pressEdge && !audio.started) {
    void audio.start(currentLunarPhase());
  }
  if (pressEdge && !wasGoalComplete) {
    audio.pressAttack();
    if (titleCard.isActive()) titleCard.skip();
    if (moonrise.isActive()) moonrise.skip();
    if (intentBeat.isActive()) intentBeat.skip();
  }
  if (releaseEdge) {
    audio.releaseWhoosh(releaseHoldMs);
    releaseHoldMs = 0;
  }

  titleCard.update(dt);
  moonrise.update(dt, worldLayer, moonriseCursorAlpha);
  intentBeat.update(dt);
  cursorTrail.push(pointer.x, pointer.y);
  ambientLife.update(dt);

  if (activeScene.kind === 'night') {
    const scene = activeScene;
    tryRecoverOnPressEdge(scene.state, pressEdge);

    const moonriseGate = !moonrise.isActive() && !intentBeat.isActive();
    if (pointer.holding && !scene.state.softDrift.active && moonriseGate) {
      grid.applyPull(
        pointer.x,
        pointer.y,
        scene.state.level.night.pullRadius,
        scene.state.level.night.pullStrength,
        dt,
      );
      // OQ18 (adjudicated): N3 'send' only — N1/N2 move via flow alone; trailer P1 #9 is the empirical re-test.
      if (scene.state.level.night.goal.kind === 'send') {
        applyReceiverAttraction(scene.state, dt);
      }
      pointer.holdMs += ticker.deltaMS;
      releaseHoldMs = pointer.holdMs;
    } else if (!pointer.holding) {
      pointer.holdMs = 0;
    }

    grid.step(dt);
    if (moonriseGate) {
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
    }

    water.update(dt);
    scene.entities.sync(scene.state.receivers);
    scene.entities.update(dt);
    scene.harbour.sync(scene.state);
    scene.harbour.update(dt, scene.state);
    updateSoftDrift(scene.state, worldLayer, dt);

    const goalNowComplete = isGoalComplete(scene.state);
    if (goalNowComplete && !wasGoalComplete) {
      audio.goalMet();
      postCompleteMs = 0;
    }
    if (goalNowComplete) {
      postCompleteMs += ticker.deltaMS;
      applyHeldSuccessEase(postCompleteMs);
      const savourCeiling = postCompleteMs >= HELD_SUCCESS_HOLD_MS;
      const savourTap = postCompleteMs >= SAVOUR_MIN_MS && pressEdge;
      if (savourCeiling || savourTap) {
        worldLayer.scale.set(scene.state.softDrift.cameraScale);
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
    water.update(dt);
  }

  const holdT = Math.min(1, pointer.holdMs / HOLD_RAMP_MS);
  cursor.setHoldStrength(pointer.holding ? holdT : 0);

  const driftAlpha =
    activeScene.kind === 'night' ? activeScene.state.softDrift.cursorAlpha : 1;
  cursor.container.alpha = driftAlpha * moonriseCursorAlpha.value;
  cursor.container.position.set(pointer.x, pointer.y);
  wasHolding = pointer.holding;
});

function applyHeldSuccessEase(elapsedMs: number): void {
  if (prefersReducedMotion()) return;
  const t = Math.min(1, elapsedMs / HELD_SUCCESS_EASE_MS);
  const eased = 1 - Math.pow(1 - t, 3);
  const targetScale = 1 + (HELD_SUCCESS_TARGET_SCALE - 1) * eased;
  worldLayer.scale.set(targetScale);
}

function applyReceiverAttraction(state: GameState, dt: number): void {
  const range =
    state.level.night.pullRadius * RECEIVER_PULL_RADIUS_MULTIPLIER;
  const rangeSq = range * range;
  for (const r of state.receivers) {
    if (r.sent) continue;
    const dx = pointer.x - r.position.x;
    const dy = pointer.y - r.position.y;
    const distSq = dx * dx + dy * dy;
    if (distSq > rangeSq) continue;
    const dist = Math.sqrt(distSq);
    if (dist < 0.5) continue;
    const falloff = 1 - dist / range;
    const force =
      state.level.night.pullStrength * RECEIVER_DIRECT_PULL * falloff * dt;
    r.velocity.x += (dx / dist) * force;
    r.velocity.y += (dy / dist) * force;
  }
}

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

  uiLayer.removeChild(cursor.container);
  cursor = makeCursorForPhase(level.night.lunarPhase);
  uiLayer.addChild(cursor.container);
  uiLayer.addChild(picker.container);

  if (audio.started) audio.setPhase(level.night.lunarPhase);
  water.setPhase(level.night.lunarPhase);

  uiLayer.removeChild(titleCard.container);
  uiLayer.addChild(titleCard.container);
  titleCard.show(level.night.lunarPhase);
  intentBeat.start(night, level);

  worldLayer.scale.set(1);

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
  worldLayer.scale.set(1);
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
