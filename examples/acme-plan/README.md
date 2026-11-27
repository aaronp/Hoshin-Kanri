# Acme plan — X-Matrix

**[▶ View the X-Matrix](https://aaronp.github.io/hoshin-kanri-example/)**
[![X-Matrix](https://aaronp.github.io/hoshin-kanri-example/badge.svg)](https://aaronp.github.io/hoshin-kanri-example/)

[![X-Matrix summary](https://aaronp.github.io/hoshin-kanri-example/summary.svg)](https://aaronp.github.io/hoshin-kanri-example/)

The data lives in [`x-matrix.md`](x-matrix.md). The UI comes from
[aaronp/hoshin-kanri](https://github.com/aaronp/hoshin-kanri).

## Using this as a template

1. Create an empty repo on GitHub, then from this directory run
   `make clone REPO=you/your-repo` (or `./clone.sh`, which prompts).
   It copies the files to `../your-repo`, points the View link above at
   your Pages site and sets the git remote.
2. Edit `x-matrix.md` by hand (the format is shown in the viewer's Markdown
   panel), or open it in the viewer, edit, and **Download** it back over
   this file (that also stamps the "Last updated" line the badges use).
   Then commit and push.
3. On GitHub: Settings → Pages → Source: **GitHub Actions**.
4. Optional: on the repo page, open About (⚙) → tick **Use your GitHub Pages
   website** so the link also shows in the sidebar.

The workflow deploys from `master` or `main`, and also renders `badge.svg`
and `summary.svg` from `x-matrix.md` for the images above. "Branch … is not
allowed to deploy to github-pages"? Add your branch under Settings →
Environments → github-pages → Deployment branches and tags.

Your site redirects to the viewer with `?src=` pointing at your
`x-matrix.md`. Any query params you add are passed on, e.g.
`?view=top-level-priorities` or `?markdown&details`.

No Pages? Link straight to the raw file:
`https://aaronp.github.io/hoshin-kanri/?src=https://raw.githubusercontent.com/<you>/<repo>/<branch>/x-matrix.md`
