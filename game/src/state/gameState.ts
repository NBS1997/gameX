import type {
  GoalKind,
  LevelDef,
  NightNumber,
  ReceiverType,
  Vec2,
} from '../level/types.ts';

export interface ReceiverInstance {
  id: string;
  type: ReceiverType;
  position: Vec2;
  velocity: Vec2;
  initial: Vec2;
}

export type GoalProgress =
  | { kind: 'guide'; inHarbourMs: number; complete: boolean }
  | {
      kind: 'gather';
      clusterCount: number;
      clusterMs: number;
      complete: boolean;
    }
  | { kind: 'send'; sentCount: number; complete: boolean };

export interface SoftDriftState {
  active: boolean;
  elapsedMs: number;
  cameraScale: number;
  cursorAlpha: number;
}

export interface GameState {
  currentNight: NightNumber;
  level: LevelDef;
  receivers: ReceiverInstance[];
  goalProgress: GoalProgress;
  softDrift: SoftDriftState;
}

export function createGameState(
  level: LevelDef,
  currentNight: NightNumber,
): GameState {
  return {
    currentNight,
    level,
    receivers: level.night.spawns.map((s) => ({
      id: s.id,
      type: s.type,
      position: { x: s.position.x, y: s.position.y },
      velocity: { x: 0, y: 0 },
      initial: { x: s.position.x, y: s.position.y },
    })),
    goalProgress: initialGoalProgress(level.night.goal.kind),
    softDrift: {
      active: false,
      elapsedMs: 0,
      cameraScale: 1,
      cursorAlpha: 1,
    },
  };
}

function initialGoalProgress(kind: GoalKind): GoalProgress {
  switch (kind) {
    case 'guide':
      return { kind: 'guide', inHarbourMs: 0, complete: false };
    case 'gather':
      return { kind: 'gather', clusterCount: 0, clusterMs: 0, complete: false };
    case 'send':
      return { kind: 'send', sentCount: 0, complete: false };
  }
}

export function startSoftDrift(state: GameState): void {
  if (state.softDrift.active) return;
  state.softDrift.active = true;
  state.softDrift.elapsedMs = 0;
}

export function recoverFromSoftDrift(state: GameState): void {
  if (!state.softDrift.active) return;
  for (const r of state.receivers) {
    r.position.x = r.initial.x;
    r.position.y = r.initial.y;
    r.velocity.x = 0;
    r.velocity.y = 0;
  }
  state.softDrift.active = false;
  state.softDrift.elapsedMs = 0;
  if (state.goalProgress.kind === 'guide') {
    state.goalProgress.inHarbourMs = 0;
  }
  if (state.goalProgress.kind === 'gather') {
    state.goalProgress.clusterMs = 0;
    state.goalProgress.clusterCount = 0;
  }
}
