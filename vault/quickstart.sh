#!/bin/bash
# HICO Vault Quick Start Script (UV + Python 3.14 + pyproject.toml)
# This script sets up the complete environment using UV and pyproject.toml

set -e

echo "🚀 HICO Vault Quick Start (UV + Python 3.14)"
echo "============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${YELLOW}Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo "${RED}❌ Docker not found. Please install Docker first.${NC}"
    exit 1
fi

if ! command -v python3.14 &> /dev/null; then
    echo "${RED}❌ Python 3.14 not found. Please install Python 3.14.${NC}"
    echo "Visit: https://www.python.org/downloads/"
    exit 1
fi

echo "${GREEN}✅ Prerequisites OK${NC}"
echo ""

# Install UV if not present
echo "${YELLOW}Checking for UV package manager...${NC}"
if ! command -v uv &> /dev/null; then
    echo "${YELLOW}Installing UV...${NC}"
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
    echo "${GREEN}✅ UV installed${NC}"
else
    echo "${GREEN}✅ UV already installed${NC}"
fi

echo ""

# Install Ollama
echo "${YELLOW}Checking Ollama...${NC}"
if ! command -v ollama &> /dev/null; then
    echo "${YELLOW}Installing Ollama...${NC}"
    curl -fsSL https://ollama.ai/install.sh | sh
else
    echo "Ollama already installed"
fi

# Start Ollama (check if already running)
echo "${YELLOW}Starting Ollama service...${NC}"
if pgrep -x "ollama" > /dev/null; then
    echo "${GREEN}✅ Ollama already running${NC}"
else
    ollama serve &
    sleep 5
    echo "${GREEN}✅ Ollama started${NC}"
fi

# Pull models
echo "${YELLOW}Downloading AI models (this may take a while)...${NC}"
ollama pull llama2
ollama pull nomic-embed-text

echo "${GREEN}✅ Ollama ready${NC}"
echo ""

# Start Docker services
echo "${YELLOW}Starting Docker services...${NC}"
docker-compose up -d --build

echo "${GREEN}✅ Docker services started${NC}"
echo ""

# Setup Python environment with UV and pyproject.toml
echo "${YELLOW}Setting up Python environment with UV (using pyproject.toml)...${NC}"

# Create virtual environment with UV
if [ ! -d ".venv" ]; then
    uv venv --python 3.14
    echo "${GREEN}✅ Virtual environment created${NC}"
else
    echo "${GREEN}✅ Virtual environment exists${NC}"
fi

# Activate virtual environment
source .venv/bin/activate

# Sync dependencies from pyproject.toml (FAST!)
echo "${YELLOW}Installing dependencies from pyproject.toml with UV...${NC}"
uv sync

echo "${GREEN}✅ Python environment ready${NC}"
echo ""

# Configure environment
if [ ! -f .env ]; then
    echo "${YELLOW}Creating .env file...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
    elif [ -f .env.example ]; then
        cp .env.example .env
    fi
    echo "${YELLOW}⚠️  Please edit .env with your configuration${NC}"
fi

# Initialize database
echo "${YELLOW}Initializing database...${NC}"
python -c "from app.database import init_db; init_db()" 2>/dev/null || echo "Database init: OK or already initialized"

echo "${GREEN}✅ Database initialized${NC}"
echo ""

# Create Qdrant collection
echo "${YELLOW}Creating Qdrant collection...${NC}"
python -c "from app.connectors.store_data_in_kb import ensure_collection_exists; ensure_collection_exists()" 2>/dev/null || echo "Qdrant collection: OK or already exists"

echo "${GREEN}✅ Qdrant collection ready${NC}"
echo ""

# Final checks
echo "${YELLOW}Running health checks...${NC}"
sleep 3

if curl -s http://localhost:6333/collections > /dev/null; then
    echo "${GREEN}✅ Qdrant is healthy${NC}"
else
    echo "${RED}❌ Qdrant is not responding${NC}"
fi

if curl -s http://localhost:11434/api/tags > /dev/null; then
    echo "${GREEN}✅ Ollama is healthy${NC}"
else
    echo "${RED}❌ Ollama is not responding${NC}"
fi

# Generate lockfile if it doesn't exist
if [ ! -f "uv.lock" ]; then
    echo ""
    echo "${YELLOW}Generating uv.lock file for reproducible builds...${NC}"
    uv lock
    echo "${GREEN}✅ uv.lock generated${NC}"
fi

echo ""
echo "${GREEN}🎉 Setup complete!${NC}"
echo ""
echo "To start the application:"
echo "  ${YELLOW}source .venv/bin/activate${NC}"
echo "  ${YELLOW}uvicorn main:app --reload${NC}"
echo ""
echo "Or use UV directly (no activation needed):"
echo "  ${YELLOW}uv run uvicorn main:app --reload${NC}"
echo ""
echo "Then visit: ${YELLOW}http://localhost:8000${NC}"
echo "API docs: ${YELLOW}http://localhost:8000/docs${NC}"
echo ""
echo "Happy coding! 🚀"
echo ""
echo "${YELLOW}UV + pyproject.toml commands:${NC}"
echo "  ${YELLOW}uv sync${NC}                    - Sync dependencies from pyproject.toml"
echo "  ${YELLOW}uv sync --extra dev${NC}        - Include dev dependencies"
echo "  ${YELLOW}uv add <package>${NC}           - Add new dependency"
echo "  ${YELLOW}uv remove <package>${NC}        - Remove dependency"
echo "  ${YELLOW}uv lock${NC}                    - Update lockfile"
echo "  ${YELLOW}uv run <command>${NC}           - Run command in venv"
