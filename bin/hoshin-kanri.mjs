#!/usr/bin/env node
// hoshin-kanri <x-matrix.md>: serves the viewer and that file on localhost, then opens it in the browser.
// The file is re-read on every request, so reloading the page shows your latest edits.
// hoshin-kanri badge <x-matrix.md> [out-dir] [show]: writes badge.svg and summary.svg (out-dir defaults to the file's folder).
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { basename, dirname, join, resolve } from 'node:path';

if (process.argv[2] === 'badge') {
  const [md, out = dirname(md ?? ''), show] = process.argv.slice(3);
  if (!md) { console.error('Usage: hoshin-kanri badge <x-matrix.md> [out-dir] [show]'); process.exit(1); }
  const { C, parse } = createRequire(import.meta.url)('../summary.js');
  try {
    const model = parse(await readFile(md, 'utf8'));
    await writeFile(join(out, 'badge.svg'), C.badgeSvg(model, show));
    await writeFile(join(out, 'summary.svg'), C.summarySvg(model, show));
    console.log(`Wrote ${join(out, 'badge.svg')} and ${join(out, 'summary.svg')}`);
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
  process.exit(file ? 0 : 1);
}
const path = resolve(file);
await readFile(path).catch((e) => { console.error(`hoshin-kanri: cannot read ${file}: ${e.message}`); process.exit(1); });

const route = '/' + encodeURIComponent(basename(path));
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
};

const server = createServer(async (req, res) => {
  const [target, type] = routes[new URL(req.url, 'http://x').pathname] ?? [];
  if (!target) return res.writeHead(404).end('Not found');
  try {
    res.writeHead(200, { 'content-type': `${type}; charset=utf-8`, 'cache-control': 'no-store' }).end(await readFile(target));
  } catch (e) {
    res.writeHead(500).end(e.message);
  }
});

server.listen(Number(process.env.PORT ?? 0), 'localhost', () => {
  const url = `http://localhost:${server.address().port}/?src=${route}`;
  console.log(`Serving ${file} at ${url}  (Ctrl-C to stop)`);
  if (process.env.NO_OPEN) return;
  const [cmd, args] = process.platform === 'darwin' ? ['open', [url]] : process.platform === 'win32' ? ['cmd', ['/c', 'start', '', url]] : ['xdg-open', [url]];
  spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
});
