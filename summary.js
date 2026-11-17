#!/usr/bin/env node
// Writes badge.svg and summary.svg for an X-Matrix markdown file, from its
// "> Last updated YYYY-MM-DD: slug" line (stamped by the viewer's Download).
//   node summary.js [x-matrix.md] [out-dir] [show]
// `show` as in summary.html: item (badge default: category : item) | crumb (summary default) |
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

module.exports = { C, parse };

if (require.main === module) {
  const file = process.argv[2] || 'x-matrix.md';
  const out = process.argv[3] || path.dirname(file);
  const model = parse(fs.readFileSync(file, 'utf8'));
  fs.writeFileSync(path.join(out, 'badge.svg'), C.badgeSvg(model, process.argv[4]));
  fs.writeFileSync(path.join(out, 'summary.svg'), C.summarySvg(model, process.argv[4]));
}
