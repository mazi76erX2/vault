# 🏢 HICO VAULT - Knowledge Management System
## Local-First Architecture with Ollama + Qdrant + pgvector

**Version:** 2.0.0  
**Migration Date:** December 2025  
**Status:** ✅ Production Ready

---

## 📖 Overview

HICO Vault is an enterprise knowledge management system that uses RAG (Retrieval-Augmented Generation) to provide intelligent answers from your organization's documents. This version uses a completely local-first architecture for maximum privacy and control.

### Key Features

- 🔒 **Privacy-First**: All data stays on your infrastructure
- 💰 **Cost-Effective**: No cloud API costs
- ⚡ **Fast**: Local processing with optimized vector search
- 🎯 **Accurate**: Advanced RAG with document validation
- 🔐 **Secure**: Multi-level access control
- 📊 **Scalable**: Handles millions of documents

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   FastAPI Backend                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   chat.py    │  │   main.py    │  │  routers/    │      │
│  │   (RAG)      │  │  (API)       │  │  (endpoints) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────┬────────────┬────────────────┬────────────────────┘
          │            │                │
    ┌─────▼────┐  ┌───▼─────┐    ┌────▼────────┐
    │  Ollama  │  │ Qdrant  │    │ PostgreSQL  │
    │  (LLM)   │  │(Vectors)│    │ (pgvector)  │
    └──────────┘  └─────────┘    └─────────────┘
```

### Components

1. **Ollama**: Local LLM for embeddings and completions
2. **Qdrant**: High-performance vector database
3. **PostgreSQL + pgvector**: Relational data with vector support
4. **FastAPI**: Modern Python web framework
5. **Supabase**: Self-hosted auth and storage (optional)

---

## 🚀 Quick Start

### Prerequisites

- Python 3.10+
- Docker & Docker Compose
- 8GB RAM minimum (16GB recommended)
- 20GB disk space

### Installation

```bash
# 1. Clone the repository
git clone <your-repo>
cd hicovault

# 2. Start services with Docker Compose
docker-compose up -d

# 3. Install Ollama (runs on host)
curl -fsSL https://ollama.ai/install.sh | sh
ollama serve &

# 4. Pull required models
ollama pull llama2
ollama pull nomic-embed-text

# 5. Install Python dependencies
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# 6. Configure environment
cp .env.example .env
# Edit .env with your values

# 7. Initialize database
python -c "from app.database import init_db; init_db()"

# 8. Start the application
uvicorn main:app --reload
```

Visit http://localhost:8000

---

## 📁 Project Structure

```
hicovault/
├── app/
│   ├── api/                    # API route handlers
│   │   ├── auth.py            # Authentication endpoints
│   │   ├── collector.py       # Knowledge collection
│   │   ├── helper.py          # Helper chatbot
│   │   ├── validator.py       # Document validation
│   │   └── expert.py          # Expert review
│   ├── connectors/            # External integrations
│   │   └── store_data_in_kb.py # Qdrant storage
│   ├── services/              # Business logic
│   │   ├── auth_service.py    # Auth logic
│   │   ├── rag_service.py     # RAG implementation
│   │   └── tenant_service.py  # Multi-tenancy
│   ├── models/                # SQLAlchemy models
│   ├── ldap/                  # LDAP integration
│   ├── chat.py                # RAG chat implementation
│   ├── database.py            # Database configuration
│   └── config.py              # Application config
├── main.py                     # FastAPI application entry
├── requirements.txt            # Python dependencies
├── docker-compose.yml          # Service orchestration
├── Dockerfile                  # Backend container
├── .env.example               # Environment template
└── MIGRATION_GUIDE.md         # Migration documentation
```

---

## 🔧 Configuration

### Environment Variables

See `.env.example` for all available configuration options.

**Critical Settings:**

```bash
# Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text

