import {
  WITHHOLD_DWELL_FALL,
  WITHHOLD_DWELL_RISE,
  WITHHOLD_HARD_R,
  WITHHOLD_RING_R,
  WITHHOLD_SHY_BLEED,
  WITHHOLD_SHY_V,
  WITHHOLD_STILL_V,
  WITHHOLD_TOUCH_DWELL,
} from '../config.ts';
import type { GameState } from '../state/gameState.ts';
import type { Vec2 } from '../level/types.ts';

export interface WithholdHooks {
  heronPosition: Vec2;
  cursorPosition: Vec2;
  cursorVelocity: number;
  isPressed: boolean;
  onShy?: () => void;
  onGoalMet?: () => void;
}

export function updateWithhold(
  state: GameState,
  dt: number,
  hooks: WithholdHooks,
): void {
  if (state.level.night.goal.kind !== 'still') return;
  if (state.goalProgress.kind !== 'still') return;
  if (state.goalProgress.complete) return;

  const dx = hooks.heronPosition.x - hooks.cursorPosition.x;
  const dy = hooks.heronPosition.y - hooks.cursorPosition.y;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d > WITHHOLD_RING_R) {
    state.goalProgress.dwellT = Math.max(
      0,
      state.goalProgress.dwellT - WITHHOLD_DWELL_FALL * dt,
    );
  } else if (d < WITHHOLD_HARD_R && hooks.cursorVelocity > WITHHOLD_SHY_V) {
    state.goalProgress.dwellT = Math.max(
      0,
      state.goalProgress.dwellT - WITHHOLD_SHY_BLEED,
    );
    if (hooks.onShy) hooks.onShy();
  } else if (
    (hooks.isPressed && hooks.cursorVelocity < WITHHOLD_STILL_V) ||
    !hooks.isPressed
  ) {
    state.goalProgress.dwellT = Math.min(
      1.0,
      state.goalProgress.dwellT + WITHHOLD_DWELL_RISE * dt,
    );
  } else {
    state.goalProgress.dwellT = Math.max(
      0,
      state.goalProgress.dwellT - WITHHOLD_DWELL_FALL * dt,
    );
  }

  if (state.goalProgress.dwellT >= WITHHOLD_TOUCH_DWELL) {
    state.goalProgress.complete = true;
    if (hooks.onGoalMet) hooks.onGoalMet();
  }
}
