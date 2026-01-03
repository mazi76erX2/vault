# ====================================================================================
# Vault Project - Unified Makefile
# ====================================================================================
# Knowledge Management System with PostgreSQL + pgvector, Ollama, and FastAPI
# ====================================================================================

# Configuration
# ====================================================================================
DB_NAME = vault_db
DB_USER = $(shell whoami)
DB_HOST = localhost
DB_PORT = 5432
PYTHON := .venv/bin/python
UV := uv

# PostgreSQL commands
PSQL = psql -d $(DB_NAME)
PSQL_POSTGRES = psql -d postgres

# Colors for output
BLUE := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RED := \033[31m
RESET := \033[0m

# ====================================================================================
# Help
# ====================================================================================

.PHONY: help
help: ## Show this help message
	@echo "$(BLUE)Vault - Knowledge Management System$(RESET)"
	@echo "===================================="
	@echo ""
	@echo "$(GREEN)Available targets:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(BLUE)%-30s$(RESET) %s\n", $$1, $$2}'
	@echo ""

# ====================================================================================
# Environment Setup
# ====================================================================================

.PHONY: install install-dev venv init setup-local setup-docker setup-ollama
install: ## Install dependencies with UV
	@echo "$(GREEN)Installing dependencies with UV...$(RESET)"
	$(UV) sync --all-extras

install-dev: ## Install dev dependencies
	@echo "$(GREEN)Installing development dependencies...$(RESET)"
	$(UV) sync --all-extras --dev

venv: ## Create virtual environment with UV
	@echo "$(GREEN)Creating virtual environment...$(RESET)"
	$(UV) venv

setup-local: venv install db-create db-extensions migrations-upgrade ## Setup local development environment
	@echo "$(GREEN)✅ Local environment ready!$(RESET)"
	@echo "Run 'make run-local' to start the server"

setup-docker: ## Setup Docker development environment
	@echo "$(GREEN)Setting up Docker environment...$(RESET)"
	cp .env.example .env || true
	@echo "$(YELLOW)⚠️  Please update .env with your configuration$(RESET)"
	@echo "Then run: make dev-build && make dev-watch"

setup-ollama: ollama-pull ## Setup Ollama with required models
	@echo "$(GREEN)✅ Ollama models installed!$(RESET)"

init: setup-local setup-ollama ## Initialize complete development environment
	@echo "$(GREEN)✅ Development environment initialized!$(RESET)"
	@echo ""
	@echo "Next steps:"
	@echo "  1. Update .env with your configuration"
	@echo "  2. Run 'make dev-watch' for Docker development"
	@echo "  3. Or run 'make run-local' for local development"

# ====================================================================================
# Local Development
# ====================================================================================

.PHONY: run-local shell
run-local: ## Run FastAPI locally with hot reload
	@echo "$(GREEN)Starting FastAPI server locally...$(RESET)"
	$(UV) run uvicorn main:app --host 0.0.0.0 --port 7860 --reload

shell: ## Open Python shell with project context
	$(UV) run python

# ====================================================================================
# Docker Development
# ====================================================================================

.PHONY: dev-up dev-watch dev-build dev-logs dev-logs-backend dev-down dev-restart dev-shell dev-python verify-ldap
dev-up: ## Start development environment with Docker Compose
	@echo "$(GREEN)Starting development environment...$(RESET)"
	docker compose -f docker-compose.dev.yml up -d

dev-watch: ## Start development with hot reload (watch mode)
	@echo "$(GREEN)Starting development with watch mode...$(RESET)"
	docker compose -f docker-compose.dev.yml up --watch

dev-build: ## Build development Docker image
	@echo "$(GREEN)Building development image...$(RESET)"
	docker compose -f docker-compose.dev.yml build --no-cache

dev-logs: ## Follow development logs
	docker compose -f docker-compose.dev.yml logs -f

dev-logs-backend: ## Follow backend logs only
	docker compose -f docker-compose.dev.yml logs -f backend

dev-down: ## Stop development environment
	docker compose -f docker-compose.dev.yml down

dev-restart: ## Restart development environment
	docker compose -f docker-compose.dev.yml restart

dev-shell: ## Open shell in backend container
	docker compose -f docker-compose.dev.yml exec backend /bin/bash

dev-python: ## Open Python shell in backend container
	docker compose -f docker-compose.dev.yml exec backend /app/.venv/bin/python

verify-ldap: ## Verify python-ldap is installed correctly
	@echo "$(GREEN)Verifying python-ldap installation...$(RESET)"
	docker compose -f docker-compose.dev.yml exec backend /app/.venv/bin/python -c "import ldap; print('✅ python-ldap OK')"

# ====================================================================================
# Docker Production
# ====================================================================================

.PHONY: prod-up prod-build prod-logs prod-down prod-restart
prod-up: ## Start production environment
	@echo "$(GREEN)Starting production environment...$(RESET)"
	docker compose up -d

prod-build: ## Build production Docker image
	@echo "$(GREEN)Building production image...$(RESET)"
	docker compose build --no-cache

prod-logs: ## Follow production logs
	docker compose logs -f

prod-down: ## Stop production environment
	docker compose down

prod-restart: ## Restart production environment
	docker compose restart

# ====================================================================================
# Database Operations (Local PostgreSQL)
# ====================================================================================

.PHONY: db-create db-drop db-reset db-extensions db-shell db-check db-list-extensions db-backup db-restore
db-create: ## Create the vault_db database
	@echo "$(GREEN)Creating database $(DB_NAME)...$(RESET)"
	@$(PSQL_POSTGRES) -c "CREATE DATABASE $(DB_NAME);" 2>/dev/null || echo "$(YELLOW)Database already exists$(RESET)"

db-drop: ## Drop the vault_db database
	@echo "$(RED)Dropping database $(DB_NAME)...$(RESET)"
	@$(PSQL_POSTGRES) -c "DROP DATABASE IF EXISTS $(DB_NAME);"

db-reset: db-drop db-create db-extensions migrations-upgrade ## Reset database (WARNING: deletes all data)
	@echo "$(GREEN)Database reset complete$(RESET)"

db-extensions: ## Install pgvector and uuid-ossp extensions
	@echo "$(GREEN)Installing PostgreSQL extensions...$(RESET)"
	@$(PSQL) -c 'CREATE EXTENSION IF NOT EXISTS vector;'
	@$(PSQL) -c 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";'
	@echo "$(GREEN)Extensions installed successfully$(RESET)"

db-shell: ## Open psql shell to vault_db
	@$(PSQL)

db-check: ## Check database connection and extensions
	@echo "$(GREEN)Checking database connection...$(RESET)"
	@$(PSQL) -c "SELECT version();"
	@$(PSQL) -c "SELECT extname, extversion FROM pg_extension WHERE extname IN ('vector', 'uuid-ossp');"

db-list-extensions: ## List all installed extensions
	@$(PSQL) -c '\dx'

db-backup: ## Backup database to ./backups/
	@echo "$(GREEN)Backing up database...$(RESET)"
	@mkdir -p backups
	@pg_dump -U $(DB_USER) -h $(DB_HOST) $(DB_NAME) > backups/vault_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "$(GREEN)Backup saved to backups/$(RESET)"

db-restore: ## Restore database from backup (usage: make db-restore FILE=backups/vault_xxx.sql)
	@if [ -z "$(FILE)" ]; then \
		echo "$(RED)Usage: make db-restore FILE=backups/vault_xxx.sql$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Restoring database from $(FILE)...$(RESET)"
	@psql -U $(DB_USER) -h $(DB_HOST) $(DB_NAME) < $(FILE)

# ====================================================================================
# Alembic Migrations
# ====================================================================================

.PHONY: migrations-create migrations-upgrade migrations-downgrade migrations-history migrations-current migrations-stamp
migrations-create: ## Create new migration (usage: make migrations-create MSG="description")
	@if [ -z "$(MSG)" ]; then \
		echo "$(RED)Usage: make migrations-create MSG=\"description\"$(RESET)"; \
		exit 1; \
	fi
	@echo "$(GREEN)Creating new migration...$(RESET)"
	@$(UV) run alembic revision --autogenerate -m "$(MSG)"

migrations-upgrade: ## Upgrade database to latest migration
	@echo "$(GREEN)Upgrading database to latest migration...$(RESET)"
	@$(UV) run alembic upgrade head

migrations-downgrade: ## Downgrade database by 1 revision
	@echo "$(YELLOW)Downgrading database by 1 revision...$(RESET)"
	@$(UV) run alembic downgrade -1

migrations-history: ## Show migration history
	@$(UV) run alembic history

migrations-current: ## Show current migration version
	@$(UV) run alembic current

migrations-stamp: ## Stamp database with specific revision (usage: make migrations-stamp REV=head)
	@$(UV) run alembic stamp $(REV)

# ====================================================================================
# Ollama Operations
# ====================================================================================

.PHONY: ollama-pull ollama-list ollama-serve ollama-stop
ollama-pull: ## Pull required Ollama models
	@echo "$(GREEN)Pulling Ollama models...$(RESET)"
	ollama pull llama2
	ollama pull nomic-embed-text

ollama-list: ## List installed Ollama models
	@ollama list

ollama-serve: ## Start Ollama server (if not running)
	@echo "$(GREEN)Starting Ollama server...$(RESET)"
	@ollama serve &

ollama-stop: ## Stop Ollama server
	@pkill -f "ollama serve" || echo "$(YELLOW)Ollama not running$(RESET)"

# ====================================================================================
# Vector Operations (pgvector)
# ====================================================================================

.PHONY: vector-index vector-test
vector-index: ## Create HNSW indexes for vector search
	@echo "$(GREEN)Creating vector indexes...$(RESET)"
	@$(PSQL) -c "CREATE INDEX IF NOT EXISTS idx_documents_embedding_hnsw ON documents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);"
	@$(PSQL) -c "CREATE INDEX IF NOT EXISTS idx_chat_messages_embedding_hnsw ON chat_messages_helper USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);"
	@echo "$(GREEN)Vector indexes created$(RESET)"

vector-test: ## Test vector similarity search
	@echo "$(GREEN)Testing vector search...$(RESET)"
	@$(UV) run python -c "from app.services.vector_service import VectorService; print('Vector service OK')"

# ====================================================================================
# Code Quality
# ====================================================================================

.PHONY: lint lint-fix format format-check format-ruff type-check
lint: ## Run linting with ruff
	@echo "$(GREEN)Running linter...$(RESET)"
	$(UV) run ruff check app/ main.py

lint-fix: ## Fix linting issues automatically
	@echo "$(GREEN)Fixing linting issues...$(RESET)"
	$(UV) run ruff check --fix app/ main.py

format: ## Format code with ruff, isort, and black
	@echo "$(GREEN)Formatting code...$(RESET)"
	$(UV) run ruff check --fix --unsafe-fixes app/ main.py
	$(UV) run isort app/ main.py
	$(UV) run black app/ main.py

format-ruff: ## Format code with ruff only
	@echo "$(GREEN)Formatting code with ruff...$(RESET)"
	$(UV) run ruff format app/ main.py

format-check: ## Check code formatting
	@echo "$(GREEN)Checking code formatting...$(RESET)"
	$(UV) run ruff format --check app/ main.py

type-check: ## Run type checking with mypy
	@echo "$(GREEN)Running type checker...$(RESET)"
	$(UV) run mypy app/ main.py

# ====================================================================================
# Testing
# ====================================================================================

.PHONY: test test-cov test-watch test-unit test-integration
test: ## Run tests with pytest
	@echo "$(GREEN)Running tests...$(RESET)"
	$(UV) run pytest

test-cov: ## Run tests with coverage report
	@echo "$(GREEN)Running tests with coverage...$(RESET)"
	$(UV) run pytest --cov=app --cov-report=html --cov-report=term

test-watch: ## Run tests in watch mode
	@echo "$(GREEN)Running tests in watch mode...$(RESET)"
	$(UV) run pytest-watch

test-unit: ## Run unit tests only
	@echo "$(GREEN)Running unit tests...$(RESET)"
	$(UV) run pytest tests/unit/

test-integration: ## Run integration tests only
	@echo "$(GREEN)Running integration tests...$(RESET)"
	$(UV) run pytest tests/integration/

# ====================================================================================
# Cleaning
# ====================================================================================

.PHONY: clean clean-docker clean-all clean-db clean-pyc
clean: ## Clean temporary files and caches
	@echo "$(GREEN)Cleaning temporary files...$(RESET)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete 2>/dev/null || true
	find . -type f -name "*.pyo" -delete 2>/dev/null || true
	find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".pytest_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".ruff_cache" -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name ".mypy_cache" -exec rm -rf {} + 2>/dev/null || true
	rm -rf htmlcov/ .coverage

clean-pyc: ## Clean Python cache files
	@echo "$(GREEN)Cleaning Python cache...$(RESET)"
	find . -type f -name "*.pyc" -delete
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true

clean-docker: ## Clean Docker volumes and images
	@echo "$(YELLOW)⚠️  This will remove all Docker volumes and images. Press Ctrl+C to cancel...$(RESET)"
	@sleep 3
	docker compose down -v --rmi all

clean-db: ## Clean database files (for Docker setup)
	@echo "$(YELLOW)⚠️  This will delete database files. Press Ctrl+C to cancel...$(RESET)"
	@sleep 3
	rm -rf postgres_data/

clean-all: clean clean-docker clean-db ## Clean everything (code + Docker + DB)
	@echo "$(RED)⚠️  This will remove everything. Press Ctrl+C to cancel...$(RESET)"
	@sleep 5
	rm -rf .venv uv.lock
	rm -rf qdrant_storage/ uploads/ logs/ backups/

# ====================================================================================
# Monitoring & Health
# ====================================================================================

.PHONY: status health logs-all
status: ## Show status of all services
	@echo "$(BLUE)=== Docker Services ===$(RESET)"
	@docker compose ps || echo "$(YELLOW)Docker not running$(RESET)"
	@echo ""
	@echo "$(BLUE)=== Ollama Status ===$(RESET)"
	@curl -s http://localhost:11434/api/tags 2>/dev/null | grep -q "models" && echo "$(GREEN)✅ Ollama running$(RESET)" || echo "$(RED)❌ Ollama not running$(RESET)"
	@echo ""
	@echo "$(BLUE)=== Database ===$(RESET)"
	@pg_isready -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) -d $(DB_NAME) && echo "$(GREEN)✅ PostgreSQL ready$(RESET)" || echo "$(RED)❌ PostgreSQL not ready$(RESET)"

