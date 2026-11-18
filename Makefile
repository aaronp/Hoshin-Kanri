PORT ?= 8000

# Serves the repo as GitHub Pages does, on localhost: a secure context (so the
# clipboard works) with a real host for copied links. Not "[::]" / 0.0.0.0,
# which browsers won't open or treat as insecure.
.PHONY: dev
dev:
	@echo "Example: http://localhost:$(PORT)/?src=examples/acme-plan/x-matrix.md"
	@bun -e 'const s = Bun.serve({ hostname: "localhost", port: $(PORT), async fetch(req) { const p = decodeURIComponent(new URL(req.url).pathname); const f = Bun.file("." + (p.endsWith("/") ? p + "index.html" : p)); return (await f.exists()) ? new Response(f) : new Response("Not found", { status: 404 }); } }); console.log("Serving on " + s.url.href + " (Ctrl-C to stop)")'

.PHONY: test summary badge
test:
	node summary.test.js

# Writes badge.svg + summary.svg next to the example (as the Pages workflow does).
summary badge:
	node bin/hoshin-kanri.mjs badge examples/acme-plan/x-matrix.md

.PHONY: dist publish bump-patch bump-minor bump-major
# Packs the CLI into pritzlaff-hoshin-kanri-<version>.tgz (install with: bun add -d ./pritzlaff-hoshin-kanri-*.tgz)
dist: test
	npm pack

# Bumps package.json, commits and tags v<version> (needs a clean tree)
bump-patch bump-minor bump-major:
	npm version $(@:bump-%=%)

# Publishes @pritzlaff/hoshin-kanri to npm. Bump first: make bump-patch|bump-minor|bump-major
publish: test
	npm publish
