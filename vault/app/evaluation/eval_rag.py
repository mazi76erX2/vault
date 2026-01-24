import os
import json
import logging
import asyncio
import pandas as pd
from typing import List, Dict

# Ragas imports
from ragas import EvaluationDataset, evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall
from ragas.llms import LangchainLLMWrapper
from ragas.embeddings import LangchainEmbeddingsWrapper

# Langchain imports for Ollama
from langchain_community.chat_models import ChatOllama
from langchain_community.embeddings import OllamaEmbeddings

# Internal logic imports
from app.services import rag_service
from app.core.database import SessionLocal
from app.core.config import settings

logger = logging.getLogger(__name__)

# Wrap local Ollama for Ragas
eval_llm = LangchainLLMWrapper(ChatOllama(model=settings.OLLAMA_CHAT_MODEL))
eval_embeddings = LangchainEmbeddingsWrapper(OllamaEmbeddings(model=settings.OLLAMA_EMBED_MODEL))

async def prepare_mock_testset() -> List[Dict]:
    """
    Generates or loads a testset for evaluation.
    Ideally, this would load from huggingface/vectara/open_ragbench.
    For this demo/validation, we use a sample financial-legal set.
    """
    return [
        {
            "question": "What is the policy for processing high-risk financial transactions?",
            "ground_truth": "High-risk transactions require dual-authorization from a senior manager and must be logged in the secure vault system."
        },
        {
            "question": "How long are legal audit logs retained?",
            "ground_truth": "Legal audit logs are retained for a minimum of 7 years in compliance with regional financial regulations."
        },
        {
            "question": "Who has access to the critical level documents?",
            "ground_truth": "Only users with 'Admin' role and explicit 'Critical' clearance can access these documents."
        }
    ]

async def run_evaluation():
    """
    Run Ragas evaluation on the optimized pgvector RAG pipeline.
    """
    logger.info("Initializing RAG Evaluation...")
    
    test_data = await prepare_mock_testset()
    results = []
    
    db = SessionLocal()
    try:
        for item in test_data:
            question = item["question"]
            
            # Run our optimized RAG pipeline
            # Note: generate_response_helper is the entry point used by chat
            # We call rag_service.answer directly for cleaner eval
            response = rag_service.answer(db, question)
            
            # Retrieve chunks for context metrics
            chunks = rag_service.retrieve(db, question, top_k=settings.KB_TOP_K)
            contexts = [c.content for c in chunks]
            
            results.append({
                "user_input": question,
                "response": response,
                "retrieved_contexts": contexts,
                "reference": item["ground_truth"]
            })

        # Convert to Ragas Dataset
        dataset = EvaluationDataset.from_list(results)
        
        # Run evaluation using local Ollama models
        score = evaluate(
            dataset,
            metrics=[faithfulness, answer_relevancy, context_precision, context_recall],
            llm=eval_llm,
            embeddings=eval_embeddings
        )
        
        df = score.to_pandas()
        print("\n=== RAG Evaluation Results (pgvector + Ollama Judge) ===")
        print(df)
        
        # Save results
        results_dir = os.path.dirname(__file__)
        df.to_csv(os.path.join(results_dir, "eval_results.csv"), index=False)
        
        # Generate Markdown summary for root README
        summary_md = df.mean(numeric_only=True).to_frame().T.to_markdown()
        readme_path = os.path.join(os.getcwd(), "RAG_PERFORMANCE.md")
        with open(readme_path, "w") as f:
            f.write("# RAG Performance Optimization Report\n\n")
            f.write("## Metrics Summary\n\n")
            f.write(summary_md)
            f.write("\n\n## Technical details\n")
            f.write("- **Engine**: pgvector (PostgreSQL)\n")
            f.write("- **Search**: Hybrid (Dense Embedding + Sparse TSVector)\n")
            f.write("- **Ranking**: RRF + Ollama Judge (llama3.2:1b)\n")
            f.write("- **Chunking**: Recursive (1000/150)\n\n")
            f.write("## Detailed Results\n")
            f.write(df.to_markdown(index=False))

        print(f"\nOptimization report generated: {readme_path}")

    finally:
        db.close()

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    asyncio.run(run_evaluation())
