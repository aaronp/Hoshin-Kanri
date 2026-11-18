#!/usr/bin/env node
// hoshin-kanri <x-matrix.md>: serves the viewer and that file on localhost, then opens it in the browser.
// The file is re-read on every request, so reloading the page shows your latest edits; Save writes it back (PUT).
// hoshin-kanri badge <x-matrix.md> [out-dir] [show]: writes badge.svg and summary.svg (out-dir defaults to the file's folder).
// Both read the optional card settings beside the markdown, <name>.card.json, made in the card designer (summary.html).
// hoshin-kanri card <x-matrix.md> [out-dir]: writes card.json, the plan as a dashboard card (the format `adr card` writes).
// The card's links open the viewer at HK_HOST (default https://aaronp.github.io/Hoshin-Kanri/) with ?src=HK_SRC,
// where HK_SRC is where the published markdown lives (default: the path given, relative to HK_HOST).
import { createServer } from 'node:http';
import { readFile, rename, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';

if (process.argv[2] === 'badge' || process.argv[2] === 'card') {
  const cmd = process.argv[2];
  const [md, out = dirname(md ?? ''), show] = process.argv.slice(3);
  if (!md) { console.error(`Usage: hoshin-kanri ${cmd} <x-matrix.md> [out-dir]${cmd === 'badge' ? ' [show]' : ''}`); process.exit(1); }
  const { snapshotFile } = createRequire(import.meta.url)('../summary.js');
  try {
    const s = snapshotFile(md, { src: process.env.HK_SRC || md, host: process.env.HK_HOST || undefined, show });
    const files = cmd === 'card' ? { 'card.json': JSON.stringify(s.card, null, 2) + '\n' } : { 'badge.svg': s.badge, 'summary.svg': s.summary };
    for (const [name, body] of Object.entries(files)) await writeFile(join(out, name), body);
    console.log(`Wrote ${Object.keys(files).map((n) => join(out, n)).join(' and ')}`);
  } catch (e) {
    console.error(`hoshin-kanri: ${md}: ${e.message}`);
    process.exit(1);
  }
  process.exit(0);
}

const file = process.argv[2];
if (!file || file === '-h' || file === '--help') {
  console.error('Usage: hoshin-kanri <x-matrix.md>   (PORT=8000 to pick the port, NO_OPEN=1 to skip opening a browser)');
  console.error('       hoshin-kanri badge <x-matrix.md> [out-dir] [show]   (writes badge.svg and summary.svg)');
  console.error('       hoshin-kanri card <x-matrix.md> [out-dir]           (writes card.json)');
  console.error('       Both read <name>.card.json beside the markdown if present (made in the card designer).');
  process.exit(file ? 0 : 1);
}
const path = resolve(file);
await readFile(path).catch((e) => { console.error(`hoshin-kanri: cannot read ${file}: ${e.message}`); process.exit(1); });

const route = '/' + encodeURIComponent(basename(path));
const sidecar = path.replace(/\.md$/i, '') + '.card.json';
const pkg = (p) => new URL('../' + p, import.meta.url);
const js = 'text/javascript';
// A fixed set of routes, so nothing else on disk is reachable.
const routes = {
  '/': [pkg('Main.dc.html'), 'text/html'],
  '/Main.dc.html': [pkg('Main.dc.html'), 'text/html'],
  '/summary.html': [pkg('summary.html'), 'text/html'],
  '/support.js': [pkg('support.js'), js],
  '/vendor/react.js': [pkg('vendor/react.js'), js],
  '/vendor/react-dom.js': [pkg('vendor/react-dom.js'), js],
  [route]: [path, 'text/markdown'],
  ['/' + encodeURIComponent(basename(sidecar))]: [sidecar, 'application/json'],
};

// Loopback names a browser may use for this server. Anything else in Host means DNS rebinding, so it is refused.
const hosts = (port) => new Set([`127.0.0.1:${port}`, `localhost:${port}`, `[::1]:${port}`]);
const server = createServer(async (req, res) => {
  if (!hosts(server.address().port).has(req.headers.host)) return res.writeHead(403).end('Forbidden host');
  const [target, type] = routes[new URL(req.url, 'http://x').pathname] ?? [];
  if (!target) return res.writeHead(404).end('Not found');
  const isFile = target === path || target === sidecar;
  if (req.method === 'PUT' && isFile) {
    // Cross-site pages cannot get here: a PUT needs a CORS preflight, which this server never answers.
    try {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      const body = Buffer.concat(chunks);
      if (target === sidecar) JSON.parse(body.toString('utf8')); // never save settings the CLI could not read
      const tmp = `${target}.hk-tmp`;
      await writeFile(tmp, body);
      await rename(tmp, target); // whole file or nothing, never half-written
      return res.writeHead(204).end();
    } catch (e) {
      return res.writeHead(e instanceof SyntaxError ? 400 : 500).end(e.message);
    }
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') return res.writeHead(405).end('Method not allowed');
  try {
    // x-hoshin-kanri-writable tells the viewer it can offer Save (a PUT back to this URL).
    res.writeHead(200, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store', ...(isFile ? { 'x-hoshin-kanri-writable': '1' } : {}) }).end(await readFile(target));
  } catch (e) {
    // A missing sidecar is still writable: the designer can Save the first one.
    res.writeHead(e.code === 'ENOENT' ? 404 : 500, isFile ? { 'x-hoshin-kanri-writable': '1' } : {}).end(e.message);
  }
});

server.listen(Number(process.env.PORT ?? 0), 'localhost', () => {
  const url = `http://localhost:${server.address().port}/?src=${route}`;
  console.log(`Serving ${file} at ${url}  (Ctrl-C to stop)`);
  if (process.env.NO_OPEN) return;
  const [cmd, args] = process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
  spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
});
