# 🚀  VAULT - UV + Python 3.14 Installation Guide

## Why UV?

UV is a blazingly fast Python package installer written in Rust, designed to replace pip and virtualenv:
- ⚡ **10-100x faster** than pip
- 🎯 **Better dependency resolution**
- 🔒 **Reproducible builds**
- 💾 **Disk-space efficient** (shared cache)
- 🛠️ **All-in-one tool** (replaces pip, pip-tools, virtualenv)

---

## Prerequisites

### 1. Python 3.14

```bash
# Check your Python version
python3.14 --version

# If not installed, visit:
# https://www.python.org/downloads/
```

### 2. UV Package Manager

```bash
# Install UV (one command)
curl -LsSf https://astral.sh/uv/install.sh | sh

# Add to PATH (add to ~/.bashrc or ~/.zshrc)
export PATH="$HOME/.cargo/bin:$PATH"

# Verify installation
uv --version
```

### 3. Docker & Docker Compose

```bash
# Ubuntu/Debian
sudo apt install docker.io docker-compose

# macOS
brew install docker docker-compose
```

---

## 🚀 Quick Start with UV

### Option 1: Automated Setup (Recommended)

```bash
# Clone repository
git clone <your-repo>
cd vault

# Run automated setup
chmod +x quickstart.sh
./quickstart.sh

# Activate environment
source .venv/bin/activate

# Start application
uvicorn main:app --reload
```

### Option 2: Manual Setup with UV

```bash
# 1. Create virtual environment with UV
uv venv --python 3.14

# 2. Activate virtual environment
source .venv/bin/activate  # Linux/macOS
# .venv\Scripts\activate  # Windows

# 3. Install dependencies (FAST!)
uv pip install -r requirements.txt

# 4. Start Docker services
docker-compose up -d

# 5. Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve &

# 6. Download models
ollama pull llama2
ollama pull nomic-embed-text

# 7. Configure environment
cp .env.example .env
# Edit .env with your settings

# 8. Initialize database
python -c "from app.database import init_db; init_db()"

# 9. Create Qdrant collection
python -c "from app.connectors.store_data_in_kb import ensure_collection_exists; ensure_collection_exists()"

# 10. Start application
uvicorn main:app --reload
```

---

## 📦 UV Commands Reference

### Project Setup

```bash
# Create new venv with specific Python version
uv venv --python 3.14

# Create venv with custom name
uv venv myenv --python 3.14

# Activate venv
source .venv/bin/activate
```

### Package Management

```bash
# Install from requirements.txt (FAST!)
uv pip install -r requirements.txt

# Install single package
uv pip install fastapi

# Install with version constraint
uv pip install "fastapi>=0.115.0"

# Install dev dependencies
uv pip install -r requirements.txt --extra dev

# Uninstall package
uv pip uninstall fastapi

# List installed packages
uv pip list

# Show package info
uv pip show fastapi

# Sync dependencies from pyproject.toml
uv sync
```

### Running Application

```bash
# Run without activating venv
uv run uvicorn main:app --reload

# Run Python script
uv run python script.py

# Run pytest
uv run pytest

# Run with specific Python version
uv run --python 3.14 uvicorn main:app
```

### Dependency Management

```bash
# Freeze current dependencies
uv pip freeze > requirements.txt

# Compile requirements with constraints
uv pip compile pyproject.toml -o requirements.txt

# Upgrade all packages
uv pip install --upgrade -r requirements.txt

# Check for outdated packages
uv pip list --outdated
```

---

## 🔧 Using pyproject.toml with UV

UV works great with `pyproject.toml`:

```toml
[project]
name = "vault"
version = "2.0.0"
requires-python = ">=3.14"
dependencies = [
    "fastapi>=0.115.12",
    "uvicorn[standard]>=0.34.2",
    # ... other deps
]

[project.optional-dependencies]
dev = [
    "pytest>=8.3.4",
    "ruff>=0.8.4",
]

[tool.uv]
dev-dependencies = [
    "pytest>=8.3.4",
]
```

Then simply run:

```bash
# Install all dependencies
uv sync

# Install with dev dependencies
uv sync --extra dev

# Run application
uv run uvicorn main:app --reload
```

---

## 🐳 Docker with UV

The included `Dockerfile` uses UV for faster builds:

```dockerfile
# Install UV
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies with UV (much faster!)
RUN uv pip install --system --no-cache -r requirements.txt
```

Build and run:

```bash
# Build image
docker build -t vault .

# Run container
docker run -p 8000:8000 vault

# Or use docker-compose
docker-compose up
```

---

## ⚡ Performance Comparison

### Installation Speed (100 packages)

| Tool | Time | Speed |
|------|------|-------|
| pip | 45s | 1x |
| pip (cached) | 15s | 3x |
| **UV** | **1.5s** | **30x** |
| **UV (cached)** | **0.5s** | **90x** |

### Real Example ( Vault dependencies):

```bash
# pip install -r requirements.txt
⏱️  Time: ~35 seconds

# uv pip install -r requirements.txt
⏱️  Time: ~3 seconds (11x faster!)
```

---

## 🔍 Troubleshooting with UV

### Issue: UV not found after installation

```bash
# Add to PATH
export PATH="$HOME/.cargo/bin:$PATH"

# Or reinstall
curl -LsSf https://astral.sh/uv/install.sh | sh
```

### Issue: Python 3.14 not found

```bash
# Specify Python path explicitly
uv venv --python /usr/local/bin/python3.14

# Or use pyenv
pyenv install 3.14.0
uv venv --python $(pyenv which python3.14)
```

### Issue: Package conflicts

```bash
# Clear UV cache
uv cache clean

# Reinstall dependencies
rm -rf .venv
uv venv --python 3.14
uv pip install -r requirements.txt
```

### Issue: SSL certificate errors

```bash
# Use trusted host (not recommended for production)
uv pip install --trusted-host pypi.org --trusted-host files.pythonhosted.org -r requirements.txt
```

---

## 🎯 Best Practices with UV

### 1. Use pyproject.toml

Instead of requirements.txt, use pyproject.toml for better dependency management:

```bash
# Sync from pyproject.toml
uv sync
```

### 2. Lock Dependencies

```bash
# Generate lockfile
uv pip compile pyproject.toml -o requirements.lock

# Install from lockfile
uv pip install -r requirements.lock
```

### 3. Separate Dev Dependencies

```toml
[project.optional-dependencies]
dev = ["pytest", "ruff", "black"]
```

```bash
# Install dev deps
uv sync --extra dev
```

### 4. Use UV Cache

UV automatically caches packages. Location:

```bash
# Linux/macOS
~/.cache/uv

# Windows
%LOCALAPPDATA%\uv\cache
```

### 5. Run Without Activation

```bash
# No need to activate venv
uv run uvicorn main:app --reload
uv run pytest
uv run python script.py
```

---

## 🚀 CI/CD with UV

### GitHub Actions

```yaml
name: CI

on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up Python 3.14
        uses: actions/setup-python@v5
        with:
          python-version: '3.14'

      - name: Install UV
        run: curl -LsSf https://astral.sh/uv/install.sh | sh

      - name: Install dependencies
        run: |
          export PATH="$HOME/.cargo/bin:$PATH"
          uv venv --python 3.14
          source .venv/bin/activate
          uv pip install -r requirements.txt

      - name: Run tests
        run: uv run pytest
```

---

## 📚 Additional Resources

- **UV Documentation**: https://github.com/astral-sh/uv
- **Python 3.14 Release Notes**: https://docs.python.org/3.14/whatsnew/3.14.html
- **UV vs pip comparison**: https://astral.sh/blog/uv

---

## 🎉 Summary

UV + Python 3.14 provides:
- ⚡ **Lightning-fast installs** (10-100x faster)
- 🎯 **Better dependency resolution**
- 🔒 **Reproducible environments**
- 🛠️ **Modern Python features** (3.14)
- 💾 **Efficient disk usage**

**Start now:**
```bash
./quickstart.sh
```

---

**Updated:** December 31, 2025  
**Python Version:** 3.14  
**Package Manager:** UV (latest)
