// Extract star identifier from a Stellarium URL
// e.g. "https://stellarium-web.org/skysource/SAO1818?fov=0.5" → "SAO1818"
export function extractStarIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/skysource\/([^?&#/]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

// Format the star code for display (add space before numbers if needed)
export function formatStarCode(id: string): string {
  // "SAO1818" → "SAO 1818", "HD12323" → "HD 12323"
  return id.replace(/([A-Za-z]+)(\d+)/, "$1 $2");
}

// Try to fetch star data from SIMBAD (CDS Strasbourg)
export async function fetchStarData(identifier: string): Promise<StarFetchResult | null> {
  try {
    // Use SIMBAD TAP query
    const query = `SELECT TOP 1 basic.OID, basic.main_id, basic.sp_type, basic.otype_txt, flux.V as vmag, ident.id 
FROM basic 
JOIN ident ON basic.oid = ident.oidref 
LEFT JOIN flux ON basic.oid = flux.oidref AND flux.filter = 'V'
WHERE ident.id = '${identifier.replace(/([A-Za-z]+)(\d+)/, "$1 $2")}'`;

    const url = `https://simbad.cds.unistra.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=${encodeURIComponent(query)}`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    
    const data = await res.json();
    const rows = data?.data;
    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    return {
      originalName: row[1] || identifier,
      spectralClass: row[2] || "",
      objectType: row[3] || "",
      magnitude: row[4] != null ? parseFloat(row[4]) : 0,
    };
  } catch {
    return null;
  }
}

export interface StarFetchResult {
  originalName: string;
  spectralClass: string;
  objectType: string;
  magnitude: number;
}
