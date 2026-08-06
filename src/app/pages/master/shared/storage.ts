
const VEHICLE_STORAGE_KEY = "vehicle-master-entries-v2";
const VISITOR_STORAGE_KEY = "visitor-master-entries-v2";

function writeStorage<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function normalizeGate(value: string | undefined): string {
  if (!value) return "";
  const map: Record<string, string> = {
    "Gate 1": "gate-1",
    "Gate 2": "gate-2",
    "Gate 3": "gate-3",
  };
  return map[value] || value;
}

function normalizeStatus(value: string | undefined): string {
  if (!value) return "HOLD";
  const map: Record<string, string> = {
    inside: "IN",
    exited: "OUT",
    in: "IN",
    out: "OUT",
    hold: "HOLD",
  };
  return map[value.toLowerCase()] || value.toUpperCase();
}

function normalizeIdProof(value: string | undefined): string {
  if (!value) return "";
  const map: Record<string, string> = {
    aadhar: "aadhaar",
    aadhaar: "aadhaar",
    pan: "pan",
    driving_license: "driving-license",
    "driving-license": "driving-license",
    voter_id: "voter-id",
    "voter-id": "voter-id",
    passport: "passport",
  };
  return map[value] || value;
}

function readLegacyKeys(key: string): unknown[] | null {
  const legacyKeys: Record<string, string[]> = {
    [VEHICLE_STORAGE_KEY]: ["vehicle-master-entries"],
    [VISITOR_STORAGE_KEY]: ["visitor-master-entries"],
  };

  for (const legacyKey of legacyKeys[key] || []) {
    const raw = localStorage.getItem(legacyKey);
    if (raw) {
      try {
        return JSON.parse(raw) as unknown[];
      } catch {
        return null;
      }
    }
  }

  return null;
}

function readStorage<T>(
  key: string,
  seed: T[],
  normalize: (raw: Record<string, unknown>) => T,
): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, unknown>[];
      return parsed.map(normalize);
    }

    const legacy = readLegacyKeys(key);
    if (legacy?.length) {
      const migrated = legacy.map((item) =>
        normalize(item as Record<string, unknown>),
      );
      writeStorage(key, migrated);
      return migrated;
    }

    writeStorage(key, seed);
    return seed;
  } catch {
    writeStorage(key, seed);
    return seed;
  }
}

export function createMasterStorage<T>(
  key: string,
  seed: T[],
  normalize: (raw: Record<string, unknown>) => T,
) {
  return {
    getItems(): T[] {
      return readStorage(key, seed, normalize);
    },
    saveItems(items: T[]): void {
      writeStorage(key, items);
    },
  };
}
