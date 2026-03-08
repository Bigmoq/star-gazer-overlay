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
  };
}

export async function findByCode(code: string): Promise<StarRecord | undefined> {
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

export async function deleteStar(id: string): Promise<void> {
  await supabase.from("star_registry").delete().eq("id", id);
}
