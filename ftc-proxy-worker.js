/**
 * FTC Events API CORS Proxy — Cloudflare Worker
 *
 * Forwards requests to https://ftc-api.firstinspires.org/v2.0/...
 * and adds CORS headers so your browser app can call it directly.
 *
 * Deploy:
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler deploy
 *
 * Usage in your app (replace CORS_PROXY line):
 *   const CORS_PROXY = 'https://ftc-proxy.<your-subdomain>.workers.dev/';
 *
 * Then fetch like:
 *   fetch(CORS_PROXY + path, { headers: { 'Authorization': 'Basic ...' } })
 * e.g.:
 *   fetch('https://ftc-proxy.<your-subdomain>.workers.dev/2025/events')
 */

const FTC_API_BASE = 'https://ftc-api.firstinspires.org/v2.0';

// Optional: lock down which origins can call your proxy.
// Set to ['*'] to allow all origins (fine for a personal tool).
const ALLOWED_ORIGINS = ['*'];

export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse(null, 204);
    }

    const url = new URL(request.url);

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return corsResponse(JSON.stringify({ ok: true, proxy: 'ftc-api' }), 200);
    }

    // Build upstream URL: strip leading slash, forward path + query
    const upstreamPath = url.pathname.replace(/^\//, '') + url.search;
    const upstreamUrl  = `${FTC_API_BASE}/${upstreamPath}`;

    // Forward only safe headers to upstream (don't leak Worker internals)
    const forwardHeaders = new Headers();
    const auth   = request.headers.get('Authorization');
    const accept = request.headers.get('Accept');
    if (auth)   forwardHeaders.set('Authorization', auth);
    if (accept) forwardHeaders.set('Accept', accept);
    forwardHeaders.set('User-Agent', 'ftc-epa-proxy/1.0');

    let upstreamRes;
    try {
      upstreamRes = await fetch(upstreamUrl, {
        method:  request.method,
        headers: forwardHeaders,
        // Don't forward body for GET/HEAD
        body: ['POST', 'PUT', 'PATCH'].includes(request.method)
          ? request.body
          : undefined,
      });
    } catch (err) {
      return corsResponse(
        JSON.stringify({ error: 'Upstream fetch failed', detail: err.message }),
        502
      );
    }

    // Stream the upstream body back with CORS headers attached
    const responseHeaders = new Headers(upstreamRes.headers);
    addCorsHeaders(responseHeaders, request);

    return new Response(upstreamRes.body, {
      status:  upstreamRes.status,
      headers: responseHeaders,
    });
  },
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function addCorsHeaders(headers, request) {
  const origin = request.headers.get('Origin') || '*';
  const allowed =
    ALLOWED_ORIGINS.includes('*') || ALLOWED_ORIGINS.includes(origin)
      ? origin
      : ALLOWED_ORIGINS[0];

  headers.set('Access-Control-Allow-Origin',  allowed);
  headers.set('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Authorization, Accept, Content-Type');
  headers.set('Access-Control-Max-Age',       '86400');
  // Let the browser cache responses for 5 minutes (FTC data doesn't change per-second)
  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
}

function corsResponse(body, status) {
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Accept, Content-Type',
  });
  return new Response(body, { status, headers });
}