health: ## Check health of all services
	@echo "$(GREEN)Checking service health...$(RESET)"
	@echo -n "Backend: " && curl -sf http://localhost:7860/health > /dev/null 2>&1 && echo "$(GREEN)✅$(RESET)" || echo "$(RED)❌$(RESET)"
	@echo -n "PostgreSQL: " && pg_isready -h $(DB_HOST) -p $(DB_PORT) -U $(DB_USER) > /dev/null 2>&1 && echo "$(GREEN)✅$(RESET)" || echo "$(RED)❌$(RESET)"
	@echo -n "Ollama: " && curl -sf http://localhost:11434/api/tags > /dev/null 2>&1 && echo "$(GREEN)✅$(RESET)" || echo "$(RED)❌$(RESET)"

logs-all: ## Tail all application logs
	@tail -f logs/*.log 2>/dev/null || echo "$(YELLOW)No log files found$(RESET)"

# ====================================================================================
# Quick Start Commands
# ====================================================================================

.PHONY: quick-start quick-dev quick-prod
quick-start: init ## Quick start - setup everything and run locally
	@echo "$(GREEN)✅ Setup complete! Starting server...$(RESET)"
	$(MAKE) run-local

quick-dev: db-create db-extensions migrations-upgrade ## Quick dev start (assumes dependencies installed)
	@echo "$(GREEN)Starting development server...$(RESET)"
	$(MAKE) run-local

quick-prod: prod-build prod-up ## Quick production start
	@echo "$(GREEN)Production environment started$(RESET)"
	@echo "Check status with: make status"

# ====================================================================================
# Utility Commands
# ====================================================================================

.PHONY: seed-data create-admin show-schema
seed-data: ## Seed database with sample data
	@echo "$(GREEN)Seeding database...$(RESET)"
	$(UV) run python scripts/seed_data.py

create-admin: ## Create admin user (interactive)
	@echo "$(GREEN)Creating admin user...$(RESET)"
	$(UV) run python scripts/create_admin.py

show-schema: ## Show database schema
	@echo "$(GREEN)Database Schema:$(RESET)"
	@$(PSQL) -c "\dt" -c "\d+ profiles" -c "\d+ documents"

.DEFAULT_GOAL := help
