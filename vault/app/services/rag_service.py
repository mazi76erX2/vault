from __future__ import annotations

from sqlalchemy import func, text
from sqlalchemy.ext.asyncio import AsyncSession

# ... imports ...

async def retrieve(db: AsyncSession, question: str, top_k: int = 10) -> list[RetrievedChunk]:
    """Hybrid Retrieval: pgvector (Dense) + TSVector (Sparse) + RRF."""
    q_emb = embed(question)

    # 1. Semantic Search (Dense)
    dense_stmt = (
        db.query(KBChunk, KBChunk.embedding.cosine_distance(q_emb).label("distance"))
        .order_by("distance")
        .limit(top_k * 2)
    )
    # Wait, db.query is not supported in AsyncSession 2.0 style usually, but some setups allow it.
    # Standard AsyncSession usage is select(KBChunk).
    # Let's use select() which is standard for 2.0

    from sqlalchemy import select

    dense_stmt = (
        select(KBChunk, KBChunk.embedding.cosine_distance(q_emb).label("distance"))
        .order_by("distance")
        .limit(top_k * 2)
    )
    result = await db.execute(dense_stmt)
    dense_hits = result.all()

    # 2. Text Search (Sparse)
    sparse_stmt = (
        select(KBChunk, func.ts_rank_cd(KBChunk.tsv, func.plainto_tsquery("english", question)).label("rank"))
        .filter(KBChunk.tsv.op("@@")(func.plainto_tsquery("english", question)))
        .order_by(text("rank DESC"))
        .limit(top_k * 2)
    )
    result = await db.execute(sparse_stmt)
    sparse_hits = result.all()

    # 3. Fusion (RRF)
    # ... logic remains same ...
    fused_results = reciprocal_rank_fusion(dense_hits, sparse_hits)

    # ... mapping ...
    items: list[RetrievedChunk] = []
    for chunk, fusion_score in fused_results:
        items.append(
            RetrievedChunk(
                doc_id=str(chunk.doc_id),
                chunk_index=chunk.chunk_index,
                title=chunk.title,
                sourcefile=chunk.sourcefile,
                content=chunk.content,
                accesslevel=chunk.accesslevel,
                score=float(fusion_score),
            )
        )

    # 5. Reranking using Ollama
    if settings.USE_RERANKER:
        items = rerank_chunks_with_ollama(question, items, limit=settings.KB_TOP_K)

    return items[:settings.KB_TOP_K]


def build_messages(question: str, chunks: list[RetrievedChunk]) -> list[dict]:
    # ... (same) ...
    context = "\n\n---\n\n".join(
        [
            f"TITLE: {c.title or ''}\nSOURCE: {c.sourcefile or ''}\nCONTENT:\n{c.content}"
            for c in chunks
        ]
    ).strip()

    system = (
        "You are a helpful assistant. "
        "Answer using ONLY the provided context. "
        "If the context does not contain the answer, say you couldn't find it in the knowledge base."
    )

    user = f"CONTEXT:\n{context}\n\nQUESTION:\n{question}"
    return [{"role": "system", "content": system}, {"role": "user", "content": user}]


async def answer(db: AsyncSession, question: str) -> str:
    chunks = await retrieve(db, question, top_k=settings.KB_TOP_K)
    if not chunks:
        return "I couldn't find any information on that topic in the knowledge base."

    messages = build_messages(question, chunks)
    return chat(messages)
