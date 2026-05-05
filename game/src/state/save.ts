import type { NightNumber } from '../level/types.ts';
import type { PersistedMeta } from './meta.ts';

const SAVE_KEY = 'tide-pull/save/v1';

interface SaveDataV1 {
  version: 1;
  completedNights: NightNumber[];
  freeReentry: boolean;
}

const EMPTY: SaveDataV1 = {
  version: 1,
  completedNights: [],
  freeReentry: false,
};

export function loadSave(): PersistedMeta {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return toMeta(EMPTY);
    const parsed = JSON.parse(raw) as Partial<SaveDataV1>;
    if (parsed.version !== 1) return toMeta(EMPTY);
    const completed = (parsed.completedNights ?? []).filter(
      (n): n is NightNumber => n === 1 || n === 2 || n === 3,
    );
    return {
      completedNights: completed,
      freeReentry: Boolean(parsed.freeReentry),
    };
  } catch {
    return toMeta(EMPTY);
  }
}

export function writeSave(persisted: PersistedMeta): void {
  const data: SaveDataV1 = {
    version: 1,
    completedNights: persisted.completedNights,
    freeReentry: persisted.freeReentry,
  };
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Ignore — quota exceeded or storage disabled is non-fatal.
  }
}

function toMeta(data: SaveDataV1): PersistedMeta {
  return {
    completedNights: data.completedNights,
    freeReentry: data.freeReentry,
  };
}
