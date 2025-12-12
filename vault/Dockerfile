FROM python:3.14-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH="/app"

WORKDIR /app

# Install system dependencies including LDAP development libraries
RUN apt-get update && apt-get install -y \
    curl \
    git \
    pkg-config \
    libcairo2-dev \
    gcc \
    libldap2-dev \
    libsasl2-dev \
    libssl-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies with retries for large packages
RUN pip install --upgrade pip && \
    pip install --timeout=1000 --retries=5 -r requirements.txt

# Copy application code
COPY . .

# Create startup script using traditional RUN approach
RUN echo '#!/bin/bash\n\
echo "🚀 Starting HICO Vault Container..."\n\
\n\
# Wait for database\n\
echo "⏳ Waiting for database..."\n\
sleep 5\n\
\n\
# Verify database connection\n\
echo "✅ Verifying database connection..."\n\
python scripts/setup_supabase_database.py --verify || echo "⚠️ Database verification failed"\n\
\n\
echo "🚀 Starting HICO Vault application..."\n\
exec uvicorn main:app --host 0.0.0.0 --port 7860 --reload' > /app/startup.sh

RUN chmod +x /app/startup.sh

EXPOSE 7860

CMD ["/app/startup.sh"]