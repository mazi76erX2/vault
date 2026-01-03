import ollama
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ..models import Document


class VectorService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_embedding(self, text: str) -> list:
        """Generate embedding using local Ollama"""
        response = ollama.embeddings(
            model="nomic-embed-text",
            prompt=text
        )
        return response['embedding']

    async def add_document_with_embedding(
        self,
        title: str,
        content: str,
        company_reg_no: str
    ) -> Document:
        """Create document with vector embedding"""
        embedding = await self.generate_embedding(content)

        doc = Document(
            title=title,
            content=content,
            embedding=embedding,
            company_reg_no=company_reg_no
        )

        self.db.add(doc)
        await self.db.commit()
        await self.db.refresh(doc)
        return doc

    async def similarity_search(
        self,
        query: str,
        company_reg_no: str,
        limit: int = 5
    ) -> list[tuple[Document, float]]:
        """Search documents by semantic similarity"""
        query_embedding = await self.generate_embedding(query)

        # Cosine similarity search with tenant filtering
        stmt = (
            select(
                Document,
                Document.embedding.cosine_distance(query_embedding).label('distance')
            )
            .where(Document.company_reg_no == company_reg_no)
            .order_by('distance')
            .limit(limit)
        )

        result = await self.db.execute(stmt)
        return [(doc, 1 - distance) for doc, distance in result.all()]
