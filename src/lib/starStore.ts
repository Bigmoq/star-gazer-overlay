import { supabase } from "./supabaseClient";

export interface StarRecord {
  id: string;
  code: string;
  customName: string;
  originalName: string;
  message: string;
  date: string;
  magnitude: number;
  distance: string;
  spectralClass: string;
  constellation: string;
  stellariumUrl: string;
  createdAt: string;
  raRad: number | null;
  decRad: number | null;
}

interface DbRow {
  id: string;
  code: string;
  custom_name: string;
  original_name: string;
  message: string;
  date: string;
  magnitude: number;
  distance: string;
  spectral_class: string;
  constellation: string;
  stellarium_url: string;
  created_at: string;
  ra_rad: number | null;
  dec_rad: number | null;
}

function rowToStar(row: DbRow): StarRecord {
  return {
    id: row.id,
    code: row.code,
    customName: row.custom_name,
    originalName: row.original_name,
    message: row.message,
    date: row.date,
    magnitude: row.magnitude,
    distance: row.distance,
    spectralClass: row.spectral_class,
    constellation: row.constellation,
    stellariumUrl: row.stellarium_url,
    createdAt: row.created_at,
    raRad: row.ra_rad,
    decRad: row.dec_rad,
  };
}

// Demo data for immediate functionality
const demoStars: StarRecord[] = [
  {
    id: "1",
    code: "SAO1818",
    customName: "ساره",
    originalName: "SAO 1818 (BD+82 324)",
    message: "نجمة مميزة لشخص مميز ✨ كل ما أنظر للسماء أتذكرك",
    date: "2024-12-25",
    magnitude: 10.37,
    distance: "617 سنة ضوئية",
    spectralClass: "F0",
    constellation: "Draco",
    stellariumUrl: "https://stellarium-web.org/skysource/SAO1818?fov=0.5",
    createdAt: "2024-12-25T00:00:00Z",
  },
  {
    id: "2",
    code: "HIP11767",
    customName: "عبدالله",
    originalName: "Polaris (Alpha Ursae Minoris)",
    message: "مثل نجم القطب، أنت دليلي في كل طريق 🌟",
    date: "2025-01-15",
    magnitude: 1.98,
    distance: "433 سنة ضوئية",
    spectralClass: "F7Ib",
    constellation: "Ursa Minor",
    stellariumUrl: "https://stellarium-web.org/skysource/HIP11767?fov=0.5",
    createdAt: "2025-01-15T00:00:00Z",
  },
  {
    id: "3",
    code: "HIP69673",
    customName: "لمى",
    originalName: "Arcturus (Alpha Boötis)",
    message: "أسطع نجوم السماء لأغلى إنسانة 💫",
    date: "2025-03-01",
    magnitude: -0.05,
    distance: "36.7 سنة ضوئية",
    spectralClass: "K1.5IIIFe",
    constellation: "Boötes",
    stellariumUrl: "https://stellarium-web.org/skysource/HIP69673?fov=0.5",
    createdAt: "2025-03-01T00:00:00Z",
  },
  {
    id: "4",
    code: "HIP32349",
    customName: "نوره",
    originalName: "Sirius (Alpha Canis Majoris)",
    message: "أنتِ مثل سيريوس، ألمع نجمة في سمائي 🌠 كل ليلة أرفع رأسي وأبتسم لأنك موجودة",
    date: "2026-03-12",
    magnitude: -1.46,
    distance: "8.6 سنة ضوئية",
    spectralClass: "A1V",
    constellation: "Canis Major",
    stellariumUrl: "https://stellarium-web.org/skysource/HIP32349?fov=0.5",
    createdAt: "2026-03-12T00:00:00Z",
  },
];

export async function findByCode(code: string): Promise<StarRecord | undefined> {
  // First try demo data
  const demoStar = demoStars.find(star => star.code.toLowerCase() === code.toLowerCase());
  if (demoStar) {
    return demoStar;
  }

  // Fallback to database
  const { data, error } = await supabase
    .from("star_registry")
    .select("*")
    .ilike("code", code)
    .maybeSingle();

  if (error || !data) return undefined;
  return rowToStar(data as DbRow);
}

export async function addStar(star: Omit<StarRecord, "id" | "createdAt">): Promise<StarRecord> {
  const { data, error } = await supabase
    .from("star_registry")
    .insert({
      code: star.code,
      custom_name: star.customName,
      original_name: star.originalName || star.code,
      message: star.message,
      date: star.date,
      magnitude: star.magnitude,
      distance: star.distance,
      spectral_class: star.spectralClass,
      constellation: star.constellation,
      stellarium_url: star.stellariumUrl,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToStar(data as DbRow);
}

export async function getAllStars(): Promise<StarRecord[]> {
  const { data, error } = await supabase
    .from("star_registry")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as DbRow[]).map(rowToStar);
}

export async function updateStar(id: string, star: Partial<Omit<StarRecord, "id" | "createdAt">>): Promise<StarRecord | null> {
  const updates: Record<string, unknown> = {};
  if (star.code !== undefined) updates.code = star.code;
  if (star.customName !== undefined) updates.custom_name = star.customName;
  if (star.originalName !== undefined) updates.original_name = star.originalName;
  if (star.message !== undefined) updates.message = star.message;
  if (star.date !== undefined) updates.date = star.date;
  if (star.magnitude !== undefined) updates.magnitude = star.magnitude;
  if (star.distance !== undefined) updates.distance = star.distance;
  if (star.spectralClass !== undefined) updates.spectral_class = star.spectralClass;
  if (star.constellation !== undefined) updates.constellation = star.constellation;
  if (star.stellariumUrl !== undefined) updates.stellarium_url = star.stellariumUrl;

  const { data, error } = await supabase
    .from("star_registry")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return null;
  return rowToStar(data as DbRow);
}

export async function deleteStar(id: string): Promise<void> {
  await supabase.from("star_registry").delete().eq("id", id);
}
