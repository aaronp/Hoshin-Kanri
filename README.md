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

`make dev` serves the folder on http://localhost:8000; some browsers block
the scripts over file://.

## Hosting & external data

Served on GitHub Pages by `.github/workflows/pages.yml` on pushes to `master`
(Settings → Pages → Source: **GitHub Actions**; the `github-pages` environment
must allow `master`). `.md` files are served raw, without Jekyll.

Load any markdown with `?src=<url>` (absolute, or relative to the page), e.g.
`https://aaronp.github.io/Hoshin-Kanri/?src=examples/acme-plan/x-matrix.md`.
The source must allow CORS (GitHub Pages and raw.githubusercontent.com do).

Other params (kept in sync as you click, so the URL is always shareable):
`view=breakthrough|annual|priorities|targets|owners` (absent = full matrix)
and `markdown` (present = show the Markdown panel).

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
