import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, range, accept, accept-encoding",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Expose-Headers": "content-range, content-length, content-type"
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = new URL(req.url);
    let target = url.searchParams.get('target');

    if (!target) {
       const pathMatch = url.pathname.match(/\/stellarium-proxy\/(.*)/);
       const subPath = pathMatch ? pathMatch[1] : "";
       const query = url.search;
       target = `https://data.stellarium.org/${subPath}${query}`;
    }

    const requestHeaders = new Headers();
    if (req.headers.has('range')) requestHeaders.set('range', req.headers.get('range')!);
    if (req.headers.has('accept')) requestHeaders.set('accept', req.headers.get('accept')!);

    const resp = await fetch(target, { method: req.method, headers: requestHeaders });
    const body = await resp.arrayBuffer();

    const responseHeaders = new Headers(corsHeaders);
    responseHeaders.set('content-type', resp.headers.get('content-type') || 'application/octet-stream');
    if (resp.headers.has('content-range')) responseHeaders.set('content-range', resp.headers.get('content-range')!);
    if (resp.headers.has('content-length')) responseHeaders.set('content-length', resp.headers.get('content-length')!);
    responseHeaders.set('Cache-Control', 'public, max-age=86400');

    return new Response(body, { status: resp.status, headers: responseHeaders });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
