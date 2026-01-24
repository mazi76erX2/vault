# RAG Quick Start Guide

Get your RAG system up and running in 5 minutes.

## 1. Setup Backend

### Prerequisites
- Python 3.14+
- PostgreSQL 14+ with pgvector
- Ollama (for local embeddings/fallback LLM)
- (Optional) Gemini API key for cloud generation

### Installation

```bash
cd vault

# Install dependencies
uv sync

# Create .env file
cp .env.example .env

# Configure required settings
# .env file
OLLAMA_HOST=http://localhost:11434
OLLAMA_EMBED_MODEL=nomic-embed-text
OLLAMA_CHAT_MODEL=llama3.2:1b
USE_HYBRID_SEARCH=true
USE_RERANKER=true
USE_QUERY_EXPANSION=true
```

### Start Services

```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: PostgreSQL
docker-compose up -d postgres

# Terminal 3: Backend API
cd vault
python -m uvicorn main:app --reload --host 0.0.0.0 --port 7860
```

**Check health:**
```bash
curl http://localhost:7860/health
```

## 2. Upload Documents

### Upload via API

```bash
# Upload a PDF or document
curl -X POST "http://localhost:7860/api/v1/kb/upload" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@document.pdf" \
  -F "title=My Document" \
  -F "access_level=1"
```

### Verify Upload

```bash
# Check document count
curl -X GET "http://localhost:7860/api/v1/rag/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Response shows total_chunks and total_documents
```

## 3. Test RAG Pipeline

### Ask a Question

```bash
curl -X POST "http://localhost:7860/api/v1/rag/ask" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main topic?",
    "top_k": 5,
    "use_query_enhancement": true
  }'
```

### Find Documents

```bash
curl -X POST "http://localhost:7860/api/v1/rag/find" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "budget allocation",
    "top_k": 10
  }'
```

### Check Performance

Response includes performance metrics:
```json
{
  "performance": {
    "embedding_ms": 45.2,
    "search_ms": 123.5,
    "rerank_ms": 89.3,
    "generation_ms": 2340.1,
    "total_ms": 2598.1
  }
}
```

## 4. Setup Frontend

```bash
cd vault-ui

# Install dependencies
npm install
# or
bun install

# Start dev server
npm run dev
# or
bun run dev

# Open browser
# http://localhost:5173
```

## 5. Access RAG Features

### Chat Interface
- **URL**: http://localhost:5173/rag/chat
- **Features**:
  - Ask questions
  - View sources with scores
  - See performance metrics
  - Real-time streaming

### Dashboard
- **URL**: http://localhost:5173/rag/dashboard
- **Features**:
  - System statistics
  - Live metrics
  - Feature checklist
  - Auto-refresh

## 6. Configuration Options

### Enable/Disable Features

```bash
# .env file

# Hybrid Search (recommended: true)
USE_HYBRID_SEARCH=true
VECTOR_WEIGHT=0.7      # 70% vector, 30% keyword
KEYWORD_WEIGHT=0.3

# Reranking (recommended: true)
USE_RERANKER=true

# Query Enhancement (recommended: true)
USE_QUERY_EXPANSION=true
USE_HYDE=false         # Slower, optional

# Retrieval
RETRIEVAL_TOP_K=20     # Initial candidates
RETRIEVAL_FINAL_K=5    # Final results

# Generation
GENERATION_TEMPERATURE=0.1  # 0 = deterministic, 1 = creative
GENERATION_MAX_TOKENS=2048
```

### Models

```bash
# Local embeddings
OLLAMA_EMBED_MODEL=nomic-embed-text  # 768 dimensions

# Local LLM (fallback)
OLLAMA_CHAT_MODEL=llama3.2:1b

# Cloud LLM (primary)
GEMINI_API_KEY=your_key_here
```

## 7. Common Tasks

### Upload Multiple Documents

