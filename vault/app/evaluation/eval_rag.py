"""
Complete RAG Evaluation Suite.

This module provides:
1. Seed sample documents into knowledge base
2. Run RAG queries against real documents
3. Evaluate with Ragas metrics
4. Generate performance report
"""

import asyncio
import logging
import os
import warnings

# Suppress Pydantic V1 warning
warnings.filterwarnings("ignore", message="Core Pydantic V1 functionality")

from langchain_ollama import ChatOllama, OllamaEmbeddings
from ragas import EvaluationDataset, evaluate
from ragas.embeddings import LangchainEmbeddingsWrapper
from ragas.llms import LangchainLLMWrapper

from app.core.config import settings
from app.core.database import async_session_maker
from app.evaluation.sample_data import SAMPLE_DOCUMENTS, TEST_QUESTIONS
from app.services.rag_pipeline import get_rag_pipeline

logger = logging.getLogger(__name__)


# Configure Ragas with LangChain-Ollama wrappers
eval_llm = LangchainLLMWrapper(ChatOllama(
    model="gemma3:4b",
    base_url=settings.OLLAMA_HOST,
    temperature=0.1,
    num_predict=512,
))

eval_embeddings = LangchainEmbeddingsWrapper(OllamaEmbeddings(
    model=settings.OLLAMA_EMBED_MODEL,
    base_url=settings.OLLAMA_HOST,
))


async def seed_knowledge_base(force: bool = False) -> int:
    """
    Seed the knowledge base with sample documents.
    
    Args:
        force: If True, seed even if KB already has documents
        
    Returns:
        Number of documents seeded
    """
    import uuid

    from sqlalchemy import text

    from app.integrations.ollama_client import embed
    from app.models.kb import KBChunk

    async with async_session_maker() as db:
        # Check if KB already has data
        result = await db.execute(text("SELECT COUNT(*) FROM kb_chunks"))
        count = result.scalar()

        if count > 0 and not force:
            logger.info(f"KB already has {count} chunks. Skipping seed (use force=True to override)")
            return 0

        # Clear existing data if forcing
        if force and count > 0:
            logger.info(f"Clearing {count} existing chunks...")
            await db.execute(text("DELETE FROM kb_chunks"))
            await db.commit()

        # Seed each document directly to kb_chunks
        total_chunks = 0
        for doc in SAMPLE_DOCUMENTS:
            logger.info(f"Seeding: {doc['title']}")

            content = doc["content"].strip()

            # Generate embedding
            embedding = embed(content)

            # Create chunk directly (bypassing kb_service)
            chunk = KBChunk(
                id=uuid.uuid4(),
                doc_id=uuid.uuid4(),  # Fake doc_id for standalone seeding
                chunk_index=0,
                content=content,
                embedding=embedding,
                title=doc["title"],
                source_file=f"{doc['title'].lower().replace(' ', '_')}.md",
                company_id=1,  # Default test company
                company_reg_no="TEST001",
                access_level=doc["access_level"],
                department=doc["department"],
            )
            db.add(chunk)
            total_chunks += 1
            logger.info("  -> Created chunk with embedding")

        await db.commit()
        logger.info(f"✅ Seeded {len(SAMPLE_DOCUMENTS)} documents ({total_chunks} chunks)")
        return total_chunks


