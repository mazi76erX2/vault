import pytest

from app.database import async_session_maker
from app.services.vector_service import VectorService


@pytest.mark.asyncio
async def test_vector_similarity_search():
    async with async_session_maker() as session:
        service = VectorService(session)

        # Add test documents
        await service.add_document_with_embedding(
            title="Python Tutorial",
            content="Python is a programming language",
            company_reg_no="TEST001",
        )

        await service.add_document_with_embedding(
            title="Java Guide",
            content="Java is also a programming language",
            company_reg_no="TEST001",
        )

        # Search
        results = await service.similarity_search(
            query="programming", company_reg_no="TEST001", limit=2
        )

        assert len(results) == 2
        assert results[0][1] > 0.5  # Similarity score