```bash
for file in documents/*.pdf; do
  curl -X POST "http://localhost:7860/api/v1/kb/upload" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -F "file=@$file" \
    -F "title=$(basename $file)"
done
```

### Monitor Performance

```bash
# Watch metrics in real-time
watch -n 2 'curl -s http://localhost:7860/api/v1/rag/stats \
  -H "Authorization: Bearer YOUR_TOKEN" | jq'
```

### Debug Query

```bash
# Get detailed response with all sources
curl -X POST "http://localhost:7860/api/v1/rag/ask" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "test query",
    "top_k": 10,
    "use_query_enhancement": true
  }' | jq
```

### Scale Configuration

```bash
# For slow queries, increase retrieval
RETRIEVAL_TOP_K=50       # Get more candidates
RETRIEVAL_FINAL_K=10     # Return more results

# For fast queries, optimize
RETRIEVAL_TOP_K=10       # Less retrieval
RETRIEVAL_FINAL_K=3      # Less results
USE_RERANKER=false       # Skip reranking

# For accuracy, enhance
USE_QUERY_EXPANSION=true
USE_HYDE=true            # Slower but more accurate
VECTOR_WEIGHT=0.8        # Emphasize semantic similarity
```

## 8. Troubleshooting

### API Returns 401 Unauthorized

```bash
# Check your token
curl -X GET "http://localhost:7860/health"

# Should return 200 OK
# For authenticated endpoints, add Authorization header
```

### No Documents Found

```bash
# Check documents are uploaded
curl -X GET "http://localhost:7860/api/v1/rag/stats" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Verify total_chunks > 0

# Check embeddings are computed
# Query database directly
psql -c "SELECT COUNT(*) FROM kb_chunks;"
```

### Slow Responses (>5s)

```bash
# Disable expensive features
USE_RERANKER=false       # Skip reranking
USE_QUERY_EXPANSION=false
USE_HYDE=false

# Check Ollama status
curl http://localhost:11434/api/tags

# Use smaller model
OLLAMA_EMBED_MODEL=all-minilm  # Faster, less accurate
```

### Ollama Connection Error

```bash
# Start Ollama
ollama serve

# Pull models
ollama pull nomic-embed-text
ollama pull llama3.2:1b

# Test connection
curl http://localhost:11434/api/tags
```

### PostgreSQL Connection Error

```bash
# Check connection
psql postgresql://user:pass@localhost:5432/vault

# Check pgvector extension
psql -c "CREATE EXTENSION IF NOT EXISTS vector;"

# Check indexes
psql -c "SELECT * FROM pg_indexes WHERE tablename = 'kb_chunks';"
```

## 9. Performance Benchmarks

Typical response times on a 2024 MacBook Pro:

| Stage | Time |
|-------|------|
| Embedding | 45ms |
| Search | 123ms |
| Reranking | 89ms |
| Generation | 2340ms |
| **Total** | **2598ms** |

For optimization:
- Vector search: ~50ms (pgvector)
- Keyword search: ~50ms (BM25)
- Combined with RRF: ~80ms
- Reranking (optional): +50-100ms
- Generation: 1000-5000ms depending on model

## 10. Next Steps

1. **Customize Prompts**: Edit RAG generation prompts in `rag_pipeline.py`
2. **Add More Models**: Configure additional embedding/LLM models
3. **Implement Feedback**: Add user feedback loop for quality improvement
4. **Deploy**: Use Docker and Kubernetes configs provided
5. **Monitor**: Set up logging and metrics collection

## Useful Links

- 📖 [Full Documentation](./RAG_INTEGRATION_GUIDE.md)
- 🔧 [Configuration Reference](./vault/app/core/config.py)
- 🎯 [RAG Pipeline Code](./vault/app/services/rag_pipeline.py)
- 💬 [Chat Component](./vault-ui/src/pages/ChatPage.tsx)
- 📊 [Dashboard Component](./vault-ui/src/features/dashboard/Dashboard.tsx)

---

**Ready to chat with your documents!** 🚀