async def run_rag_evaluation() -> dict:
    """
    Run RAG evaluation against test questions.
    
    Returns:
        Dictionary with evaluation results and metrics
    """
    logger.info("=" * 60)
    logger.info("RAG EVALUATION SUITE")
    logger.info("=" * 60)

    # Step 1: Ensure KB is seeded
    logger.info("\n[Step 1] Checking knowledge base...")
    chunks_seeded = await seed_knowledge_base()
    if chunks_seeded > 0:
        logger.info(f"Seeded {chunks_seeded} new chunks")

    # Step 2: Run RAG queries
    logger.info("\n[Step 2] Running RAG queries...")
    pipeline = get_rag_pipeline()
    results = []

    async with async_session_maker() as db:
        for i, item in enumerate(TEST_QUESTIONS, 1):
            question = item["question"]
            logger.info(f"  [{i}/{len(TEST_QUESTIONS)}] {question[:60]}...")

            # Retrieve documents
            documents = await pipeline.retrieve(
                db,
                question,
                top_k=settings.RETRIEVAL_FINAL_K
            )

            if not documents:
                logger.warning("    ⚠ No documents retrieved!")
            else:
                logger.info(f"    ✓ Retrieved {len(documents)} documents")

            # Generate response
            rag_response = await pipeline.generate(question, documents)

            contexts = [doc.content for doc in documents]

            results.append({
                "user_input": question,
                "response": rag_response.answer,
                "retrieved_contexts": contexts,
                "reference": item["ground_truth"],
            })

    # Step 3: Run Ragas evaluation
    logger.info("\n[Step 3] Running Ragas evaluation...")
    dataset = EvaluationDataset.from_list(results)

    # Import legacy metrics (compatible with evaluate())
    from ragas.metrics import answer_relevancy, faithfulness

    score = evaluate(
        dataset,
        metrics=[faithfulness, answer_relevancy],
        llm=eval_llm,
        embeddings=eval_embeddings,
    )

    df = score.to_pandas()

    # Step 4: Generate report
    logger.info("\n[Step 4] Generating report...")

    print("\n" + "=" * 60)
    print("RAG EVALUATION RESULTS")
    print("=" * 60)
    print(df.to_string())
    print("\n" + "-" * 60)
    print("AGGREGATE SCORES")
    print("-" * 60)
    print(df[["faithfulness", "answer_relevancy"]].mean().to_string())

    # Save detailed results
    results_dir = os.path.dirname(__file__)
    csv_path = os.path.join(results_dir, "eval_results.csv")
    df.to_csv(csv_path, index=False)
    logger.info(f"Results saved to: {csv_path}")

    # Generate markdown report
    report_path = os.path.join(os.getcwd(), "RAG_PERFORMANCE.md")
    with open(report_path, "w") as f:
        f.write("# RAG Performance Evaluation Report\n\n")
        f.write(f"**Evaluation Date**: {__import__('datetime').datetime.now().isoformat()}\n\n")

        f.write("## Summary Metrics\n\n")
        means = df[["faithfulness", "answer_relevancy"]].mean()
        f.write("| Metric | Score |\n")
        f.write("|--------|-------|\n")
        f.write(f"| Faithfulness | {means['faithfulness']:.3f} |\n")
        f.write(f"| Answer Relevancy | {means['answer_relevancy']:.3f} |\n")

        f.write("\n## Technical Configuration\n\n")
        f.write("- **Engine**: pgvector (PostgreSQL)\n")
        f.write("- **Search**: Hybrid (Dense Embedding + Sparse TSVector)\n")
        f.write(f"- **Ranking**: RRF + Reranker ({settings.RERANKER_PROVIDER})\n")
        f.write(f"- **Chunking**: {settings.KB_CHUNK_SIZE}/{settings.KB_CHUNK_OVERLAP}\n")
        f.write(f"- **Embedding Model**: {settings.OLLAMA_EMBED_MODEL}\n")
        f.write("- **LLM Judge**: gemma3:4b\n")

        f.write("\n## Detailed Results\n\n")
        f.write(df.to_markdown(index=False))

        f.write("\n\n## Interpretation Guide\n\n")
        f.write("- **Faithfulness (0-1)**: How well the answer is grounded in retrieved context. Higher = better.\n")
        f.write("- **Answer Relevancy (0-1)**: How relevant the answer is to the question. Higher = better.\n")
        f.write("\n**Target Scores**: Production systems typically aim for >0.7 on both metrics.\n")

    logger.info(f"Report saved to: {report_path}")

    return {
        "faithfulness": float(means["faithfulness"]),
        "answer_relevancy": float(means["answer_relevancy"]),
        "num_questions": len(TEST_QUESTIONS),
        "report_path": report_path,
    }


async def quick_retrieval_test() -> None:
    """
    Quick test to verify retrieval is working.
    Useful for debugging before running full evaluation.
    """
    logger.info("Quick Retrieval Test")
    logger.info("-" * 40)

    # Seed if needed
    await seed_knowledge_base()

    pipeline = get_rag_pipeline()
    test_query = "What is the policy for high-risk transactions?"

    async with async_session_maker() as db:
        docs = await pipeline.retrieve(db, test_query, top_k=3)

        print(f"\nQuery: {test_query}")
        print(f"Retrieved {len(docs)} documents:\n")

        for i, doc in enumerate(docs, 1):
            print(f"[{i}] Score: {doc.score:.4f}")
            print(f"    Content: {doc.content[:200]}...")
            print()


if __name__ == "__main__":
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(levelname)s - %(message)s"
    )

    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "--quick":
        # Quick retrieval test
        asyncio.run(quick_retrieval_test())
    else:
        # Full evaluation
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            results = loop.run_until_complete(run_rag_evaluation())
            print("\n✅ Evaluation complete!")
            print(f"   Faithfulness: {results['faithfulness']:.3f}")
            print(f"   Answer Relevancy: {results['answer_relevancy']:.3f}")
        finally:
            loop.close()
