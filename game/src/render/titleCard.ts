import { Container, Text, TextStyle } from 'pixi.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../config.ts';
import type { LunarPhase } from '../level/types.ts';

const HOLD_MS = 3000;
const FADE_MS = 400;
const TITLE_COLOUR = 0xa8b5cc;

const TITLE_STRINGS: Record<LunarPhase, string> = {
  'waxing-crescent': 'Waxing crescent.  The harbour is restless tonight.',
  full: 'Full moon.  The bay fills.',
  'waning-gibbous': 'Waning gibbous.  The lanterns are lit.',
  'last-quarter': 'Last quarter.  The bay holds what was given.',
};

type Phase = 'idle' | 'fade-in' | 'hold' | 'fade-out';

export interface TitleCard {
  container: Container;
  show(phase: LunarPhase): void;
  update(dt: number): void;
  skip(): void;
  isActive(): boolean;
}

export function createTitleCard(): TitleCard {
  const container = new Container();
  const text = new Text({
    text: '',
    style: new TextStyle({
      fontFamily: 'system-ui, "Segoe UI", Roboto, sans-serif',
      fontWeight: '400',
      fontSize: 48,
      fill: TITLE_COLOUR,
      align: 'center',
      letterSpacing: 1,
    }),
  });
  text.anchor.set(0.5);
  text.position.set(LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
  container.addChild(text);
  container.alpha = 0;
  container.visible = false;

  let phase: Phase = 'idle';
  let elapsedMs = 0;

  const show = (lunarPhase: LunarPhase): void => {
    text.text = TITLE_STRINGS[lunarPhase];
    phase = 'fade-in';
    elapsedMs = 0;
    container.alpha = 0;
    container.visible = true;
  };

  const update = (dt: number): void => {
    if (phase === 'idle') return;
    elapsedMs += dt * 1000;

    switch (phase) {
      case 'fade-in':
        container.alpha = Math.min(1, elapsedMs / FADE_MS);
        if (elapsedMs >= FADE_MS) {
          phase = 'hold';
          elapsedMs = 0;
        }
        break;
      case 'hold':
        container.alpha = 1;
        if (elapsedMs >= HOLD_MS) {
          phase = 'fade-out';
          elapsedMs = 0;
        }
        break;
      case 'fade-out':
        container.alpha = Math.max(0, 1 - elapsedMs / FADE_MS);
        if (elapsedMs >= FADE_MS) {
          phase = 'idle';
          container.visible = false;
        }
        break;
    }
  };

  const skip = (): void => {
    if (phase === 'fade-in' || phase === 'hold') {
      phase = 'fade-out';
      elapsedMs = 0;
    }
  };

  const isActive = (): boolean => phase !== 'idle';

  return { container, show, update, skip, isActive };
}
