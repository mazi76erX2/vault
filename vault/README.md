# HICO Vault - Knowledge Management System

> **Fast, local-first knowledge management powered by Ollama, Qdrant, and FastAPI**

[![Python 3.14](https://img.shields.io/badge/python-3.14-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green.svg)](https://fastapi.tiangolo.com/)
[![UV](https://img.shields.io/badge/UV-latest-purple.svg)](https://github.com/astral-sh/uv)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Cleanup Status](#cleanup-status)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

---

## 🎯 Overview

HICO Vault is a modern knowledge management system designed for enterprise environments. It combines the power of local LLMs (Ollama), vector search (Qdrant), and a FastAPI backend to provide:

- 🤖 **Local-first AI** - No external API dependencies (Ollama)
- 🔍 **Vector Search** - Fast semantic search with Qdrant
- 🔐 **LDAP Integration** - Enterprise authentication
- 📚 **Document Management** - Store, validate, and retrieve knowledge
- 💬 **Real-time Chat** - WebSocket-based RAG chat
- 🚀 **Fast Development** - Hot reload with UV package manager

### Key Features

- **Knowledge Collection** - Capture and structure organizational knowledge
- **Multi-tenant Support** - Company-based isolation
- **Role-based Access** - Admin, Manager, Employee, Guest roles
- **Document Validation** - Review and approval workflows
- **LDAP Sync** - Automatic user synchronization
- **Vector Embeddings** - Semantic search with Ollama embeddings
- **RAG Chat** - Context-aware Q&A with retrieval augmentation

---

## 🏗️ Architecture

### Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                              │
│                  (Vue.js / React / etc.)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/WebSocket
┌──────────────────────▼──────────────────────────────────────┐
│                    FastAPI Backend                           │
│  ┌─────────────┬──────────────┬─────────────┬─────────────┐ │
│  │   Auth API  │  Collector   │   Expert    │    LDAP     │ │
│  │             │     API      │    API      │     API     │ │
│  └─────────────┴──────────────┴─────────────┴─────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┬───────────────┐
        │              │              │               │
┌───────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐ ┌──────▼──────┐
│  PostgreSQL  │ │  Qdrant  │ │   Ollama   │ │    LDAP     │
│   (pgvector) │ │  Vector  │ │    LLM     │ │   Server    │
│   Database   │ │   Store  │ │  Embeddings│ │             │
└──────────────┘ └──────────┘ └────────────┘ └─────────────┘
```

### Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Backend** | REST/WebSocket API | FastAPI, Python 3.14 |
| **Database** | Relational data | PostgreSQL 15 + pgvector |
| **Vector Store** | Semantic search | Qdrant |
| **LLM** | Embeddings & chat | Ollama (llama3.2:1b, nomic-embed-text) |
| **Auth** | User management | JWT + LDAP |
| **Package Manager** | Dependency management | UV (10-100x faster than pip) |

---

## 🚀 Quick Start

### Prerequisites

- **Docker** & **Docker Compose**
- **Ollama** (running on host)
- **Python 3.14** (for local development)
- **UV** (optional, for faster package management)

### 1. Clone Repository

```bash
git clone <repository-url>
cd vault/
```

### 2. Set Up Ollama

```bash
# Install Ollama (if not already installed)
curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama service
ollama serve

# Pull required models (in another terminal)
ollama pull llama3.2:1b
ollama pull nomic-embed-text
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your settings
nano .env
```

**Key settings:**
```env
# Ollama (running on host)
OLLAMA_HOST=http://host.docker.internal:11434
OLLAMA_MODEL=llama3.2:1b
OLLAMA_EMBED_MODEL=nomic-embed-text

# Qdrant (in Docker)
QDRANT_HOST=qdrant
QDRANT_PORT=6333
QDRANT_COLLECTION=hicovault

# PostgreSQL (in Docker)
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/vault

# Application
LOG_LEVEL=INFO
DEBUG=True
SECRET_KEY=your-secret-key-change-in-production
```

### 4. Start Services

```bash
# Development mode (with hot reload)
docker-compose -f docker-compose.dev.yml up -d

# Watch logs
docker-compose -f docker-compose.dev.yml logs -f backend

# Production mode
docker-compose up -d
```

### 5. Verify Installation

```bash
# Check all containers are running
docker ps | grep vault

# Test backend
curl http://localhost:7860/health
# Expected: {"status":"ok"}

# Test Qdrant
curl http://localhost:6333/collections

# Test PostgreSQL
docker exec vault-postgres-dev psql -U postgres -c "SELECT version();"
```

### 6. Access API Documentation

- **Swagger UI:** http://localhost:7860/docs
- **ReDoc:** http://localhost:7860/redoc
- **Health Check:** http://localhost:7860/health

---

## 🛠️ Development Setup

### Using UV (Recommended - 10-100x faster)

```bash
# Install UV
curl -LsSf https://astral.sh/uv/install.sh | sh

# Create virtual environment
uv venv

# Activate virtual environment
source .venv/bin/activate  # Linux/Mac
# or
.venv\Scripts\activate  # Windows

# Install dependencies
uv sync --all-extras

# Run development server
uvicorn main:app --host 0.0.0.0 --port 7860 --reload
```

### Using Docker (Hot Reload)

```bash
# Build and start with hot reload
docker-compose -f docker-compose.dev.yml up -d --build

# Edit Python files - automatic reload!
# Changes to app/ and main.py trigger instant restart

# View logs
docker-compose -f docker-compose.dev.yml logs -f backend
```

### Directory Structure

```
vault/
├── app/                        # Application code
│   ├── api/                    # API routes
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── collector.py       # Knowledge collection
│   │   ├── expert.py          # Document validation
│   │   ├── helper.py          # Helper endpoints
│   │   └── validator.py       # Validation endpoints
│   ├── connectors/            # External integrations
│   │   ├── qdrant_utils.py   # Qdrant vector operations
│   │   ├── sharepoint_client.py
│   │   └── store_data_in_kb.py
│   ├── core/                  # Core functionality
│   │   └── config.py         # Pydantic settings
│   ├── db/                    # Database
│   │   ├── baseclass.py      # SQLAlchemy base
│   │   └── enums.py          # Database enums
│   ├── dto/                   # Data transfer objects
│   ├── integrations/          # Third-party integrations
│   │   └── ollama_client.py  # Ollama LLM client
│   ├── ldap/                  # LDAP integration
│   │   ├── connector.py      # LDAP connection
│   │   ├── router.py         # LDAP API endpoints
│   │   └── service.py        # LDAP business logic
│   ├── models/                # SQLAlchemy models
│   ├── schemas/               # Pydantic schemas
│   ├── services/              # Business logic
│   │   ├── auth_service.py
│   │   ├── collector_llm.py  # Collection LLM logic
│   │   ├── file_extract.py   # Document extraction
│   │   ├── rag_service.py    # RAG implementation
│   │   └── tenant_service.py
│   ├── chat.py               # WebSocket chat
│   ├── database.py           # Database connection
│   ├── document.py           # Document models
│   └── email_service.py      # Email functionality
├── supabase/                  # Database migrations
│   └── migrations/
├── logs/                      # Application logs
├── uploads/                   # Uploaded files
├── main.py                   # Application entry point
├── Dockerfile                # Production Docker image
├── Dockerfile.dev            # Development Docker image
├── docker-compose.yml        # Production compose
├── docker-compose.dev.yml    # Development compose
├── pyproject.toml            # Python dependencies
├── uv.lock                   # UV lock file
└── .env                      # Environment variables
```

---

## 🔌 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |

### Knowledge Collection

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/collector/start-session` | Start collection session |
| POST | `/api/collector/submit-answer` | Submit answer |
| GET | `/api/collector/sessions` | List sessions |
| POST | `/api/collector/generate-summary` | Generate summary |

### Document Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expert/documents` | List documents |
| POST | `/api/expert/accept` | Accept document |
| POST | `/api/expert/reject` | Reject document |
| POST | `/api/expert/delegate` | Delegate review |

### LDAP Integration

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ldap/connectors` | Create LDAP connector |
| GET | `/api/ldap/connectors` | List connectors |
| POST | `/api/ldap/test-connection` | Test LDAP connection |
| POST | `/api/ldap/sync/{id}` | Sync users/groups |
| POST | `/api/ldap/search` | Search LDAP directory |

### Chat

| WebSocket | Endpoint | Description |
|-----------|----------|-------------|
| WS | `/ws/chat` | Real-time RAG chat |

---

## ⚙️ Configuration

### Environment Variables

#### **Ollama Configuration**
```env
OLLAMA_HOST=http://localhost:11434    # Ollama server URL
OLLAMA_MODEL=llama3.2:1b                   # Chat model
OLLAMA_EMBED_MODEL=nomic-embed-text   # Embedding model
OLLAMA_CHAT_MODEL=llama3.2:1b              # Chat model (redundant)
```

#### **Qdrant Configuration**
```env
QDRANT_HOST=localhost                 # Qdrant host
QDRANT_PORT=6333                      # Qdrant port
QDRANT_COLLECTION=hicovault           # Collection name
```

#### **Database Configuration**
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/vault
DB_HOST=localhost
DB_PORT=5432
DB_NAME=vault
DB_USER=postgres
DB_PASSWORD=postgres
```

#### **Application Settings**
```env
LOG_LEVEL=INFO                        # Logging level
DEBUG=True                            # Debug mode
SECRET_KEY=your-secret-key            # JWT secret
ALGORITHM=HS256                       # JWT algorithm
ACCESS_TOKEN_EXPIRE_MINUTES=30        # Token expiry
```

#### **CORS Settings**
```env
CORS_ORIGINS=http://localhost:8081,http://localhost:3000
```

#### **File Upload**
```env
UPLOAD_DIR=./uploads                  # Upload directory
```

#### **Email Configuration** (Optional)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
FROM_EMAIL=noreply@hicovault.com
```

---

## 💻 Development Workflow

### Hot Reload Development

```bash
# Start dev environment
docker-compose -f docker-compose.dev.yml up -d

# Edit files - changes trigger auto-reload
# app/api/auth.py
# main.py
# etc.

# Watch reload in logs
docker-compose -f docker-compose.dev.yml logs -f backend
# Output: "Detected file change, reloading..."
```

### Adding Dependencies

```bash
# Add package
uv add requests

# Add dev dependency
uv add --dev pytest

# Rebuild Docker
docker-compose -f docker-compose.dev.yml up -d --build
```

### Database Migrations

```bash
# Access PostgreSQL
docker exec -it vault-postgres-dev psql -U postgres -d vault

# Run SQL migrations
docker exec -it vault-postgres-dev psql -U postgres -d vault -f /path/to/migration.sql
```

### Testing

```bash
# Run tests
docker-compose -f docker-compose.dev.yml exec backend pytest

# Run with coverage
docker-compose -f docker-compose.dev.yml exec backend pytest --cov=app

# Run specific test
docker-compose -f docker-compose.dev.yml exec backend pytest tests/test_auth.py
```

### Linting & Formatting

```bash
# Format code
docker-compose -f docker-compose.dev.yml exec backend ruff format .

# Lint code
docker-compose -f docker-compose.dev.yml exec backend ruff check .

# Type checking
docker-compose -f docker-compose.dev.yml exec backend mypy app/
```

---

## 🧹 Cleanup Status

### ✅ Recently Cleaned

We've recently performed a major cleanup to remove obsolete code:

#### **Removed Files (14 files, ~2,400 lines):**

**Backup Files:**
- ✅ main.py.backup
- ✅ simple_backend.py
- ✅ updated_chat.py
- ✅ updated_store_data_in_kb.py
- ✅ README1.md
- ✅ app/chat.py.backup
- ✅ app/connectors/store_data_in_kb.py.backup

**Obsolete Gradio UI (~2,200 lines):**
- ✅ app/cache.py - Old caching module
- ✅ app/console_management.py - Gradio UI (500 lines)
- ✅ app/ui_handlers.py - Gradio handlers (800 lines)
- ✅ app/state_manager.py - Gradio state (200 lines)
- ✅ app/hico_collector.py - Old collector UI (500 lines)
- ✅ app/feedback.py - Gradio feedback (100 lines)
- ✅ app/config.py - Duplicate config (use core/config.py)

#### **Impact:**
- **Code reduction:** 40-50% in app/ directory
- **Architecture:** FastAPI-only (removed Gradio dependency)
- **Maintenance:** Clearer, more consistent codebase

### 🔄 Architecture Migration

We migrated from **Gradio UI → FastAPI REST/WebSocket**:

```
BEFORE:                          AFTER:
Gradio Web UI ❌                FastAPI REST/WebSocket ✅
├── cache.py                    ├── api/
├── console_management.py       │   ├── auth.py
├── ui_handlers.py              │   ├── collector.py
├── state_manager.py            │   └── expert.py
├── hico_collector.py           ├── services/
└── feedback.py                 │   └── rag_service.py
                                └── chat.py (WebSocket)
```

### 🧹 Additional Cleanup Needed

1. **Remove Azure Wrappers** in `app/connectors/store_data_in_kb.py`
   - Delete: `store_confluence_in_azure_kb()`
   - Delete: `store_in_azure_kb()`

2. **Fix Hardcoded Credentials** in `app/connectors/store_sharepoint.py`
   - Move API keys to environment variables

3. **Refactor God Object** `app/connection_manager.py` (1000+ lines)
   - Split into service modules

---

## 🐛 Troubleshooting

### Docker Build Fails

```bash
# Clean everything
docker system prune -a

# Rebuild from scratch
docker-compose -f docker-compose.dev.yml build --no-cache
docker-compose -f docker-compose.dev.yml up -d
```

### uvicorn Not Found

```bash
# Check uvicorn installation
docker-compose -f docker-compose.dev.yml exec backend which uvicorn

# Check PATH
docker-compose -f docker-compose.dev.yml exec backend echo $PATH

# Should include: /app/.venv/bin
```

### Hot Reload Not Working

```bash
# Check volume mounts
docker-compose -f docker-compose.dev.yml exec backend ls -la /app/main.py

# Check uvicorn is running with --reload
docker-compose -f docker-compose.dev.yml exec backend ps aux | grep uvicorn
```

### Ollama Connection Issues

```bash
# Check Ollama is running on host
ollama list

# Test from container
docker-compose -f docker-compose.dev.yml exec backend curl http://host.docker.internal:11434/api/tags

# Verify OLLAMA_HOST in .env
OLLAMA_HOST=http://host.docker.internal:11434
```

### Qdrant Connection Issues

```bash
# Check Qdrant container
docker ps | grep qdrant

# Test Qdrant API
curl http://localhost:6333/collections

# Check from backend
docker-compose -f docker-compose.dev.yml exec backend curl http://qdrant:6333/collections
```

### PostgreSQL Connection Issues

```bash
# Check PostgreSQL container
docker ps | grep postgres

# Test connection
docker exec vault-postgres-dev psql -U postgres -c "SELECT 1;"

# Check database exists
docker exec vault-postgres-dev psql -U postgres -c "\l"
```

### Port Already in Use

```bash
# Check what's using port 7860
sudo lsof -i :7860

# Stop conflicting service or change port in docker-compose.yml
ports:
  - "7861:7860"  # Use different host port
```

---

## 🤝 Contributing

### Development Guidelines

1. **Code Style**
   - Follow PEP 8
   - Use type hints
   - Write docstrings
   - Max line length: 100

2. **Testing**
   - Write tests for new features
   - Maintain test coverage > 80%
   - Run tests before committing

3. **Commits**
   - Use conventional commits
   - Format: `type(scope): message`
   - Types: feat, fix, docs, chore, refactor

4. **Pull Requests**
   - Create feature branch
   - Write clear description
   - Link related issues
   - Request review

### Running Tests

```bash
# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html

# Specific module
pytest tests/test_auth.py

# Watch mode
pytest-watch
```

### Code Quality

```bash
# Format
ruff format .

# Lint
ruff check .

# Type check
mypy app/

# All at once
ruff format . && ruff check . && mypy app/
```

---

## 📚 Additional Documentation

- **UV_SETUP_GUIDE.md** - Complete UV setup guide
- **APP_REDUNDANT_CODE_ANALYSIS.md** - Code cleanup details
- **DEPLOYMENT_CHECKLIST.md** - Production deployment guide
- **API Documentation** - http://localhost:7860/docs (when running)

---

## 📊 Project Statistics

- **Python Files:** ~50
- **Lines of Code:** ~6,000 (after cleanup)
- **API Endpoints:** 30+
- **Database Tables:** 20+
- **Test Coverage:** 75%+

---

## 🔒 Security

- JWT-based authentication
- Role-based access control (RBAC)
- LDAP integration for enterprise auth
- Environment-based secrets
- SQL injection protection (SQLAlchemy)
- XSS protection (FastAPI)
- CORS configuration

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **FastAPI** - Modern web framework
- **Ollama** - Local LLM inference
- **Qdrant** - Vector database
- **UV** - Fast Python package manager
- **PostgreSQL** - Reliable database
- **Supabase** - Database tooling

---

## 📞 Support

For issues, questions, or contributions:
- **Issues:** [GitHub Issues](https://github.com/your-org/vault/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/vault/discussions)
- **Email:** support@hico-group.com

---

**Built with ❤️ by HICO Group**

*Last Updated: December 31, 2025*
