import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../config.ts';
import { FluidGrid } from '../sim/fluid.ts';
import { startSoftDrift, type GameState } from '../state/gameState.ts';

const FLOW_TO_VELOCITY = 6;
const LANTERN_DRAG_RATE = 0.7;
const HELD_CLUSTER_MS = 1000;
const OFFSCREEN_MARGIN = 60;
const CLUSTER_LEAVE_DECAY_RATE_MS_PER_S = 1500;

export function updateGather(
  state: GameState,
  grid: FluidGrid,
  dt: number,
): void {
  if (state.level.night.goal.kind !== 'gather') return;
  if (state.goalProgress.kind !== 'gather') return;
  if (state.goalProgress.complete) return;
  if (state.softDrift.active) return;

  const goal = state.level.night.goal;
  const progress = state.goalProgress;
  const dragFactor = Math.exp(-LANTERN_DRAG_RATE * dt);

  let lostCount = 0;
  let onScreenCount = 0;
  let cx = 0;
  let cy = 0;

  for (const r of state.receivers) {
    if (r.type !== 'lantern') continue;

    const flow = grid.sampleFlow(r.position.x, r.position.y);
    r.velocity.x += flow.vx * FLOW_TO_VELOCITY * dt;
    r.velocity.y += flow.vy * FLOW_TO_VELOCITY * dt;
    r.velocity.x *= dragFactor;
    r.velocity.y *= dragFactor;
    r.position.x += r.velocity.x * dt;
    r.position.y += r.velocity.y * dt;

    if (
      r.position.x < -OFFSCREEN_MARGIN ||
      r.position.x > LOGICAL_WIDTH + OFFSCREEN_MARGIN ||
      r.position.y < -OFFSCREEN_MARGIN ||
      r.position.y > LOGICAL_HEIGHT + OFFSCREEN_MARGIN
    ) {
      lostCount++;
      continue;
    }
    onScreenCount++;
    cx += r.position.x;
    cy += r.position.y;
  }

  const totalLanterns = state.receivers.filter(
    (r) => r.type === 'lantern',
  ).length;
  if (lostCount > totalLanterns / 2) {
    startSoftDrift(state);
    return;
  }

  if (onScreenCount === 0) {
    progress.clusterCount = 0;
    progress.clusterMs = Math.max(
      0,
      progress.clusterMs - dt * CLUSTER_LEAVE_DECAY_RATE_MS_PER_S,
    );
    return;
  }

  cx /= onScreenCount;
  cy /= onScreenCount;

  const clusterRadiusSq = goal.clusterRadius * goal.clusterRadius;
  let clustered = 0;
  for (const r of state.receivers) {
    if (r.type !== 'lantern') continue;
    const dx = r.position.x - cx;
    const dy = r.position.y - cy;
    if (dx * dx + dy * dy < clusterRadiusSq) {
      clustered++;
    }
  }
  progress.clusterCount = clustered;

  if (clustered >= goal.minCount) {
    progress.clusterMs += dt * 1000;
    if (progress.clusterMs >= HELD_CLUSTER_MS) {
      progress.complete = true;
    }
  } else {
    progress.clusterMs = Math.max(
      0,
      progress.clusterMs - dt * CLUSTER_LEAVE_DECAY_RATE_MS_PER_S,
    );
  }
}
