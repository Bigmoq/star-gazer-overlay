// Local star registry store using localStorage
// Ready to be replaced with Supabase when connected

export interface StarRecord {
  id: string;
  code: string; // unique search code (e.g. "HD12323")
  customName: string; // customer name (e.g. "لمى")
  originalName: string; // original catalog name
  message: string; // personal message
  date: string; // dedication date
  magnitude: number;
  distance: string;
  spectralClass: string;
  constellation: string;
  stellariumUrl: string;
  createdAt: string;
}

const STORAGE_KEY = "star_registry";

function getAll(): StarRecord[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : getSampleData();
  } catch {
    return getSampleData();
  }
}

function save(records: StarRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function findByCode(code: string): StarRecord | undefined {
  const all = getAll();
  return all.find((s) => s.code.toLowerCase() === code.toLowerCase());
}

export function addStar(star: Omit<StarRecord, "id" | "createdAt">): StarRecord {
  const all = getAll();
  const record: StarRecord = {
    ...star,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(record);
  save(all);
  return record;
}

export function getAllStars(): StarRecord[] {
  return getAll();
}

export function deleteStar(id: string) {
  const all = getAll().filter((s) => s.id !== id);
  save(all);
}

function getSampleData(): StarRecord[] {
  const sample: StarRecord[] = [
    {
      id: "sample-1",
      code: "SAO1818",
      customName: "ساره",
      originalName: "SAO 1818 (BD+82 324)",
      message: "نجمة مميزة لشخص مميز ✨",
      date: "2024-12-25",
      magnitude: 10.37,
      distance: "617 سنة ضوئية",
      spectralClass: "F0",
      constellation: "Draco",
      stellariumUrl: "https://stellarium-web.org/skysource/SAO1818?fov=0.5",
      createdAt: new Date().toISOString(),
    },
  ];
  save(sample);
  return sample;
}

// SQL schema for Supabase (for future use):
export const SUPABASE_SQL = `
CREATE TABLE star_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  custom_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  message TEXT DEFAULT '',
  date DATE NOT NULL,
  magnitude NUMERIC(5,2),
  distance TEXT,
  spectral_class TEXT,
  constellation TEXT,
  stellarium_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE star_registry ENABLE ROW LEVEL SECURITY;

-- Allow public read by code
CREATE POLICY "Public can search by code"
  ON star_registry FOR SELECT
  USING (true);

-- Index for fast search
CREATE INDEX idx_star_code ON star_registry (code);
`;
