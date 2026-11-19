# X-Matrix builder — design reference

**[▶ Open the live X-Matrix](https://aaronp.github.io/Hoshin-Kanri/)** ·
[Acme example](https://aaronp.github.io/Hoshin-Kanri/?src=examples/acme-plan/x-matrix.md)

## Adding it to your project

From your project's root (Bun shown; `npm i -D`, `npm pkg set` and `npm run` work the same):

```sh
bun add -d @pritzlaff/hoshin-kanri
bun pm pkg set scripts.goals="hoshin-kanri docs/goals/x-matrix.md"
mkdir -p docs/goals
cat > docs/goals/x-matrix.md <<'EOF'
# My app plan

## Breakthrough objectives
slug: vision
- grow: Grow paid users 3× by 2029

## Annual objectives
slug: goals
- launch: Launch v1 by March
- retain: Monthly churn under 3%

## Top-level priorities
slug: priorities
- onboarding: Self-serve onboarding
  Sign-up to first project in under five minutes.
- billing: Usage-based billing

## Targets to improve
slug: kpis
- signups: 500 sign-ups a month
- churn: Churn report every Friday

## Owners > Top-level priorities
slug: owners
- priya: Priya
- tom: Tom

## Intersections
- launch -> grow: strong
- retain -> grow: supporting
- onboarding -> launch: strong
- billing -> retain: supporting
- signups -> onboarding: strong
- churn -> billing: strong
- signups -> grow: strong
- priya -> onboarding: leads
- tom -> billing: leads
EOF
bun run goals    # opens it on localhost
```

**Save** in the viewer writes your edits back to `docs/goals/x-matrix.md`, stamped with what changed; commit
it like any other source. The full format is in **[spec.md](spec.md)**, also published at <https://aaronp.github.io/Hoshin-Kanri/spec.md> and shipped in the package as `node_modules/@pritzlaff/hoshin-kanri/spec.md`, so people and agents working in your repo can read the version they run.

`hoshin-kanri card docs/goals/x-matrix.md` and `hoshin-kanri badge docs/goals/x-matrix.md` write
`card.json`, `badge.svg` and `summary.svg` beside it, for a dashboard or a README badge
([Card and badge](#card-and-badge)).
To publish it on GitHub Pages as well, copy `plan/index.html` and `.github/workflows/pages.yml` from
[examples/bun-app](examples/bun-app), which is this setup end to end with the file in `plan/`
(change that path in the workflow to match yours).
[aaronp/template](https://github.com/aaronp/template) is a project with this and its sibling tools (goals, architecture, decisions, risks, schedule, delivery) set up together behind one dashboard.

This is a design mockup created in a visual design tool, exported as a
standalone page. Treat it as a REFERENCE MOCKUP, not production code:
the markup and inline styles carry the design's precise values — colors,
font sizes, spacing, radii, shadows, layout — which an implementation
should replicate faithfully in its own components and styling system
rather than copy wholesale.

## Contents

- `Main.dc.html` — the artboard (a Design Component: an `<x-dc>`
  template + a small logic class). The values to replicate live in its
  inline `style="…"` attributes and the `<helmet><style>` block.
- `support.js`, `vendor/react*.js` — the runtime that renders the
  component in a browser; not part of the design.

## Viewing

`make dev` serves the folder with Bun on http://localhost:8000; some browsers block
the scripts over file://.

## The `hoshin-kanri` CLI

```sh
bunx @pritzlaff/hoshin-kanri x-matrix.md   # or npx; no install needed
```

It serves the viewer and that file on localhost and opens the browser.
The file is re-read on each reload, and **Save** (in the Markdown panel and the Share menu) writes your
edits back to it, stamped like Download. Save only appears when the CLI serves the file; it answers
on loopback only and refuses other `Host` names. `PORT=8000` fixes the port; `NO_OPEN=1` skips opening a browser.
The package has no dependencies: it is `bin/hoshin-kanri.mjs` plus the static page
(`Main.dc.html`, `support.js`, `vendor/`, `summary.html`, `summary.js`).

### Card and badge

For the [badge and summary images](#badge--summary-images):

```sh
hoshin-kanri badge docs/goals/x-matrix.md    # → docs/goals/badge.svg, docs/goals/summary.svg
```

`hoshin-kanri badge <x-matrix.md> [out-dir] [show]` takes the same `show` values as `summary.js`.

`hoshin-kanri card <x-matrix.md> [out-dir]` writes `card.json`: the plan as a dashboard card in the
tool-neutral format `adr card` also writes (version 1: title, status, headline number, a legend
with one entry per section, links). By default the headline is the first section's item count; the status is
"good" when the plan was stamped in the last 90 days, "warn" when older. Links open the hosted viewer
(`HK_HOST`) on `HK_SRC`, the published markdown's URL (default: the path given), with `?view=` per section.
Both commands read the [card settings](#card-designer-and-settings) beside the markdown.

### Releasing

`npm version patch` (or minor/major), then `make publish` (tests, then `npm publish`; needs
`npm login` and access to the `@pritzlaff` scope). `make dist` packs the same thing into a
local `.tgz` without publishing.

## Hosting & external data

Served on GitHub Pages by `.github/workflows/pages.yml` on pushes to `master`
(Settings → Pages → Source: **GitHub Actions**; the `github-pages` environment
must allow `master`). `.md` files are served raw, without Jekyll.

The **File** menu in the title bar:

- **New…** starts a new X-Matrix (name it and choose its sections).
- **Open…** loads a dropped or chosen `.md` file, or a URL (which then becomes `?src=`, so the page is shareable).
- **Save** (only when the `hoshin-kanri` CLI serves the file) writes it back, stamped.
- **Download file** saves the markdown, stamped.

- **Copy link** puts the whole X-Matrix in the link (`#md=`, raw deflate then
  base64url): a snapshot, about 1 KB for a typical plan. Past 8,000
  characters it warns that some mail and chat apps cut long links.
- **Copy link to file** (when opened with `?src=`) always shows the latest
  saved file.
- **Design card…** opens the [card designer](#card-designer-and-settings).

Or load any markdown with `?src=<url>` (absolute, or relative to the page), e.g.
`https://aaronp.github.io/Hoshin-Kanri/?src=examples/acme-plan/x-matrix.md`.
The source must allow CORS (GitHub Pages and raw.githubusercontent.com do).

Other params (kept in sync as you click, so the URL is always shareable):
`view=<section heading, slugified>` e.g. `view=annual-objectives` (absent = full
matrix) and `markdown` (present = show the Markdown panel).

## Badge & summary images

**Save** and **Download** stamp what you changed since opening (or last saving)
as a line under the title:

```md
> Last updated 2026-11-17: defect-rate
```

That line (and the [card settings](#card-designer-and-settings), if any) is all the images
need, so wherever the markdown is saved they can be rebuilt from it:

- `summary.svg`: the title, the date, the changed item's owner, and a
  breadcrumb from the first section down to the changed item (with its
  detail), following its strongest intersections (e.g. objective → annual
  objective → priority → target).
- `badge.svg`: by default the card's counts, as `adr badge` draws them: the card title on grey, then
  `<label> <n>` per legend item on its colour, e.g. `Goals | Annual objectives 3 | Top-level priorities 3`.
  The card settings can pick a last-change badge instead (below).

The `show` choices (in the card settings, or as the CLI's `show` argument): `card` (the badge's default),
`item` (`<section slug> : <item slug>` of the last change, e.g. `kpis : defect-rate`, as the title bar shows
it live), `crumb` (the breadcrumb to the last change, the summary's default; on a badge, one item slug per
step, each on its section's colour), `last` (the last change's section), or a section's slug (e.g.
`priorities`, to show one level of the plan).

`node summary.js x-matrix.md [out-dir] [show]` writes `badge.svg`, `summary.svg` and `card.json` next to the
markdown, as `hoshin-kanri badge` and `hoshin-kanri card` do. The example data repo's Pages workflow runs this on every push.

### Card designer and settings

**File → Design card…** (or the badge next to the title) opens `summary.html?src=<markdown url>` in a new tab,
previewing your unsaved edits. It edits the card settings, `<name>.card.json` beside the markdown (e.g.
`x-matrix.card.json`), with a live preview of the card, badge and summary image:

```json
{
  "title": "Goals",
  "subtitle": "Hoshin Kanri",
  "heading": { "primary": "goals", "label": "goals this year" },
  "legend": [{ "id": "goals", "label": "This year", "color": "#0B6B5F" }, { "id": "priorities" }],
  "hideZero": false,
  "source": { "label": "plan/x-matrix.md" },
  "badge": { "show": "card" },
  "summary": { "show": "crumb" }
}
```

Every field is optional. Legend ids are section short names (their `slug:`); the legend lists the sections
shown, in order (default: all of them, with their titles and colours). `heading.primary` is `total` (all
items) or a section's short name (default: the first section). The designer saves only what differs from
the defaults, so renamed or recoloured sections still flow through. **Save** writes the file when the CLI
serves the markdown; otherwise **Download** it and commit it next to the markdown. `hoshin-kanri card` and
`hoshin-kanri badge` read it (and fail on a legend id that names no section).

GitHub README images can't run JS, so embed a real file, linked to the matrix:

```md
[![X-Matrix](https://you.github.io/your-plan/badge.svg)](https://you.github.io/your-plan/)
```

`make badge` (or `make summary`) renders the Acme example, and `make test` checks the logic.

## Markdown format

`# Title`, then 1–8 `## ` sections of `- slug: Title` items, then `## Intersections` as
`- from -> to: strong | supporting`. The full format, with a minimal and a complete example, is in
**[spec.md](spec.md)**.

## Publishing your own X-Matrix

Your plan lives in its own data-only repo (just `x-matrix.md` plus a Pages
workflow); this repo stays the viewer. Create an empty repo on GitHub, then
either:

**A. Start from `examples/` in this repo**

```sh
git clone https://github.com/aaronp/Hoshin-Kanri.git
cd Hoshin-Kanri/examples/acme-plan
make clone REPO=you/your-plan    # or ./clone.sh to be prompted
```

This copies the example to `../your-plan` as a fresh repo on `master`, points
its README link at `https://you.github.io/your-plan/` and sets the `origin`
remote.

**B. Clone the standalone example**

```sh
git clone https://github.com/aaronp/Hoshin-Kanri-example.git your-plan
cd your-plan
git remote set-url origin git@github.com:you/your-plan.git
```

Then change the **View** link in its README to `https://you.github.io/your-plan/`.

Either way, edit `x-matrix.md`, commit and `git push -u origin master`, then
on GitHub set Settings → Pages → Source: **GitHub Actions** and allow
`master` under Settings → Environments → github-pages. Your site at
`https://you.github.io/your-plan/` redirects here with `?src=` pointing at
your `x-matrix.md`.

## License

[MIT](LICENSE)
