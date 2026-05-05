import { Application, Graphics } from 'pixi.js';
import {
  BAY_COLOUR,
  CURSOR_COLOUR,
  CURSOR_PLACEHOLDER_RADIUS,
  LETTERBOX_COLOUR,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from './config.ts';
import { loadLevel } from './level/loader.ts';
import { renderEntities } from './render/entities.ts';
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

const level = loadLevel(1);
const entityLayer = renderEntities(level);
app.stage.addChild(entityLayer);

const cursor = new Graphics()
  .circle(0, 0, CURSOR_PLACEHOLDER_RADIUS)
  .fill(CURSOR_COLOUR);
cursor.position.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
app.stage.addChild(cursor);

app.stage.eventMode = 'static';
app.stage.hitArea = app.screen;
app.stage.on('pointermove', (event) => {
  cursor.position.copyFrom(event.global);
});
