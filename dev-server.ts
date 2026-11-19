// `make dev`: serves the repo as GitHub Pages does (so ?src=examples/... works), on localhost: a secure context
// (so the clipboard works) with a real host for copied links. Existing .md and .card.json files in the repo can be
// written back with PUT (File → Save / Autosave), like the hoshin-kanri CLI. Refuses any other Host (DNS rebinding).
import { rename } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const port = Number(process.env.PORT ?? 8000);
const root = resolve('.');
const hosts = new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);
/** A repo file the viewer may overwrite: markdown or card settings, inside the repo. */
const writable = (abs: string) => abs.startsWith(root + sep) && /\.(md|card\.json)$/i.test(abs);

const s = Bun.serve({
  hostname: 'localhost',
  port,
  async fetch(req) {
    if (!hosts.has(req.headers.get('host') ?? '')) return new Response('Forbidden host', { status: 403 });
    const p = decodeURIComponent(new URL(req.url).pathname);
    const abs = resolve('.' + (p.endsWith('/') ? p + 'index.html' : p));
    if (req.method === 'PUT') {
      // Cross-site pages cannot get here: a PUT needs a CORS preflight, which this server never answers.
      if (!writable(abs) || !(await Bun.file(abs).exists())) return new Response('Not writable', { status: 403 });
      const tmp = `${abs}.hk-tmp`;
      await Bun.write(tmp, await req.arrayBuffer());
      await rename(tmp, abs); // whole file or nothing
      return new Response(null, { status: 204 });
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return new Response('Method not allowed', { status: 405 });
    const f = Bun.file(abs);
    // x-hoshin-kanri-writable tells the viewer it can offer Save (a PUT back to this URL).
    if (abs.startsWith(root + sep) && (await f.exists())) return new Response(f, { headers: { 'cache-control': 'no-store', ...(writable(abs) ? { 'x-hoshin-kanri-writable': '1' } : {}) } });
    return new Response('Not found', { status: 404 });
  }
});
console.log(`Serving on ${s.url.href} (Ctrl-C to stop)`);
