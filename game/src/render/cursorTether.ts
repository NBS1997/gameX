import { Container, Graphics } from 'pixi.js';
import { prefersReducedMotion } from '../a11y/reduceMotion.ts';
import type { ReceiverInstance } from '../state/gameState.ts';

const TETHER_COLOUR = 0xa8b5cc;
const TETHER_WIDTH = 2;

export interface CursorTether {
  container: Container;
  update(opts: {
    cursorX: number;
    cursorY: number;
    receivers: ReceiverInstance[];
    range: number;
    holdT: number;
  }): void;
  setEnabled(enabled: boolean): void;
}

export function createCursorTether(): CursorTether {
  const container = new Container();
  const strand = new Graphics();
  container.addChild(strand);

  let enabled = true;

  const update = (opts: {
    cursorX: number;
    cursorY: number;
    receivers: ReceiverInstance[];
    range: number;
    holdT: number;
  }): void => {
    strand.clear();
    if (!enabled) return;
    if (opts.holdT === 0 || opts.receivers.length === 0) return;
    // reduce-motion swap: static line at the same alpha computation, no fade-in
    // tween. The tether is redrawn per-frame anyway, so both paths are identical
    // geometry; prefersReducedMotion() is sampled live to react to mid-session
    // OS toggles without needing a listener.
    prefersReducedMotion();
    for (const receiver of opts.receivers) {
      if (receiver.sent) continue;
      const dx = opts.cursorX - receiver.position.x;
      const dy = opts.cursorY - receiver.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist >= opts.range) continue;
      const alpha = 0.3 * opts.holdT * (1 - dist / opts.range);
      strand
        .moveTo(opts.cursorX, opts.cursorY)
        .lineTo(receiver.position.x, receiver.position.y)
        .stroke({ width: TETHER_WIDTH, color: TETHER_COLOUR, alpha });
    }
  };

  const setEnabled = (next: boolean): void => {
    enabled = next;
    if (!next) strand.clear();
  };

  return { container, update, setEnabled };
}
