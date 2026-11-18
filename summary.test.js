// node summary.test.js
const assert = require('assert');
const { C, parse } = require('./summary.js');

const seed = C.seedMd();
const m = parse(seed);
const ids = (b) => b.steps.map((s) => s.id);
const edit = (a, b) => parse(seed.replace(a, b));

// A target walks back round the polygon; the owner leading a step is found.
const b = C.breadcrumb(m, C.changedItem(edit('- on-time: 98%', '- on-time: 99%'), m));
assert.deepStrictEqual(ids(b), ['recurring-revenue', 'ship-24h', 'pick-pack', 'on-time']);
assert.strictEqual(b.owner.id, 'tom');

// An owner hangs off the priority they lead (over one they support).
assert.deepStrictEqual(ids(C.breadcrumb(m, { id: 'marco', sec: 4, text: 'Marco Ruiz' })), ['top-satisfaction', 'nps-55', 'feedback-loop', 'marco']);

// Added, removed or changed links count; nothing changed = null.
assert.ok(['tom', 'solar-led'].includes(C.changedItem(m, edit('- tom -> solar-led: leads\n', '')).id));
assert.ok(['tom', 'solar-led'].includes(C.changedItem(edit('- tom -> solar-led: leads\n', ''), m).id));
assert.strictEqual(C.changedItem(m, m), null);

// Stamp -> markdown -> parse round-trips; no change keeps the old stamp.
const s1 = C.stamped(edit('- nps: NPS ≥ 55', '- nps: NPS ≥ 60'), m, '2026-11-17');
assert.deepStrictEqual(s1.updated, { date: '2026-11-17', id: 'nps' });
const md1 = C.serializeMd(s1);
assert.ok(md1.includes('\n> Last updated 2026-11-17: nps\n'));
assert.deepStrictEqual(parse(md1).updated, s1.updated);
assert.strictEqual(C.stamped(parse(md1), parse(md1), '2027-01-01').updated.date, '2026-11-17');

// A stamp naming a deleted item drops the slug instead of failing.
assert.strictEqual(parse(md1.replace('- nps: NPS ≥ 60\n', '').replace(/- nps -> .*\n/g, '')).updated.id, null);

assert.ok(C.summarySvg(s1).includes('NPS ≥ 60'));
assert.ok(C.summarySvg(s1, 'crumb') === C.summarySvg(s1));

// Badge segments: [text, fill] pairs, in order.
const segs = (svg) => {
  const fills = [...svg.matchAll(/<rect x="[^"]*" width="[^"]*" height="20" fill="([^"]*)"/g)].map((x) => x[1]);
  return [...svg.matchAll(/<text[^>]*>([^<]*)<\/text>/g)].map((x, i) => [x[1], fills[i]]);
};
const pal = C.colors(s1);

// Default: "<category slug> : <item slug>", category on its colour, item on
// grey. With no "slug:", a section's slug is its slugified title, ≤ 12 chars.
assert.deepStrictEqual(segs(C.badgeSvg(s1)), [['targets-to-i', pal[3].ac], ['nps', '#555']]);
// Breadcrumb: one segment per step, each on its section's colour.
assert.deepStrictEqual(segs(C.badgeSvg(s1, 'crumb')), [['top-satisfaction', pal[0].ac], ['nps-55', pal[1].ac], ['returns-journey', pal[2].ac], ['nps', pal[3].ac]]);
// A section (by ?view= slug or short name): its short name, then its items' slugs.
assert.deepStrictEqual(segs(C.badgeSvg(s1, 'annual-objectives')), [['annual-objec', pal[1].ac], ['repair-sub · energy-cut · nps-55 · ship-24h', '#555']]);
assert.deepStrictEqual(segs(C.badgeSvg(s1, 'annual-objec')), segs(C.badgeSvg(s1, 'annual-objectives')));
assert.deepStrictEqual(segs(C.badgeSvg(s1, 'last')), segs(C.badgeSvg(s1, 'targets-to-improve')));
// Nothing stamped: just the title.
assert.deepStrictEqual(segs(C.badgeSvg(m)).map((x) => x[0]), [m.title]);

// Section slug / colour / description and item detail: parse, round-trip, use.
const meta = parse(seed
  .replace('## Targets to improve: Metrics\n', '## Targets to improve: Metrics\nslug: kpis\ncolor: #0047cc\nWhat we measure.\nYearly.\n')
  .replace('- nps: NPS ≥ 55\n', '- nps: NPS ≥ 55\n  Net promoter score,\n  surveyed quarterly.\n'));
const t = meta.sections[3];
assert.deepStrictEqual([t.slug, t.color, t.desc], ['kpis', '#0047CC', 'What we measure.\nYearly.']);
assert.strictEqual(t.items.find((it) => it.id === 'nps').detail, 'Net promoter score,\nsurveyed quarterly.');
assert.deepStrictEqual(parse(C.serializeMd(meta)), meta);
assert.strictEqual(C.colors(meta)[3].ac, '#0047CC');
assert.strictEqual(C.colors(m)[0].tint, C.palette()[0].tint); // no colour: palette
// Detail edits count as a change; the badge uses the custom slug and colour.
const s2 = C.stamped(parse(C.serializeMd(meta).replace('surveyed quarterly.', 'surveyed monthly.')), meta, '2026-11-18');
assert.strictEqual(s2.updated.id, 'nps');
assert.deepStrictEqual(segs(C.badgeSvg(s2)), [['kpis', '#0047CC'], ['nps', '#555']]);
assert.strictEqual(C.shownSection(s2, 'kpis'), 3);
assert.ok(C.summarySvg(s2).includes('Net promoter score,'));
// A section-only change (e.g. its colour) keeps the item the stamp names, so
// the badge keeps "category : item", now on the new colour.
const recoloured = C.stamped(C.withSection(s2, 3, { color: '#FF0000' }), s2, '2026-11-19');
assert.deepStrictEqual(recoloured.updated, { date: '2026-11-19', id: 'nps' });
assert.deepStrictEqual(segs(C.badgeSvg(parse(C.serializeMd(recoloured)))), [['kpis', '#FF0000'], ['nps', '#555']]);

