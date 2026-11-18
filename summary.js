#!/usr/bin/env node
// Writes badge.svg, summary.svg and card.json for an X-Matrix markdown file, from its
// "> Last updated YYYY-MM-DD: slug" line (stamped by the viewer's Download / Save) and the optional
// card settings beside it, <name>.card.json (made in the card designer, summary.html).
//   node summary.js [x-matrix.md] [out-dir] [show]
// `show` overrides the settings: card (badge default: the card's counts) | item | crumb (summary default) |
// last (the last change's section) | <section slug>.
'use strict';
const fs = require('fs');
const path = require('path');

// All the logic lives in Main.dc.html (next to this file), shared with the viewer.
function loadComponent() {
  const html = fs.readFileSync(path.join(__dirname, 'Main.dc.html'), 'utf8');
  const js = /<script[^>]*data-dc-script[^>]*>([\s\S]*?)<\/script>/.exec(html)[1];
  return new Function('DCLogic', js + '\nreturn Component;')(class {});
}
const C = loadComponent();

function parse(md) {
  const r = C.parseMd(md);
  if (!r.ok) throw new Error('line ' + r.error.line + ': ' + r.error.message);
  return r.model;
}

/** x-matrix.md → x-matrix.card.json */
const sidecarOf = (md) => md.replace(/\.md$/i, '') + '.card.json';

/** Reads the markdown and its sidecar (if any): { card, badge, summary }. Sidecar warnings are errors here. */
function snapshotFile(file, opts) {
  opts = opts || {};
  const model = parse(fs.readFileSync(file, 'utf8'));
  let prefs = {};
  try {
    const r = C.parsePrefs(JSON.parse(fs.readFileSync(sidecarOf(file), 'utf8')), model);
    if (r.warnings.length) throw new Error(r.warnings.join('; '));
    prefs = r.prefs;
  } catch (e) {
    if (e.code !== 'ENOENT') throw new Error(sidecarOf(file) + ': ' + e.message);
  }
  const today = new Date().toLocaleDateString('en-CA');
  return C.cardSnapshot(model, prefs, { label: file, src: opts.src || file }, opts.host, today, opts.show);
}

module.exports = { C, parse, sidecarOf, snapshotFile };

if (require.main === module) {
  const file = process.argv[2] || 'x-matrix.md';
  const out = process.argv[3] || path.dirname(file);
  const s = snapshotFile(file, { show: process.argv[4] });
  fs.writeFileSync(path.join(out, 'badge.svg'), s.badge);
  fs.writeFileSync(path.join(out, 'summary.svg'), s.summary);
  fs.writeFileSync(path.join(out, 'card.json'), JSON.stringify(s.card, null, 2) + '\n');
}
