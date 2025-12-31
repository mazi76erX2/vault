

# Stage 1: builder
FROM python:3.14-slim AS builder

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_PROJECT_ENVIRONMENT=/opt/venv \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:/usr/local/bin:$PATH"

# uv binary
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

WORKDIR /app

# Build deps (only in builder)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl git pkg-config \
    libcairo2-dev \
    gcc build-essential \
    libldap-dev libsasl2-dev libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Dependency layer (best cache hit rate)
# Copy ONLY dependency files first for better caching
COPY pyproject.toml ./
COPY uv.lock ./
COPY README.md ./

# Sync dependencies (creates venv at /opt/venv)
RUN uv sync --frozen --no-dev

# Now copy the app (separate layer so deps cache properly)
COPY . .

# Stage 2: runtime
FROM python:3.14-slim AS runtime

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH="/app" \
    VIRTUAL_ENV=/opt/venv \
    PATH="/opt/venv/bin:/usr/local/bin:$PATH"

WORKDIR /app

# Runtime libs only - FIXED package names for Debian Trixie
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libcairo2 \
    libldap-common \
    libsasl2-2 \
    libssl3t64 \
    && rm -rf /var/lib/apt/lists/*

# Copy the virtualenv from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY --from=builder /app /app

EXPOSE 7860

HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -fsS http://localhost:7860/health || exit 1

# Use main:app (your main.py is in root, not app/)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
