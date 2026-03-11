import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, range, accept-encoding",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Expose-Headers": "content-range, content-length, content-type",
};

const UPSTREAM = "https://stellarium-web.org/";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    // The path after the function name becomes the upstream path
    // e.g. /stellarium-proxy/stars/... → stars/...
    const pathMatch = url.pathname.match(/\/stellarium-proxy\/(.*)/);
    const subPath = pathMatch?.[1] ?? "";
    const query = url.search || "";
    const upstream = `${UPSTREAM}${subPath}${query}`;

    console.log(`Proxying: ${upstream}`);

    // Forward relevant headers
    const headers: Record<string, string> = {
      "User-Agent": "StellariumProxy/1.0",
    };
    const range = req.headers.get("range");
    if (range) headers["Range"] = range;
    const accept = req.headers.get("accept");
    if (accept) headers["Accept"] = accept;
    const acceptEncoding = req.headers.get("accept-encoding");
    if (acceptEncoding) headers["Accept-Encoding"] = acceptEncoding;

    const resp = await fetch(upstream, { headers });

    if (!resp.ok && resp.status !== 206) {
      return new Response(`Upstream error: ${resp.status}`, {
        status: resp.status,
        headers: corsHeaders,
      });
    }

    // Stream the response body
    const responseHeaders: Record<string, string> = { ...corsHeaders };
    const ct = resp.headers.get("content-type");
    if (ct) responseHeaders["Content-Type"] = ct;
    const cl = resp.headers.get("content-length");
    if (cl) responseHeaders["Content-Length"] = cl;
    const cr = resp.headers.get("content-range");
    if (cr) responseHeaders["Content-Range"] = cr;
    // Cache for 1 day
    responseHeaders["Cache-Control"] = "public, max-age=86400";

    return new Response(resp.body, {
      status: resp.status,
      headers: responseHeaders,
    });
  } catch (e) {
    console.error("Proxy error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
