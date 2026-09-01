import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

export interface DsaQuestion {
  id: string;
  index: number;
  title: string;
  url: string;
  platform: string;
  category: string;
  difficulty?: "Easy" | "Medium" | "Hard" | string;
  acceptance?: string;
  premium?: boolean;
}

export interface DsaTrack {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  description: string;
  count: number;
  questions: DsaQuestion[];
}

export interface DsaDataset {
  tracks: DsaTrack[];
}

const DATA_FILE = join(process.cwd(), "data", "dsa.json");

let cachedData: DsaDataset | null = null;

export function getDsaData(): DsaDataset {
  if (cachedData) return cachedData;

  if (!existsSync(DATA_FILE)) {
    return { tracks: [] };
  }

  try {
    const raw = readFileSync(DATA_FILE, "utf8");
    cachedData = JSON.parse(raw) as DsaDataset;
    return cachedData;
  } catch (err) {
    console.error("Failed to load data/dsa.json:", err);
    return { tracks: [] };
  }
}

export function getDsaTrack(trackId: string): DsaTrack | undefined {
  const data = getDsaData();
  return data.tracks.find((t) => t.id === trackId);
}

export function getAllDsaTracks(): DsaTrack[] {
  return getDsaData().tracks;
}
