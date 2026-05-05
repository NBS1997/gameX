import type { NightNumber } from '../level/types.ts';
import type { ReceiverInstance } from './gameState.ts';

export interface MetaState {
  completedNights: Set<NightNumber>;
  freeReentry: boolean;
  sessionGhosts: Map<NightNumber, ReceiverInstance[]>;
}

export function createMetaState(persisted: PersistedMeta): MetaState {
  return {
    completedNights: new Set(persisted.completedNights),
    freeReentry: persisted.freeReentry,
    sessionGhosts: new Map(),
  };
}

export interface PersistedMeta {
  completedNights: NightNumber[];
  freeReentry: boolean;
}

export function metaToPersisted(meta: MetaState): PersistedMeta {
  return {
    completedNights: Array.from(meta.completedNights),
    freeReentry: meta.freeReentry,
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
  if (meta.completedNights.size === 3) {
    meta.freeReentry = true;
  }
}

export function nextLinearNight(meta: MetaState): NightNumber | null {
  if (!meta.completedNights.has(1)) return 1;
  if (!meta.completedNights.has(2)) return 2;
  if (!meta.completedNights.has(3)) return 3;
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
  return out;
}
