import type { NightNumber, ReceiverType } from '../level/types.ts';
import type { PersistedGhost, PersistedMeta } from './meta.ts';

const SAVE_KEY = 'neap/save/v3';
const LEGACY_KEY_V2 = 'neap/save/v2';
const LEGACY_KEY_V1 = 'tide-pull/save/v1';

interface SaveDataV1 {
  version: 1;
  completedNights: NightNumber[];
  freeReentry: boolean;
}

interface SaveDataV2 {
  version: 2;
  completedNights: NightNumber[];
  freeReentry: boolean;
  ghosts: PersistedGhost[];
}

interface SaveDataV3 {
  version: 3;
  completedNights: NightNumber[];
  freeReentry: boolean;
  ghosts: PersistedGhost[];
}

const EMPTY: PersistedMeta = {
  completedNights: [],
  freeReentry: false,
  ghosts: [],
};

export function loadSave(): PersistedMeta {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveDataV3>;
      if (parsed.version === 3) {
        return {
          completedNights: filterNights(parsed.completedNights),
          freeReentry: Boolean(parsed.freeReentry),
          ghosts: filterGhosts(parsed.ghosts),
        };
      }
    }
  } catch {
    // Fall through.
  }

  try {
    const raw = localStorage.getItem(LEGACY_KEY_V2);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SaveDataV2>;
      if (parsed.version === 2) {
        const migrated: PersistedMeta = {
          completedNights: filterNights(parsed.completedNights),
          freeReentry: Boolean(parsed.freeReentry),
          ghosts: filterGhosts(parsed.ghosts),
        };
        writeSave(migrated);
        return migrated;
      }
    }
  } catch {
    // Fall through.
  }

  try {
    const raw = localStorage.getItem(LEGACY_KEY_V1);
    if (!raw) return { ...EMPTY };
    const parsed = JSON.parse(raw) as Partial<SaveDataV1>;
    if (parsed.version !== 1) return { ...EMPTY };
    const migrated: PersistedMeta = {
      completedNights: filterNights(parsed.completedNights),
      freeReentry: Boolean(parsed.freeReentry),
      ghosts: [],
    };
    writeSave(migrated);
    return migrated;
  } catch {
    return { ...EMPTY };
  }
}

export function writeSave(persisted: PersistedMeta): void {
  const data: SaveDataV3 = {
    version: 3,
    completedNights: persisted.completedNights,
    freeReentry: persisted.freeReentry,
    ghosts: persisted.ghosts,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Quota / disabled storage stays non-fatal.
  }
}

function filterNights(input: unknown): NightNumber[] {
  if (!Array.isArray(input)) return [];
  return input.filter(
    (n): n is NightNumber => n === 1 || n === 2 || n === 3 || n === 4,
  );
}

const RECEIVER_TYPES: readonly ReceiverType[] = ['boat', 'lantern'];

function filterGhosts(input: unknown): PersistedGhost[] {
  if (!Array.isArray(input)) return [];
  return input.filter((g): g is PersistedGhost => {
    if (typeof g !== 'object' || g === null) return false;
    const obj = g as Record<string, unknown>;
    return (
      (obj.night === 1 || obj.night === 2 || obj.night === 3 || obj.night === 4) &&
      typeof obj.x === 'number' &&
      typeof obj.y === 'number' &&
      typeof obj.type === 'string' &&
      RECEIVER_TYPES.includes(obj.type as ReceiverType)
    );
  });
}
