PORT ?= 8000

.PHONY: dev
dev:
	@echo "http://localhost:$(PORT)/?src=examples/acme-plan/x-matrix.md"
	python3 -m http.server $(PORT)

.PHONY: test summary
test:
	node summary.test.js

# Writes badge.svg + summary.svg next to the example (as the Pages workflow does).
summary:
	node summary.js examples/acme-plan/x-matrix.md
