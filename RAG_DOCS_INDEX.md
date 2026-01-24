# RAG Documentation Index

Complete reference guide for the Vault RAG implementation.

## 📚 Documentation Files

### Quick Start (Start Here!)
- **[RAG_QUICKSTART.md](./RAG_QUICKSTART.md)** - 5-minute setup guide
  - Installation steps
  - Testing instructions
  - Common tasks
  - Troubleshooting

### Complete Implementation Guide
- **[RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md)** - Comprehensive technical reference
  - Architecture overview
  - Backend implementation details
  - Frontend components
  - Configuration options
  - Database schema
  - Performance optimization
  - Testing procedures

### Implementation Summary
- **[RAG_IMPLEMENTATION_SUMMARY.md](./RAG_IMPLEMENTATION_SUMMARY.md)** - What was built
  - Completed phases
  - Files created/modified
  - Key features
  - Performance benchmarks
  - Testing instructions

### Comparison Analysis
- **[CLOUDFLARE_COMPARISON.md](./CLOUDFLARE_COMPARISON.md)** - How Vault compares
  - Feature comparison matrix
  - Your advantages
  - Learning opportunities
  - Cost analysis
  - When to choose which

### This File
- **[RAG_DOCS_INDEX.md](./RAG_DOCS_INDEX.md)** - Documentation navigator (you are here)

## 🎯 Quick Navigation by Use Case

### I want to...

#### Get started quickly
→ Read: [RAG_QUICKSTART.md](./RAG_QUICKSTART.md)

#### Understand the architecture
→ Read: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Architecture section

#### Learn what was implemented
→ Read: [RAG_IMPLEMENTATION_SUMMARY.md](./RAG_IMPLEMENTATION_SUMMARY.md)

#### See how it compares to other systems
→ Read: [CLOUDFLARE_COMPARISON.md](./CLOUDFLARE_COMPARISON.md)

#### Configure the system
→ Read: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Configuration section

#### Test the API
→ Read: [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) - Testing section

#### Deploy to production
→ Read: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Deployment section

#### Optimize performance
→ Read: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Performance section

#### Integrate with my code
→ Read: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Integration section

#### Debug issues
→ Read: [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) - Troubleshooting section

#### Understand the database schema
→ Read: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Database schema section

## 🔍 Code File References

### Backend Services

#### RAG Pipeline (Core)
- **File:** `vault/app/services/rag_pipeline.py`
- **Purpose:** Main RAG orchestrator
- **Key Classes:** `RAGPipeline`, `RAGResponse`, `RAGConfig`
- **Methods:** `query()`, `retrieve()`, `generate()`
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - RAG Pipeline section

#### Hybrid Search
- **File:** `vault/app/services/hybrid_search.py`
- **Purpose:** Vector + keyword search with RRF
- **Key Classes:** `HybridSearchService`, `SearchResult`
- **Methods:** `search()`, `vector_only_search()`
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Hybrid Search section

#### Smart Chunker
- **File:** `vault/app/services/chunker.py`
- **Purpose:** Intelligent document splitting
- **Key Classes:** `SmartChunker`, `ChunkConfig`
- **Methods:** `chunk()`, `chunk_with_context()`
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Smart Chunker section

#### Ollama Client
- **File:** `vault/app/services/ollama_client.py`
- **Purpose:** Cloud-first LLM with local fallback
- **Key Classes:** `OllamaClient`, `OllamaConfig`
- **Methods:** `embed_async()`, `generate_rag_response()`
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Backend Implementation

#### Reranker
- **File:** `vault/app/services/reranker.py`
- **Purpose:** Cross-encoder reranking
- **Key Classes:** `BaseReranker`, `RankedDocument`
- **Methods:** `rerank()`
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Hybrid Search section

### API Endpoints

#### RAG API
- **File:** `vault/app/api/rag.py`
- **Routes:**
  - `POST /api/v1/rag/ask` - Ask questions with sources
  - `POST /api/v1/rag/find` - Find relevant documents
  - `GET /api/v1/rag/stats` - Get statistics
  - `GET /api/v1/rag/health` - Health check
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - API Endpoints section

### Schemas

#### RAG Schemas
- **File:** `vault/app/schemas/rag.py`
- **Classes:**
  - `RAGQueryRequest` - Request schema
  - `RAGQueryResponse` - Response schema
  - `RetrieveResponse` - Document retrieval response
  - `PerformanceMetrics` - Performance tracking
  - `StatsResponse` - System statistics
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Schemas section

### Configuration

#### Settings
- **File:** `vault/app/core/config.py`
- **Key Settings:**
  - `USE_HYBRID_SEARCH`
  - `VECTOR_WEIGHT`, `KEYWORD_WEIGHT`
  - `USE_RERANKER`
  - `USE_QUERY_EXPANSION`
  - `RETRIEVAL_TOP_K`, `RETRIEVAL_FINAL_K`
  - Model configurations
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Configuration section

