import type { NightNumber, ReceiverType } from '../level/types.ts';
import type { ReceiverInstance } from './gameState.ts';

export interface PersistedGhost {
  night: NightNumber;
  type: ReceiverType;
  x: number;
  y: number;
}

export interface PersistedMeta {
  completedNights: NightNumber[];
  freeReentry: boolean;
  ghosts: PersistedGhost[];
}

export interface MetaState {
  completedNights: Set<NightNumber>;
  freeReentry: boolean;
  sessionGhosts: Map<NightNumber, ReceiverInstance[]>;
  persistedGhosts: PersistedGhost[];
}

export function createMetaState(persisted: PersistedMeta): MetaState {
  return {
    completedNights: new Set(persisted.completedNights),
    freeReentry: persisted.freeReentry,
    sessionGhosts: new Map(),
    persistedGhosts: [...persisted.ghosts],
  };
}

export function metaToPersisted(meta: MetaState): PersistedMeta {
  return {
    completedNights: Array.from(meta.completedNights),
    freeReentry: meta.freeReentry,
    ghosts: [...meta.persistedGhosts],
  };
}

export function recordNightComplete(
  meta: MetaState,
  night: NightNumber,
  finalReceivers: readonly ReceiverInstance[],
): void {
  meta.completedNights.add(night);
  meta.sessionGhosts.set(
    night,
    finalReceivers.map((r) => ({
      id: r.id,
      type: r.type,
      position: { x: r.position.x, y: r.position.y },
      velocity: { x: 0, y: 0 },
      initial: { x: r.initial.x, y: r.initial.y },
      sent: r.sent,
    })),
  );

  meta.persistedGhosts = meta.persistedGhosts.filter((g) => g.night !== night);
  for (const r of finalReceivers) {
    if (r.sent) continue;
    meta.persistedGhosts.push({
      night,
      type: r.type,
      x: r.position.x,
      y: r.position.y,
    });
  }

  if (meta.completedNights.size === 4) {
    meta.freeReentry = true;
  }
}

export function nextLinearNight(meta: MetaState): NightNumber | null {
  if (!meta.completedNights.has(1)) return 1;
  if (!meta.completedNights.has(2)) return 2;
  if (!meta.completedNights.has(3)) return 3;
  if (!meta.completedNights.has(4)) return 4;
  return null;
}

export function ghostsForNight(
  meta: MetaState,
  night: NightNumber,
): ReceiverInstance[] {
  const out: ReceiverInstance[] = [];

  for (const [n, receivers] of meta.sessionGhosts) {
    if (n < night) out.push(...receivers);
  }

  for (const g of meta.persistedGhosts) {
    if (g.night >= night) continue;
    if (meta.sessionGhosts.has(g.night)) continue;
    out.push({
      id: `persisted-${g.night}-${g.type}-${g.x}-${g.y}`,
      type: g.type,
      position: { x: g.x, y: g.y },
      velocity: { x: 0, y: 0 },
      initial: { x: g.x, y: g.y },
      sent: false,
    });
  }

  return out;
}

export function allGhostsForPicker(meta: MetaState): ReceiverInstance[] {
  const out: ReceiverInstance[] = [];
  for (const [, receivers] of meta.sessionGhosts) {
    out.push(...receivers);
  }
  for (const g of meta.persistedGhosts) {
    if (meta.sessionGhosts.has(g.night)) continue;
    out.push({
      id: `persisted-${g.night}-${g.type}-${g.x}-${g.y}`,
      type: g.type,
      position: { x: g.x, y: g.y },
      velocity: { x: 0, y: 0 },
      initial: { x: g.x, y: g.y },
      sent: false,
    });
  }
  return out;
}
