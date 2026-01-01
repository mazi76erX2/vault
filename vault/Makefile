# Vault Project Makefile
# ====================

.PHONY: help
help: ## Show this help message
	@echo "Vault - Knowledge Management System"
	@echo "===================================="
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# ====================
# Local Development (UV)
# ====================

.PHONY: install
install: ## Install dependencies with UV
	@echo "Installing dependencies with UV..."
	uv sync --all-extras

.PHONY: install-dev
install-dev: ## Install dev dependencies
	@echo "Installing development dependencies..."
	uv sync --all-extras --dev

.PHONY: venv
venv: ## Create virtual environment with UV
	@echo "Creating virtual environment..."
	uv venv

.PHONY: run-local
run-local: ## Run FastAPI locally with hot reload
	@echo "Starting FastAPI server locally..."
	uv run uvicorn main:app --host 0.0.0.0 --port 7860 --reload

.PHONY: shell
shell: ## Open Python shell with project context
	uv run python

# ====================
# Docker Development
# ====================

.PHONY: dev-up
dev-up: ## Start development environment with Docker Compose
	@echo "Starting development environment..."
	docker compose -f docker-compose.dev.yml up -d

.PHONY: dev-watch
dev-watch: ## Start development with hot reload (watch mode)
	@echo "Starting development with watch mode..."
	docker compose -f docker-compose.dev.yml up --watch

.PHONY: dev-build
dev-build: ## Build development Docker image
	@echo "Building development image..."
	docker compose -f docker-compose.dev.yml build --no-cache

.PHONY: dev-logs
dev-logs: ## Follow development logs
	docker compose -f docker-compose.dev.yml logs -f

.PHONY: dev-logs-backend
dev-logs-backend: ## Follow backend logs only
	docker compose -f docker-compose.dev.yml logs -f backend

.PHONY: dev-down
dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml down

.PHONY: dev-restart
dev-restart: ## Restart development environment
	docker compose -f docker-compose.dev.yml restart

.PHONY: dev-shell
dev-shell: ## Open shell in backend container
	docker compose -f docker-compose.dev.yml exec backend /bin/bash

.PHONY: dev-python
dev-python: ## Open Python shell in backend container
	docker compose -f docker-compose.dev.yml exec backend /app/.venv/bin/python

.PHONY: verify-ldap
verify-ldap: ## Verify python-ldap is installed correctly
	@echo "Verifying python-ldap installation..."
	docker compose -f docker-compose.dev.yml exec backend /app/.venv/bin/python -c "import ldap; print('✅ python-ldap OK')"


# ====================
# Docker Production
# ====================

.PHONY: prod-up
prod-up: ## Start production environment
	@echo "Starting production environment..."
	docker compose up -d

.PHONY: prod-build
prod-build: ## Build production Docker image
	@echo "Building production image..."
	docker compose build --no-cache

.PHONY: prod-logs
prod-logs: ## Follow production logs
	docker compose logs -f

.PHONY: prod-down
prod-down: ## Stop production environment
	docker compose down

.PHONY: prod-restart
prod-restart: ## Restart production environment
	docker compose restart

# ====================
# Database Operations
# ====================

.PHONY: db-shell
db-shell: ## Connect to PostgreSQL shell
	docker compose exec postgres psql -U postgres -d vault

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo "Running database migrations..."
	docker compose exec backend /app/.venv/bin/alembic upgrade head

.PHONY: db-reset
db-reset: ## Reset database (WARNING: deletes all data)
	@echo "⚠️  This will delete all data. Press Ctrl+C to cancel..."
	@sleep 3
	docker compose down -v
	docker compose up -d postgres
	@sleep 5
	$(MAKE) db-migrate

.PHONY: db-backup
db-backup: ## Backup database to ./backups/
	@echo "Backing up database..."
	@mkdir -p backups
	docker compose exec -T postgres pg_dump -U postgres vault > backups/vault_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "Backup saved to backups/"

.PHONY: db-restore
db-restore: ## Restore database from backup (usage: make db-restore FILE=backups/vault_xxx.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "Usage: make db-restore FILE=backups/vault_xxx.sql"; \
		exit 1; \
	fi
	@echo "Restoring database from $(FILE)..."
	docker compose exec -T postgres psql -U postgres vault < $(FILE)

# ====================
# Qdrant Operations
# ====================

.PHONY: qdrant-shell
qdrant-shell: ## Open Qdrant web UI (http://localhost:6333/dashboard)
	@echo "Opening Qdrant at http://localhost:6333/dashboard"
	@open http://localhost:6333/dashboard || xdg-open http://localhost:6333/dashboard || start http://localhost:6333/dashboard