### Frontend Components

#### Chat Page
- **File:** `vault-ui/src/pages/ChatPage.tsx`
- **Features:**
  - Real-time chat interface
  - Source display with scores
  - Performance metrics
  - Error handling
- **Route:** `/rag/chat`
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Frontend section

#### Dashboard
- **File:** `vault-ui/src/features/dashboard/Dashboard.tsx`
- **Features:**
  - System statistics
  - Live metrics
  - Feature checklist
  - Auto-refresh
- **Route:** `/rag/dashboard`
- **Related Doc:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Frontend section

#### Dashboard Page
- **File:** `vault-ui/src/pages/DashboardPage.tsx`
- **Purpose:** Page wrapper for Dashboard component

### Routes

#### Route Configuration
- **File:** `vault-ui/src/routes/Routes.tsx`
- **New Routes:**
  - `/rag/chat` - Chat interface (ChatPage)
  - `/rag/dashboard` - Dashboard (DashboardPage)
- **Related Doc:** [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) - Accessing features section

## 📊 Performance Reference

### Expected Latencies
| Stage | Time |
|-------|------|
| Embedding | 45ms |
| Search | 123ms |
| Reranking | 89ms |
| Generation | 2340ms |
| **Total** | **2598ms** |

See: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Performance Optimization section

## 🔐 Security & Data Sovereignty

Your advantages:
- ✅ Data stays on your servers
- ✅ No vendor lock-in
- ✅ Full control over models
- ✅ Offline capability
- ✅ Customizable access controls

See: [CLOUDFLARE_COMPARISON.md](./CLOUDFLARE_COMPARISON.md) - Your Advantages section

## 🛠️ Configuration Examples

### Fast Response (Latency-Optimized)
```python
USE_HYBRID_SEARCH=true
USE_RERANKER=false           # Skip reranking
USE_QUERY_EXPANSION=false    # Skip query enhancement
RETRIEVAL_TOP_K=10           # Fewer candidates
RETRIEVAL_FINAL_K=3          # Fewer results
```

### High Quality (Accuracy-Optimized)
```python
USE_HYBRID_SEARCH=true
USE_RERANKER=true            # Enable reranking
USE_QUERY_EXPANSION=true     # Enhanced queries
USE_HYDE=true                # Hypothetical embeddings
RETRIEVAL_TOP_K=50           # More candidates
RETRIEVAL_FINAL_K=10         # More results
VECTOR_WEIGHT=0.8            # Emphasize semantics
```

### Balanced (Recommended)
```python
USE_HYBRID_SEARCH=true
USE_RERANKER=true
USE_QUERY_EXPANSION=true
USE_HYDE=false
RETRIEVAL_TOP_K=20
RETRIEVAL_FINAL_K=5
VECTOR_WEIGHT=0.7
KEYWORD_WEIGHT=0.3
```

See: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Configuration Options section

## 🧪 Testing Procedures

### Unit Testing
See: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Testing section

### Integration Testing
See: [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) - Testing instructions

### Performance Testing
```bash
# Monitor real-time metrics
watch 'curl -s http://localhost:7860/api/v1/rag/stats \
  -H "Authorization: Bearer TOKEN" | jq'
```

## 🚀 Deployment Checklist

- [ ] Configure `.env` with production settings
- [ ] Set up PostgreSQL with pgvector
- [ ] Configure Ollama for fallback
- [ ] Set up Gemini API credentials
- [ ] Run database migrations
- [ ] Start backend services
- [ ] Build and deploy frontend
- [ ] Test all endpoints
- [ ] Monitor performance metrics
- [ ] Set up logging/alerting

See: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Deployment section

## 📈 Optimization Strategies

### Embedding Optimization
- Use batch processing
- Cache embeddings for FAQ
- Consider smaller models for speed

### Search Optimization
- Tune `VECTOR_WEIGHT` and `KEYWORD_WEIGHT`
- Adjust `RETRIEVAL_TOP_K`
- Enable/disable reranking

### Generation Optimization
- Lower `GENERATION_TEMPERATURE` for deterministic
- Reduce `GENERATION_MAX_TOKENS`
- Use local Ollama for privacy

See: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Optimization section

## 🔗 Integration Points

### With Knowledge Base
- Upload documents → Auto-chunk → Store embeddings
- File: `vault/app/api/knowledge_base.py`

### With Chat
- Submit query → RAG pipeline → Display response
- File: `vault-ui/src/pages/ChatPage.tsx`

### With Dashboard
- Fetch stats → Display metrics → Auto-refresh
- File: `vault-ui/src/features/dashboard/Dashboard.tsx`

