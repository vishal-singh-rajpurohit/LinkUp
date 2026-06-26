# ══════════════════════════════════════════════════════════
#  Makefile — one-word commands for the whole lifecycle
# ══════════════════════════════════════════════════════════

DC_DEV  = docker compose -f docker-compose.dev.yml
DC_PROD = docker compose -f docker-compose.prod.yml

.PHONY: help dev dev-build dev-down prod prod-build prod-down \
        logs shell-backend shell-frontend clean prune

help:           ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ── Development ───────────────────────────────────────────
dev:            ## Start dev stack (attach logs)
	$(DC_DEV) up

dev-build:      ## Rebuild dev images and start
	$(DC_DEV) up --build

dev-down:       ## Stop and remove dev containers
	$(DC_DEV) down

# ── Production ────────────────────────────────────────────
prod:           ## Start prod stack (detached)
	$(DC_PROD) up -d

prod-build:     ## Rebuild prod images and start
	$(DC_PROD) up -d --build

prod-down:      ## Stop prod stack
	$(DC_PROD) down

# ── Debug helpers ─────────────────────────────────────────
logs:           ## Tail all dev logs
	$(DC_DEV) logs -f

shell-backend:  ## Open shell in running backend container
	$(DC_DEV) exec backend sh

shell-frontend: ## Open shell in running frontend container
	$(DC_DEV) exec frontend sh

# ── Housekeeping ─────────────────────────────────────────
clean:          ## Remove stopped containers and dangling images
	docker system prune -f

prune:          ## Full prune including unused volumes (CAUTION)
	docker system prune -af --volumes
