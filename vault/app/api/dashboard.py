"""
Dashboard API for RAG performance metrics.
"""


from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/dashboard", tags=["dashboard"])


class DashboardStats(BaseModel):
    total_queries: int
    avg_latency_ms: float
    cache_hit_rate: float
    queries_last_24h: int


class QueryLog(BaseModel):
    timestamp: str
    query: str
    total_ms: float
    search_ms: float
    generation_ms: float | None
    embedding_ms: float
    model: str | None


# In-memory mock store for demo purposes
# In production, this would read from DB
MOCK_STATS = DashboardStats(
    total_queries=1240,
    avg_latency_ms=450.5,
    cache_hit_rate=0.85,
    queries_last_24h=156,
)

MOCK_HISTORY: list[QueryLog] = [
    QueryLog(
        timestamp="2024-03-20T10:30:00Z",
        query="What is the remote work policy?",
        total_ms=450,
        search_ms=120,
        generation_ms=300,
        embedding_ms=30,
        model="gpt-3.5-turbo",
    ),
    QueryLog(
        timestamp="2024-03-20T10:35:00Z",
        query="How to reset password?",
        total_ms=320,
        search_ms=100,
        generation_ms=200,
        embedding_ms=20,
        model="gpt-3.5-turbo",
    ),
]


@router.get("/stats", response_model=DashboardStats)
async def get_stats() -> DashboardStats:
    """Get dashboard statistics."""
    return MOCK_STATS


@router.get("/history", response_model=list[QueryLog])
async def get_history() -> list[QueryLog]:
    """Get recent query history."""
    return MOCK_HISTORY
