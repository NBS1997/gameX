export type LunarPhase = 'waxing-crescent' | 'full' | 'waning-gibbous' | 'last-quarter';
export type ReceiverType = 'boat' | 'lantern';
export type GoalKind = 'guide' | 'gather' | 'send' | 'still';

export interface Vec2 {
  x: number;
  y: number;
}

export interface SpawnDef {
  type: ReceiverType;
  id: string;
  position: Vec2;
}

export interface BayBase {
  id: string;
  size: { width: number; height: number };
  ambient: SpawnDef[];
}

export interface GuideGoal {
  kind: 'guide';
  target: { x: number; y: number; radius: number };
}

export interface GatherGoal {
  kind: 'gather';
  clusterRadius: number;
  minCount: number;
}

export interface SendGoal {
  kind: 'send';
  edge: 'north' | 'south' | 'east' | 'west';
  minCount: number;
}

export interface StillGoal {
  kind: 'still';
  proximityRadius: number;
  hardRadius: number;
  dwellSeconds: number;
}

export type Goal = GuideGoal | GatherGoal | SendGoal | StillGoal;

export interface AmbientDef {
  fire?: Vec2;
  heron?: Vec2;
}

export interface NightDelta {
  lunarPhase: LunarPhase;
  pullStrength: number;
  pullRadius: number;
  spawns: SpawnDef[];
  goal: Goal;
  ambient?: AmbientDef;
}

export interface LevelDef {
  base: BayBase;
  night: NightDelta;
}

export type NightNumber = 1 | 2 | 3 | 4;
