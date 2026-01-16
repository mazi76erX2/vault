# Stage 1: builder
FROM python:3.14-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

# UV binary
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Build dependencies (only in builder)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    git \
    pkg-config \
    gcc \
    g++ \
    build-essential \
    # LDAP dependencies
    libldap2-dev \
    libsasl2-dev \
    libssl-dev \
    # Cairo dependencies
    libcairo2-dev \
    # OCR dependencies
    tesseract-ocr \
    libtesseract-dev \
    tesseract-ocr-eng \
    # Audio processing dependencies
    ffmpeg \
    libavcodec-dev \
    libavformat-dev \
    libavutil-dev \
    libswscale-dev \
    libswresample-dev \
    # Image processing
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files
COPY pyproject.toml uv.lock README.md ./

# Create venv and sync dependencies (production only, no dev)
RUN uv venv /app/.venv && \
    uv sync --no-dev

# Copy application code
COPY . .

# Stage 2: runtime
FROM python:3.14-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH="/app" \
    PATH="/app/.venv/bin:/usr/local/bin:$PATH" \
    TESSDATA_PREFIX="/usr/share/tesseract-ocr/5/tessdata"

WORKDIR /app

# Runtime libraries only (smaller footprint)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    # LDAP runtime
    libldap-2.5-0 \
    libsasl2-2 \
    libssl3t64 \
    # Cairo runtime
    libcairo2 \
    # OCR runtime
    tesseract-ocr \
    tesseract-ocr-eng \
    # Audio runtime
    ffmpeg \
    # Image runtime
    libjpeg62-turbo \
    libpng16-16 \
    libtiff6 \
    && rm -rf /var/lib/apt/lists/*

# Copy the virtualenv from builder
COPY --from=builder /app/.venv /app/.venv

# Copy application code
COPY --from=builder /app /app

# Create upload directories
RUN mkdir -p /app/uploads/kb /app/uploads/audio /app/logs

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:7860/health || exit 1

# Use full path to uvicorn
CMD ["/app/.venv/bin/uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