## 🆘 Troubleshooting Guide

### Issue: 401 Unauthorized
**Solution:** Check authentication token
**Reference:** [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) - Troubleshooting section

### Issue: No Documents Found
**Solution:** Verify KB upload completed
**Reference:** [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) - Troubleshooting section

### Issue: Slow Responses
**Solution:** Disable reranker or query expansion
**Reference:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Error Handling section

### Issue: Ollama Connection Error
**Solution:** Start Ollama and pull models
**Reference:** [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) - Troubleshooting section

## 📚 Learning Resources

### Recommended Reading Order

1. **Quick Intro:** [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) (5 min)
2. **Architecture:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) - Architecture (10 min)
3. **Implementation:** [RAG_IMPLEMENTATION_SUMMARY.md](./RAG_IMPLEMENTATION_SUMMARY.md) (10 min)
4. **Comparison:** [CLOUDFLARE_COMPARISON.md](./CLOUDFLARE_COMPARISON.md) (15 min)
5. **Full Guide:** [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) (30 min)
6. **Code:** Review `rag_pipeline.py` (20 min)

### External Resources

#### Concepts
- [RRF in Information Retrieval](https://en.wikipedia.org/wiki/Reciprocal_rank_fusion)
- [pgvector Documentation](https://github.com/pgvector/pgvector)
- [Cross-Encoder Reranking](https://www.sbert.net/examples/applications/cross-encoder/README.html)
- [RAG Patterns (Paper)](https://arxiv.org/abs/2312.10997)

#### Tools
- [Ollama](https://ollama.ai) - Local LLMs
- [pgvector](https://github.com/pgvector/pgvector) - Vector DB
- [LangChain](https://python.langchain.com) - LLM framework
- [FastAPI](https://fastapi.tiangolo.com) - Web framework
- [React](https://react.dev) - Frontend framework

## 🎯 Goals Achieved

### Phase 1: Core Infrastructure ✅
- [x] Config with RAG settings
- [x] Ollama client with optimizations
- [x] Database indexes

### Phase 2: Search & Ranking ✅
- [x] Reranker service
- [x] Hybrid search service
- [x] Full-text search models

### Phase 3: RAG Pipeline ✅
- [x] Complete pipeline
- [x] API endpoints
- [x] Query enhancement

### Phase 4: Testing ✅
- [x] Hybrid search tested
- [x] Reranking tested
- [x] Cloud-first strategy verified

### Phase 5: Frontend ✅
- [x] Chat interface
- [x] TailwindCSS styling
- [x] API integration

### Phase 6: Advanced Features ✅
- [x] Smart chunker
- [x] Dashboard backend
- [x] Dashboard UI

## 🎓 Next Learning Steps

### For Developers
1. Review `rag_pipeline.py` code
2. Understand RRF score fusion
3. Test with curl/postman
4. Customize prompts
5. Add custom metrics

### For DevOps
1. Set up PostgreSQL cluster
2. Configure Ollama service
3. Deploy with Docker/K8s
4. Set up monitoring
5. Configure logging

### For Product
1. Define RAG use cases
2. Set quality metrics
3. Plan feedback loop
4. Design analytics
5. Plan rollout strategy

## 📞 Support

### Documentation
- All docs start with [RAG_QUICKSTART.md](./RAG_QUICKSTART.md)
- Full reference: [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md)
- Code comments: Review source files

### Debug Commands

```bash
# Check health
curl http://localhost:7860/health

# Check RAG stats
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:7860/api/v1/rag/stats

# View logs
tail -f vault/backend_logs.log

# Test RAG endpoint
curl -X POST http://localhost:7860/api/v1/rag/ask \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "test"}'
```

---

## 📋 Document Summary

| Document | Purpose | Read Time |
|----------|---------|-----------|
| [RAG_QUICKSTART.md](./RAG_QUICKSTART.md) | Get started in 5 minutes | 5 min |
| [RAG_INTEGRATION_GUIDE.md](./RAG_INTEGRATION_GUIDE.md) | Technical reference | 30 min |
| [RAG_IMPLEMENTATION_SUMMARY.md](./RAG_IMPLEMENTATION_SUMMARY.md) | What was built | 10 min |
| [CLOUDFLARE_COMPARISON.md](./CLOUDFLARE_COMPARISON.md) | How it compares | 15 min |
| [RAG_DOCS_INDEX.md](./RAG_DOCS_INDEX.md) | Navigation guide | 5 min |

**Total:** 65 minutes of comprehensive documentation

---

**Last Updated:** 2026-01-24  
**Version:** 1.0  
**Status:** Complete and Production-Ready ✅

Ready to chat with your documents? Start with [RAG_QUICKSTART.md](./RAG_QUICKSTART.md)! 🚀
