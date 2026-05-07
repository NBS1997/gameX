import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../config.ts';
import { FluidGrid } from '../sim/fluid.ts';
import { startSoftDrift, type GameState } from '../state/gameState.ts';
import type { Vec2 } from '../level/types.ts';

const FLOW_TO_VELOCITY = 6;
const LANTERN_DRAG_RATE = 0.55;
const OFFSCREEN_BACK_MARGIN = 60;

const FIRE_PROXIMITY_RADIUS = 80;

export function updateSend(
  state: GameState,
  grid: FluidGrid,
  dt: number,
  fire?: { position: Vec2; isIgnited: () => boolean; onIgnite: () => void },
): void {
  if (state.level.night.goal.kind !== 'send') return;
  if (state.goalProgress.kind !== 'send') return;
  if (state.goalProgress.complete) return;
  if (state.softDrift.active) return;

  const goal = state.level.night.goal;
  const progress = state.goalProgress;
  const dragFactor = Math.exp(-LANTERN_DRAG_RATE * dt);

  const sentEdge = edgeCoordinate(goal.edge);

  let sentCount = 0;
  let lostCount = 0;

  for (const r of state.receivers) {
    if (r.type !== 'lantern') continue;

    if (!r.sent) {
      const flow = grid.sampleFlow(r.position.x, r.position.y);
      r.velocity.x += flow.vx * FLOW_TO_VELOCITY * dt;
      r.velocity.y += flow.vy * FLOW_TO_VELOCITY * dt;
      r.velocity.x *= dragFactor;
      r.velocity.y *= dragFactor;
      r.position.x += r.velocity.x * dt;
      r.position.y += r.velocity.y * dt;

      if (fire !== undefined && !fire.isIgnited()) {
        const fdx = r.position.x - fire.position.x;
        const fdy = r.position.y - fire.position.y;
        const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
        if (r.position.x > 1600 && fdist < FIRE_PROXIMITY_RADIUS) {
          fire.onIgnite();
        }
      }

      if (hasCrossedEdge(r.position, goal.edge, sentEdge)) {
        r.sent = true;
      } else if (
        r.position.x < -OFFSCREEN_BACK_MARGIN ||
        r.position.x > LOGICAL_WIDTH + OFFSCREEN_BACK_MARGIN ||
        r.position.y < -OFFSCREEN_BACK_MARGIN ||
        r.position.y > LOGICAL_HEIGHT + OFFSCREEN_BACK_MARGIN
      ) {
        lostCount++;
      }
    }

    if (r.sent) sentCount++;
  }

  const totalLanterns = state.receivers.filter(
    (r) => r.type === 'lantern',
  ).length;
  if (lostCount > totalLanterns / 2) {
    startSoftDrift(state);
    return;
  }

  progress.sentCount = sentCount;
  if (sentCount >= goal.minCount) {
    progress.complete = true;
  }
}

function edgeCoordinate(edge: 'north' | 'south' | 'east' | 'west'): number {
  switch (edge) {
    case 'north':
      return 0;
    case 'south':
      return LOGICAL_HEIGHT;
    case 'east':
      return LOGICAL_WIDTH;
    case 'west':
      return 0;
  }
}

function hasCrossedEdge(
  position: { x: number; y: number },
  edge: 'north' | 'south' | 'east' | 'west',
  edgeCoord: number,
): boolean {
  switch (edge) {
    case 'north':
      return position.y < edgeCoord;
    case 'south':
      return position.y > edgeCoord;
    case 'east':
      return position.x > edgeCoord;
    case 'west':
      return position.x < edgeCoord;
  }
}
