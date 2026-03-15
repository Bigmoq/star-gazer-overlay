const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q')?.trim();

    if (!query) {
      return new Response(
        JSON.stringify({ found: false, error: 'Missing query parameter "q"' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Query SIMBAD TAP service for object resolution
    const simbadQuery = `
      SELECT TOP 1
        basic.main_id AS name,
        basic.otype_longname AS object_type,
        basic.sp_type AS spectral_type,
        ra AS ra_deg,
        dec AS dec_deg,
        flux.flux AS vmag
      FROM basic
      LEFT JOIN flux ON basic.oid = flux.oidref AND flux.filter = 'V'
      WHERE basic.main_id = '${query.replace(/'/g, "''")}'
         OR oidref IN (SELECT oidref FROM ident WHERE id = '${query.replace(/'/g, "''")}')
      ORDER BY basic.oid
    `.trim();

    const tapUrl = `https://simbad.cds.unistra.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=${encodeURIComponent(simbadQuery)}`;
    
    const simbadResp = await fetch(tapUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!simbadResp.ok) {
      // Fallback: try simple sesame name resolver
      return await resolveBySesame(query, corsHeaders);
    }

    const simbadData = await simbadResp.json();
    const rows = simbadData?.data;

    if (!rows || rows.length === 0) {
      // Fallback to Sesame
      return await resolveBySesame(query, corsHeaders);
    }

    const row = rows[0];
    const name = row[0] || query;
    const objectType = row[1] || '';
    const spectralType = row[2] || '';
    const raDeg = row[3];
    const decDeg = row[4];
    const vmag = row[5];

    if (raDeg == null || decDeg == null) {
      return await resolveBySesame(query, corsHeaders);
    }

    // Get aliases (including Gaia Source ID)
    const aliasQuery = `SELECT id FROM ident WHERE oidref = (SELECT oidref FROM ident WHERE id = '${query.replace(/'/g, "''")}' FETCH FIRST 1 ROWS ONLY) FETCH FIRST 20 ROWS ONLY`;
    let aliases: string[] = [];
    let hip = '';
    let gaiaId = '';
    try {
      const aliasUrl = `https://simbad.cds.unistra.fr/simbad/sim-tap/sync?request=doQuery&lang=adql&format=json&query=${encodeURIComponent(aliasQuery)}`;
      const aliasResp = await fetch(aliasUrl);
      const aliasData = await aliasResp.json();
      aliases = (aliasData?.data || []).map((r: string[]) => r[0]);
      hip = aliases.find((a: string) => /^HIP\s?\d+/i.test(a)) || '';
      gaiaId = aliases.find((a: string) => /^Gaia\s+(DR[23]\s+)?\d+/i.test(a)) || '';
    } catch {}

    return new Response(
      JSON.stringify({
        found: true,
        name,
        object_type: objectType,
        spectral_type: spectralType,
        ra_deg: raDeg,
        dec_deg: decDeg,
        vmag: vmag != null ? vmag.toFixed(2) : null,
        hip,
        gaia_id: gaiaId,
        aliases,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ found: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function resolveBySesame(query: string, corsHeaders: Record<string, string>): Promise<Response> {
  try {
    const sesameUrl = `https://cdsweb.u-strasbg.fr/cgi-bin/nph-sesame/-ox/SNVA?${encodeURIComponent(query)}`;
    const resp = await fetch(sesameUrl);
    const xml = await resp.text();

    // Parse RA/Dec from XML
    const raMatch = xml.match(/<jradeg>([\d.]+)<\/jradeg>/);
    const decMatch = xml.match(/<jdedeg>([+-]?[\d.]+)<\/jdedeg>/);
    const nameMatch = xml.match(/<oname>([^<]+)<\/oname>/);
    const typeMatch = xml.match(/<otype>([^<]+)<\/otype>/);

    if (raMatch && decMatch) {
      const raDeg = parseFloat(raMatch[1]);
      const decDeg = parseFloat(decMatch[1]);
      const name = nameMatch ? nameMatch[1] : query;
      const objectType = typeMatch ? typeMatch[1] : '';

      // Try to find aliases
      const aliasMatches = xml.matchAll(/<alias>([^<]+)<\/alias>/g);
      const aliases = [...aliasMatches].map(m => m[1]);
      const hip = aliases.find(a => /^HIP\s?\d+/i.test(a)) || '';

      return new Response(
        JSON.stringify({
          found: true,
          name,
          object_type: objectType,
          spectral_type: '',
          ra_deg: raDeg,
          dec_deg: decDeg,
          vmag: null,
          hip,
          aliases,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ found: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch {
    return new Response(
      JSON.stringify({ found: false }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
