PORT ?= 8000

# Serves the repo as GitHub Pages does, on localhost (see dev-server.ts); File → Save / Autosave write .md files back.
.PHONY: dev
dev:
	@echo "Example: http://localhost:$(PORT)/?src=examples/acme-plan/x-matrix.md"
	@PORT=$(PORT) bun dev-server.ts

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
