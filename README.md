# X-Matrix builder — design reference

**[▶ Open the live X-Matrix](https://aaronp.github.io/Hoshin-Kanri/)** ·
[Acme example](https://aaronp.github.io/Hoshin-Kanri/?src=examples/acme-plan/x-matrix.md)

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
The file is re-read on each reload. `PORT=8000` fixes the port; `NO_OPEN=1` skips opening a browser.
The package has no dependencies: it is `bin/hoshin-kanri.mjs` plus the static page
(`Main.dc.html`, `support.js`, `vendor/`, `summary.html`, `summary.js`).

### Adding it to your Bun project

From your project's root:

```sh
bun add -d @pritzlaff/hoshin-kanri
bun pm pkg set scripts.plan="hoshin-kanri plan/x-matrix.md"
mkdir -p plan
cat > plan/x-matrix.md <<'MD'
# My plan

## Breakthrough objectives
- grow: Grow the business

## Annual objectives
- launch: Launch v1

## Intersections
- grow -> launch: strong
MD
bun run plan
```

Edits made in the viewer are not written back to disk: use **Download** in the Markdown
panel and save over `plan/x-matrix.md`, then commit it.

For the [badge and summary images](#badge--summary-images):

```sh
bun pm pkg set scripts.badge="hoshin-kanri badge plan/x-matrix.md"
bun run badge    # → plan/badge.svg, plan/summary.svg
```

`hoshin-kanri badge <x-matrix.md> [out-dir] [show]` takes the same `show` values as `summary.js`.

To publish the plan on GitHub Pages as well, copy `plan/index.html` and `.github/workflows/pages.yml`
from [examples/bun-app](examples/bun-app), which is this setup end to end.

### Releasing

`npm version patch` (or minor/major), then `make publish` (tests, then `npm publish`; needs
`npm login` and access to the `@pritzlaff` scope). `make dist` packs the same thing into a
local `.tgz` without publishing.

## Hosting & external data

Served on GitHub Pages by `.github/workflows/pages.yml` on pushes to `master`
(Settings → Pages → Source: **GitHub Actions**; the `github-pages` environment
must allow `master`). `.md` files are served raw, without Jekyll.

**Open** in the title bar loads an X-Matrix from a dropped or chosen `.md`
file, or from a URL (which then becomes `?src=`, so the page is shareable).
**Share** (the icon next to Markdown) copies a link, or downloads the file:

- **Copy link** puts the whole X-Matrix in the link (`#md=`, raw deflate then
  base64url): a snapshot, about 1 KB for a typical plan. Past 8,000
  characters it warns that some mail and chat apps cut long links.
- **Copy link to file** (when opened with `?src=`) always shows the latest
  saved file.

Or load any markdown with `?src=<url>` (absolute, or relative to the page), e.g.
`https://aaronp.github.io/Hoshin-Kanri/?src=examples/acme-plan/x-matrix.md`.
The source must allow CORS (GitHub Pages and raw.githubusercontent.com do).

Other params (kept in sync as you click, so the URL is always shareable):
`view=<section heading, slugified>` e.g. `view=annual-objectives` (absent = full
matrix) and `markdown` (present = show the Markdown panel).

## Badge & summary images

**Download** in the Markdown panel stamps what you changed since opening
(or last saving) as a line under the title:

```md
> Last updated 2026-11-17: defect-rate
```

That line is all the images need, so wherever the markdown is saved they can
be rebuilt from it:

- `summary.svg`: the title, the date, the changed item's owner, and a
  breadcrumb from the first section down to the changed item (with its
  detail), following its strongest intersections (e.g. objective → annual
  objective → priority → target).
- `badge.svg`: `<section slug> : <item slug>` of the last change, e.g.
  `kpis : defect-rate`, with the section half on the section's colour. The
  title bar shows it live, and clicking it opens the page below.

Both take `show=`: `item` (the badge's default), `crumb` (the breadcrumb to
the last change, the card's default; on a badge, one item slug per step, each
on its section's colour), `last` (the last change's section), or a section's
slug (e.g. `priorities`, to show one level of the plan).

Ways to get them:

- The badge next to the title opens `summary.html` in a new tab, previewing
  your unsaved edits. There you can pick badge or card and what to show, copy
  README markdown, or download the SVG; its title links back to the full
  X-Matrix.
- `summary.html?src=<markdown url>&type=badge|summary&show=…` renders the
  saved file, e.g. [the Acme summary](https://aaronp.github.io/Hoshin-Kanri/summary.html?src=examples/acme-plan/x-matrix.md).
- `node summary.js x-matrix.md [out-dir] [show]` writes both files next to
  the markdown. The example data repo's Pages workflow runs this on every push.

GitHub README images can't run JS, so embed a real file, linked to the matrix:

```md
[![X-Matrix](https://you.github.io/your-plan/summary.svg)](https://you.github.io/your-plan/)
```

`make badge` (or `make summary`) renders the Acme example, and `make test` checks the logic.

## Markdown format

`# Title` (optionally followed by a `> Last updated YYYY-MM-DD: slug` line, see above), then 1–8 `## ` sections of `- slug: Title` items. The sections go
round a polygon from the bottom, clockwise, and each one intersects its
neighbours: 1 section is a list, 2 a table, 3 a triangle, 4 the classic X,
5 or more a star. `## Owners > Priorities` attaches a section to just one
other section (here, Priorities), drawn beyond the next section's rows.
Under a heading, before its items, `slug: short-name` names the section
on badges (default: the slugified title, cut to 12 characters, e.g.
`targets-to-i`), `color: #RRGGBB` sets its colour
(default: by position), and any other text describes it. Text under an item
(indented, so it renders as part of the list item) is that item's detail. The
colour, short name and description, and the selected item's slug and detail, are also
editable in the **Details** drawer (the tab on the right edge; `?details` keeps
it open) while you view a section. New items get a slug from their text the
same way (`Grow exports` → `grow-exports`), kept in step as you type until you
set one by hand. Links go under `## Intersections` as `- from -> to: strong | supporting`
(or `leads | supports`).

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