// Renaming an item's slug carries its links and the stamp; the rename is the change.
const renamed = C.withRenamed(s2, 'nps', 'nps-score');
assert.strictEqual(renamed.updated.id, 'nps-score');
assert.strictEqual(Object.keys(renamed.links).filter((k) => k.split('::').includes('nps')).length, 0);
assert.strictEqual(Object.keys(renamed.links).filter((k) => k.split('::').includes('nps-score')).length,
  Object.keys(s2.links).filter((k) => k.split('::').includes('nps')).length);
assert.deepStrictEqual(parse(C.serializeMd(renamed)), renamed);
assert.strictEqual(C.stamped(renamed, s2, '2026-11-19').updated.id, 'nps-score');
// Detail text can't smuggle in items or headings.
assert.strictEqual(C.safeText('ok\n- not an item\n## nor a heading'), 'ok\nnot an item\nnor a heading');

// Automatic slugs: the slugified text, ≤ 12 chars, no trailing hyphen,
// numbered on a clash.
assert.strictEqual(C.shortSlug('Targets to improve'), 'targets-to-i');
assert.strictEqual(C.shortSlug('5,000 active subscribers'), '5-000-active');
assert.strictEqual(C.shortSlug('Grow exports to 20 countries'), 'grow-exports');
assert.strictEqual(C.shortSlug('NPS ≥ 55'), 'nps-55');
assert.strictEqual(C.shortSlug('  '), 'item');
// A new item gets "item"; typing renames it (links and stamp follow) until the
// slug is set by hand, after which text edits leave it alone.
const added = C.withAdded(m, 0);
const newId = added.sections[0].items[3].id;
assert.strictEqual(newId, 'item');
let typed = C.withAutoText(added, 0, newId, 'Grow exports');
assert.strictEqual(typed.sections[0].items[3].id, 'grow-exports');
typed = C.withAutoText(typed, 0, 'grow-exports', 'Grow exports to 20 countries');
assert.strictEqual(typed.sections[0].items[3].id, 'grow-exports');
const clash = C.withAutoText(C.withAdded(typed, 1), 1, 'item', 'Grow exports to the EU');
assert.strictEqual(clash.sections[1].items[4].id, 'grow-expor-2');
assert.deepStrictEqual(parse(C.serializeMd(clash)), clash);
const custom = C.withAutoText(m, 0, 'recurring-revenue', 'Grow recurring revenue to 50% of sales');
assert.strictEqual(custom.sections[0].items[0].id, 'recurring-revenue');

// Bad attributes fail with a line number.
assert.ok(!C.parseMd(seed.replace('## Targets to improve: Metrics\n', '## Targets to improve: Metrics\ncolor: blue\n')).ok);
assert.ok(!C.parseMd(seed.replace('## Targets to improve: Metrics\n', '## Targets to improve: Metrics\nslug: Not A Slug\n')).ok);

// Share links: #md=<deflate-raw, base64url>. Round-trips (incl. non-ASCII),
// is URL-safe, and is plain zlib deflate-raw, so any tool can decode it.
(async () => {
  const zlib = require('zlib');
  const md = C.serializeMd(meta);
  const packed = await C.packMd(md);
  assert.match(packed, /^[A-Za-z0-9_-]+$/);
  assert.strictEqual(await C.unpackMd(packed), md);
  assert.strictEqual(zlib.inflateRawSync(Buffer.from(packed, 'base64url')).toString(), md);
  const acme = require('fs').readFileSync(__dirname + '/examples/acme-plan/x-matrix.md', 'utf8');
  assert.ok((await C.packMd(acme)).length < 1500, 'a typical plan makes a short link');
  await assert.rejects(C.unpackMd(packed.slice(0, 40)), 'a cut-short link fails rather than half-loading');
  console.log('ok');
})().catch((e) => { console.error(e); process.exit(1); });

// card.json: one legend entry per section (count, colour, ?view= link), the first section as the headline.
{
  const c = C.card(s1, { label: 'plan/x-matrix.md', src: 'https://you.github.io/plan/x-matrix.md' }, undefined, '2026-11-18');
  assert.strictEqual(c.version, 1);
  assert.deepStrictEqual(c.status, { label: 'Updated 2026-11-17', tone: 'good' });
  assert.strictEqual(c.heading.primary, String(s1.sections[0].items.length));
  assert.strictEqual(c.legend.length, s1.sections.length);
  assert.strictEqual(c.report[c.legend[1].id], s1.sections[1].items.length);
  assert.strictEqual(c.legend[1].url, 'https://aaronp.github.io/Hoshin-Kanri/?src=https://you.github.io/plan/x-matrix.md&view=annual-objectives');
  assert.strictEqual(C.card(s1, { label: 'x', src: 'x' }, 'h/', '2027-06-01').status.tone, 'warn');
  assert.strictEqual(C.card(m, { label: 'x', src: 'x' }, 'h/', '2027-06-01').status.tone, 'neutral');
}
