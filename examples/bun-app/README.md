# bun-app — a Bun project with its own X-Matrix

A tiny Bun service whose Hoshin Kanri plan lives beside the code in
[`plan/x-matrix.md`](plan/x-matrix.md).

```sh
bun install
bun run plan     # opens plan/x-matrix.md in the viewer, served from localhost
bun run badge    # writes plan/badge.svg and plan/summary.svg from the markdown
bun start        # the app itself
```

`bun run plan` uses the [`@pritzlaff/hoshin-kanri`](https://www.npmjs.com/package/@pritzlaff/hoshin-kanri)
dev dependency. Edit `plan/x-matrix.md` and reload the page to see changes, or edit in the
viewer and use **Save** (Markdown panel or Share menu) to write them back to the file.

No install? `bunx @pritzlaff/hoshin-kanri plan/x-matrix.md` does the same.

## Publishing on GitHub Pages

`.github/workflows/pages.yml` publishes only the `plan/` folder. Its `index.html`
redirects to the hosted viewer with `?src=` pointing at your `x-matrix.md`, as in
[acme-plan](../acme-plan). The workflow runs `bun run badge` first, so the images are
published beside it for your README:

```md
[![X-Matrix](https://you.github.io/your-repo/badge.svg)](https://you.github.io/your-repo/)
```
 On GitHub: Settings → Pages → Source: **GitHub Actions**.

Live copy of this example:
[aaronp.github.io/hoshin-kanri/?src=examples/bun-app/plan/x-matrix.md](https://aaronp.github.io/hoshin-kanri/?src=examples/bun-app/plan/x-matrix.md)
