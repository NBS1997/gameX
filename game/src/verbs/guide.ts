import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../config.ts';
import { FluidGrid } from '../sim/fluid.ts';
import { startSoftDrift, type GameState } from '../state/gameState.ts';

const FLOW_TO_VELOCITY = 6;
const BOAT_DRAG_RATE = 0.6;
const HELD_SUCCESS_MS = 1500;
const HARBOUR_LEAVE_DECAY_RATE_MS_PER_S = 2000;
const OFFSCREEN_MARGIN = 60;

export function updateGuide(
  state: GameState,
  grid: FluidGrid,
  dt: number,
): void {
  if (state.level.night.goal.kind !== 'guide') return;
  if (state.goalProgress.kind !== 'guide') return;
  if (state.goalProgress.complete) return;
  if (state.softDrift.active) return;

  const goal = state.level.night.goal;
  const progress = state.goalProgress;
  const dragFactor = Math.exp(-BOAT_DRAG_RATE * dt);
  const radiusSq = goal.target.radius * goal.target.radius;

  let anyBoatInHarbour = false;

  for (const receiver of state.receivers) {
    if (receiver.type !== 'boat') continue;

    const flow = grid.sampleFlow(receiver.position.x, receiver.position.y);
    receiver.velocity.x += flow.vx * FLOW_TO_VELOCITY * dt;
    receiver.velocity.y += flow.vy * FLOW_TO_VELOCITY * dt;
    receiver.velocity.x *= dragFactor;
    receiver.velocity.y *= dragFactor;
    receiver.position.x += receiver.velocity.x * dt;
    receiver.position.y += receiver.velocity.y * dt;

    if (
      receiver.position.x < -OFFSCREEN_MARGIN ||
      receiver.position.x > LOGICAL_WIDTH + OFFSCREEN_MARGIN ||
      receiver.position.y < -OFFSCREEN_MARGIN ||
      receiver.position.y > LOGICAL_HEIGHT + OFFSCREEN_MARGIN
    ) {
      startSoftDrift(state);
      return;
    }

    const dx = receiver.position.x - goal.target.x;
    const dy = receiver.position.y - goal.target.y;
    if (dx * dx + dy * dy < radiusSq) {
      anyBoatInHarbour = true;
    }
  }

  if (anyBoatInHarbour) {
    progress.inHarbourMs += dt * 1000;
    if (progress.inHarbourMs >= HELD_SUCCESS_MS) {
      progress.complete = true;
    }
  } else {
    progress.inHarbourMs = Math.max(
      0,
      progress.inHarbourMs - dt * HARBOUR_LEAVE_DECAY_RATE_MS_PER_S,
    );
  }
}
