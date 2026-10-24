# Acme plan — X-Matrix

**[▶ View the X-Matrix](https://aaronp.github.io/hoshin-kanri-example/)**

The data lives in [`x-matrix.md`](x-matrix.md). The UI comes from
[aaronp/Hoshin-Kanri](https://github.com/aaronp/Hoshin-Kanri).

## Using this as a template

1. Create an empty repo on GitHub, then from this directory run
   `make clone REPO=you/your-repo` (or `./clone.sh`, which prompts).
   It copies the files to `../your-repo`, points the View link above at
   your Pages site and sets the git remote.
2. Edit `x-matrix.md` (the format is shown in the viewer's Markdown panel),
   then commit and push.
3. On GitHub: Settings → Pages → Source: **GitHub Actions**.
4. Optional: on the repo page, open About (⚙) → tick **Use your GitHub Pages
   website** so the link also shows in the sidebar.

The workflow deploys from `master`. "Branch "master" is not allowed to deploy
to github-pages"? The `github-pages` environment's branch rule doesn't include
it (it can name `main` even when your default is `master`). Add `master` under
Settings → Environments → github-pages → Deployment branches and tags.

No Pages? Link straight to the raw file:
`https://aaronp.github.io/Hoshin-Kanri/?src=https://raw.githubusercontent.com/<you>/<repo>/<branch>/x-matrix.md`
