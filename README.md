# X-Matrix builder — design reference

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

Serve the folder (e.g. `python3 -m http.server`) and open `Main.dc.html`;
some browsers block the scripts over file://.

## Hosting & external data

Served on GitHub Pages (Settings → Pages → deploy from branch, root).
`.nojekyll` keeps `.md` files served raw.

Load any markdown with `?src=<url>` (absolute, or relative to the page), e.g.
`https://aaronp.github.io/Hoshin-Kanri/?src=examples/acme-plan/x-matrix.md`.
The source must allow CORS (GitHub Pages and raw.githubusercontent.com do).

`examples/acme-plan/` is a template for a data-only repo that publishes its
own `x-matrix.md` and redirects to this viewer.
