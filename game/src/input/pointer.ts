import type { Container, Rectangle } from 'pixi.js';

export interface PointerState {
  x: number;
  y: number;
  holding: boolean;
  holdMs: number;
}

export function createPointerState(
  stage: Container,
  screen: Rectangle,
): PointerState {
  const state: PointerState = { x: 0, y: 0, holding: false, holdMs: 0 };

  stage.eventMode = 'static';
  stage.hitArea = screen;

  stage.on('pointermove', (event) => {
    state.x = event.global.x;
    state.y = event.global.y;
  });
  stage.on('pointerdown', (event) => {
    state.holding = true;
    state.holdMs = 0;
    state.x = event.global.x;
    state.y = event.global.y;
  });
  stage.on('pointerup', () => {
    state.holding = false;
  });
  stage.on('pointerupoutside', () => {
    state.holding = false;
  });

  return state;
}
