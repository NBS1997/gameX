import { Application, Graphics } from 'pixi.js';
import {
  BAY_COLOUR,
  CURSOR_COLOUR,
  CURSOR_PLACEHOLDER_RADIUS,
  LOGICAL_HEIGHT,
  LOGICAL_WIDTH,
} from './config.ts';
import './style.css';

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
