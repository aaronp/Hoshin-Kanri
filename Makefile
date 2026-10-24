PORT ?= 8000

.PHONY: dev
dev:
	@echo "http://localhost:$(PORT)/?src=examples/acme-plan/x-matrix.md"
	python3 -m http.server $(PORT)