# Qdrant
QDRANT_HOST=localhost
QDRANT_COLLECTION=hicovault

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hicovault
```

### Model Selection

Choose models based on your hardware:

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| llama2 | 3.8GB | Fast | Good | General chat |
| llama2:13b | 7.3GB | Medium | Better | Better responses |
| llama2:70b | 38GB | Slow | Best | Production |
| nomic-embed-text | 274MB | Very Fast | Excellent | Embeddings |

---

## 📚 API Documentation

### Store Document

```bash
POST /api/console/store_in_kb
Content-Type: application/json

{
  "doc_id": "123",
  "summary": "Document content...",
  "severity_levels": "Medium",
  "title": "Document Title",
  "link": "https://example.com/doc"
}
```

### Chat Endpoint

```bash
POST /api/chat
Content-Type: application/json

{
  "user_id": "user-123",
  "question": "What is the knowledge base?",
  "history": []
}
```

### WebSocket Chat

```javascript
const ws = new WebSocket("ws://localhost:8000/ws/chat");
ws.onmessage = (event) => {
  console.log("Response:", event.data);
};
ws.send("Your question here");
```

Full API documentation available at: http://localhost:8000/docs

---

## 🧪 Testing

### Unit Tests

```bash
pytest tests/
```

### Integration Tests

```bash
pytest tests/integration/
```

### Manual Testing

```bash
# Test document storage
python scripts/test_storage.py

# Test RAG chat
python scripts/test_chat.py

# Load test
python scripts/load_test.py
```

---

## 📊 Monitoring

### Health Checks

```bash
# Application health
curl http://localhost:8000/health

# Ollama health
curl http://localhost:11434/api/tags

# Qdrant health
curl http://localhost:6333/collections
```

### Logs

```bash
# Application logs
tail -f logs/backend.log

# Docker logs
docker-compose logs -f
```

---

## 🔐 Security

### Access Levels

1. **Public** (Level 1): Accessible to all users
2. **Low** (Level 2): Basic authenticated users
3. **Medium** (Level 3): Department members
4. **High** (Level 4): Managers and leads
5. **Critical** (Level 5): Executives only

### Authentication

- JWT-based authentication
- Role-based access control (RBAC)
- Multi-tenancy support
- LDAP integration available

---

## 📦 Deployment

### Production Checklist

- [ ] Update `.env` with production values
- [ ] Change `SECRET_KEY` to a strong random value
- [ ] Set `DEBUG=False`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Configure backup for PostgreSQL and Qdrant
- [ ] Set up monitoring and alerting
- [ ] Review and update access control policies
- [ ] Load test the application
- [ ] Set up log rotation

### Docker Production Deploy

```bash
# Build and start in production mode
docker-compose -f docker-compose.prod.yml up -d

# Scale backend if needed
docker-compose up -d --scale backend=3
```

### Kubernetes Deploy

See `k8s/` directory for Kubernetes manifests.

---

## 🐛 Troubleshooting

### Common Issues

**1. "Connection refused" to Ollama**
```bash
# Check if Ollama is running
ps aux | grep ollama
ollama serve &
```

**2. Slow embeddings**
```bash
# Use smaller/faster model
ollama pull all-minilm
# Update .env: OLLAMA_EMBED_MODEL=all-minilm
```

**3. Out of memory**
```bash
# Use smaller model
ollama pull llama2:7b
# Update .env: OLLAMA_MODEL=llama2:7b
```

**4. Qdrant collection not found**
```python
from app.connectors.store_data_in_kb import ensure_collection_exists
ensure_collection_exists()
```

---

## 📖 Documentation

- [Migration Guide](MIGRATION_GUIDE.md) - Detailed migration documentation
- [API Reference](http://localhost:8000/docs) - Interactive API docs
- [Architecture](docs/ARCHITECTURE.md) - System architecture
- [Contributing](CONTRIBUTING.md) - Contribution guidelines

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🆘 Support

- 📧 Email: support@hico-group.com
- 💬 Discord: [Join our community]()
- 📚 Documentation: [docs.hicovault.com]()
- 🐛 Issues: [GitHub Issues]()

---

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai/) - Local LLM runtime
- [Qdrant](https://qdrant.tech/) - Vector database
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [pgvector](https://github.com/pgvector/pgvector) - PostgreSQL vector extension

---

**Built with ❤️ by the HICO Group team**