.PHONY: qdrant-reset
qdrant-reset: ## Reset Qdrant collections (deletes all vectors)
	@echo "⚠️  This will delete all Qdrant data. Press Ctrl+C to cancel..."
	@sleep 3
	docker compose down qdrant
	rm -rf ./qdrant_storage
	docker compose up -d qdrant

# ====================
# Ollama Operations
# ====================

.PHONY: ollama-pull
ollama-pull: ## Pull required Ollama models
	@echo "Pulling Ollama models..."
	ollama pull llama2
	ollama pull nomic-embed-text

.PHONY: ollama-list
ollama-list: ## List installed Ollama models
	ollama list

.PHONY: ollama-serve
ollama-serve: ## Start Ollama server (if not running)
	@echo "Starting Ollama server..."
	ollama serve

# ====================
# Code Quality
# ====================

.PHONY: lint
lint: ## Run linting with ruff
	@echo "Running linter..."
	uv run ruff check app/ main.py

.PHONY: lint-fix
lint-fix: ## Fix linting issues automatically
	@echo "Fixing linting issues..."
	uv run ruff check --fix app/ main.py

.PHONY: format-ruff
format-ruff: ## Format code with ruff
	@echo "Formatting code..."
	uv run ruff format app/ main.py

.PHONY: format-check
format-check: ## Check code formatting
	@echo "Checking code formatting..."
	uv run ruff format --check app/ main.py

.PHONY: type-check
type-check: ## Run type checking with mypy
	@echo "Running type checker..."
	uv run mypy app/ main.py

.PHONY: format
format: ## Check code formatting
	@echo "Checking code formatting..."
	uv run ruff check --fix --unsafe-fixes src app/ main.py && isort app/ main.py && black app/ main.py

# ====================
# Testing
# ====================

.PHONY: test
test: ## Run tests with pytest
	@echo "Running tests..."
	uv run pytest

.PHONY: test-cov
test-cov: ## Run tests with coverage report
	@echo "Running tests with coverage..."
	uv run pytest --cov=app --cov-report=html --cov-report=term

.PHONY: test-watch
test-watch: ## Run tests in watch mode
	@echo "Running tests in watch mode..."
	uv run pytest-watch

# ====================
# Cleaning
# ====================

.PHONY: clean
clean: ## Clean temporary files and caches
	@echo "Cleaning temporary files..."
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov/ .coverage

.PHONY: clean-docker
clean-docker: ## Clean Docker volumes and images
	@echo "⚠️  This will remove all Docker volumes and images. Press Ctrl+C to cancel..."
	@sleep 3
	docker compose down -v --rmi all

.PHONY: clean-all
clean-all: clean clean-docker ## Clean everything (code + Docker)
	rm -rf .venv uv.lock
	rm -rf postgres_data/ qdrant_storage/ uploads/ logs/

# ====================
# Setup & Initialization
# ====================

.PHONY: setup-local
setup-local: venv install ## Setup local development environment
	@echo "✅ Local environment ready!"
	@echo "Run 'make run-local' to start the server"

.PHONY: setup-docker
setup-docker: ## Setup Docker development environment
	@echo "Setting up Docker environment..."
	cp .env.example .env || true
	@echo "⚠️  Please update .env with your configuration"
	@echo "Then run: make dev-build && make dev-watch"

.PHONY: setup-ollama
setup-ollama: ollama-pull ## Setup Ollama with required models
	@echo "✅ Ollama models installed!"

.PHONY: init
init: setup-local setup-ollama ## Initialize complete development environment
	@echo "✅ Development environment initialized!"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Update .env with your configuration"
	@echo "  2. Run 'make dev-watch' for Docker development"
	@echo "  3. Or run 'make run-local' for local development"

# ====================
# Monitoring & Health
# ====================

.PHONY: status
status: ## Show status of all services
	@echo "=== Docker Services ==="
	@docker compose ps
	@echo ""
	@echo "=== Ollama Status ==="
	@curl -s http://localhost:11434/api/tags | jq -r '.models[].name' || echo "Ollama not running"

.PHONY: health
health: ## Check health of all services
	@echo "Checking service health..."
	@echo -n "Backend: " && curl -sf http://localhost:7860/health && echo "✅" || echo "❌"
	@echo -n "Qdrant: " && curl -sf http://localhost:6333/collections && echo "✅" || echo "❌"
	@echo -n "PostgreSQL: " && docker compose exec -T postgres pg_isready -U postgres && echo "✅" || echo "❌"
	@echo -n "Ollama: " && curl -sf http://localhost:11434/api/tags > /dev/null && echo "✅" || ec
